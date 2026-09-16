from django.db import models
from django.conf import settings
# Create your models here.

class Task(models.Model):
    priority_choices = [
        ('Low', 'Low'),
        ('Medium', 'Medium'),
        ('High', 'High'),
    ]
    RECURRENCE_CHOICES = [
        ('none', 'None'),
        ('daily', 'Daily'),
        ('weekly', 'Weekly'),
        ('custom', 'Custom (specific times per day)'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='tasks')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    priority = models.CharField(max_length=50, choices=priority_choices, default='Medium')
    priority_score = models.FloatField(null=True, blank=True)
    due_date = models.DateTimeField(null=True, blank=True)
    is_completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    reminder_sent = models.BooleanField(default=False)

    recurrence =models.CharField(max_length=10, choices=RECURRENCE_CHOICES, default='none')
    recurrence_time=  models.JSONField(null=True, blank=True)
    is_habit = models.BooleanField(default=False)

    class Meta:
        ordering = ['-priority_score', 'due_date']

    def __str__(self):
      return self.title

class HabitLog(models.Model):
   task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='logs')
   completed_at = models.DateTimeField(auto_now_add=True)
   scheduled_for = models.DateField()

   class Meta:
      unique_together = ('task', 'scheduled_for')

class Notification(models.Model):
   NOTIFICATION_TYPES = [
      ('habit_nudge', 'Habit Consistency Nudge'),
      ('overdue', 'Overdue Task'),
      ('upcoming', 'Upcoming Task'),
   ]

   user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='app_notifications') 
   task = models.ForeignKey(True, on_delete=models.CASCADE, null=True, blank=True, related_name='notifications')
   notification_type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES, default='habit_judge')
   message = models.TextField()
   is_read = models.BooleanField(default=False)
   created_at = models.DateTimeField(auto_now_add=True)

   class Meta:
      ordering = ['-created_at']

def __str__(self):
   return f"{self.notification_type} for {self.user.username}: {self.message[:50]}"

