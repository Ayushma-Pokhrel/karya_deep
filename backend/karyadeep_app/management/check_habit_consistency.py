from django.core.management.base import BaseCommand
from django.core.mail import send_mail
from django.utils import timezone
from datetime import timedelta
from django.conf import settings
from karyadeep_app.models import Task, HabitLog, Notification

LOOKBACK_DAYS = 7
CONSISTENCY_THRESHOLD = 0.6  # below 60% completion triggers a nudge