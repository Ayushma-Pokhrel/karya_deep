from datetime import timedelta
from django.utils import timezone
from rest_framework import serializers
from .models import Task, Notification

class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = [
            'id', 'title', 'description', 'priority', 'priority_score',
            'due_date', 'is_completed', 'recurrence', 'recurrence_times' 'is_habit', 'created_at', 'updated_at'
        ]
        read_only_fields = ['user', 'priority_score', 'created_at', 'updated_at']

    def validate(self, data):
         # Habits skip the "tomorrow or later" rule — they're about today, recurring
        if data.get('is_habit'):
            return data
        due_date = data.get('due_date')
        if due_date:
            tomorrow_start = (timezone.now() + timedelta(days=1)).replace(hour=0, minute=0, second=0, microsecond=0)
            if due_date < tomorrow_start:
                raise serializers.ValidationError({"due_date": "Deadline must be tomorrow or later."})
        return data

class HabitNudgeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'message', 'created_at', 'is_read']