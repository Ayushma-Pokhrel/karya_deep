from django.shortcuts import render

from rest_framework import generics, permissions, status
from .models import Task, HabitLog, Notification
from .serializers import HabitNudgeSerializer,TaskSerializer
import json
from datetime import timedelta
from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.conf import settings
from rest_framework.views import APIView

class TaskListCreateView(generics.ListCreateAPIView):
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Task.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class TaskDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Task.objects.filter(user=self.request.user)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_task_suggestion(request):
    title = request.data.get('title', '').strip()
    if not title:
        return Response({"detail": "Title is required."}, status=400)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def task_notifications(request):
    now = timezone.now()
    soon = now + timedelta(hours=24)

    overdue = Task.objects.filter(
        user=request.user,
        due_date__lt=now,
        is_completed=False,
        is_habit=False,
    ).order_by('due_date')

    upcoming = Task.objects.filter(
        user=request.user,
        due_date__range=(now, soon),
        is_completed=False,
        is_habit=False,
    ).order_by('due_date')

    def serialize(task, kind):
        return {
            "id": task.id,
            "title": task.title,
            "due_date": task.due_date.isoformat(),
            "type": kind,  
        }

    notifications = (
        [serialize(t, "overdue") for t in overdue] +
        [serialize(t, "upcoming") for t in upcoming]
    )

    return Response({
        "count": len(notifications),
        "notifications": notifications,
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def toggle_habit_completion(request, pk):
    try:
        task = Task.objects.get(pk=pk, user=request.user, is_habit=True)
    except Task.DoesNotExist:
        return Response({"detail": "Habit not found."}, status=404)

    today = timezone.localdate()
    log = HabitLog.objects.filter(task=task, scheduled_for=today).first()

    if log:
        log.delete()
        completed_today = False
    else:
        HabitLog.objects.create(task=task, scheduled_for=today)
        completed_today = True

    return Response({
        "id": task.id,
        "completed_today": completed_today,
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def habit_calendar(request, pk):
    try:
        task = Task.objects.get(pk=pk, user=request.user, is_habit=True)
    except Task.DoesNotExist:
        return Response({"detail": "Habit not found."}, status=404)

    days = int(request.query_params.get('days', 30))
    start = timezone.localdate() - timedelta(days=days - 1)
    logs = HabitLog.objects.filter(
        task=task, scheduled_for__gte=start
    ).values_list('scheduled_for', flat=True)

    return Response({
        "task_id": task.id,
        "title": task.title,
        "start_date": start.isoformat(),
        "completed_dates": [d.isoformat() for d in logs],
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def app_notifications(request):
    notes = Notification.objects.filter(user=request.user).order_by('-created_at')[:50]
    return Response([
        {
            "id": n.id,
            "type": n.notification_type,
            "message": n.message,
            "is_read": n.is_read,
            "created_at": n.created_at.isoformat(),
            "task_id": n.task_id,
        }
        for n in notes
    ])

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def mark_notification_read(request, pk):
    try:
        note = Notification.objects.get(pk=pk, user=request.user)
        note.is_read = True
        note.save(update_fields=['is_read'])
        return Response({"id": note.id, "is_read": True})
    except Notification.DoesNotExist:
        return Response({"detail": "Notification not found."}, status=404)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_habit_nudge(request, pk):
    try:
        task = Task.objects.get(pk=pk, user=request.user, is_habit=True)
    except Task.DoesNotExist:
        return Response({"detail": "Habit not found."}, status=404)

    today = timezone.localdate()
    start = today - timedelta(days=6)  # 7 days inclusive of today

    # Don't regenerate more than once a day for the same habit
    existing = Notification.objects.filter(
        task=task, notification_type='habit_nudge', created_at__date=today
    ).order_by('-created_at').first()
    if existing:
        return Response(HabitNudgeSerializer(existing).data)

    completed_count = HabitLog.objects.filter(
        task=task, scheduled_for__gte=start, scheduled_for__lte=today
    ).count()
