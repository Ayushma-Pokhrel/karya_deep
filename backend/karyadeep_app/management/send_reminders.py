from django.core.management.base import BaseCommand
from django.core.mail import send_mail
from django.utils import timezone
from datetime import timedelta
from karyadeep_app.models import Task

class Command(BaseCommand):
    help = "Sends email reminders for tasks whose deadline is approaching"

    def handle(self, *args, **options):
        now = timezone.now()
        window_start = now
        window_end = now + timedelta(hours=24)

        upcoming = Task.objects.filter(
            due_date__range=(window_start, window_end),
            is_completed=False,
            reminder_sent=False,
        ).select_related('user')

        sent_count = 0
        for task in upcoming:
            if not task.user.email:
                continue
            try:
                send_mail(
                    subject=f"Reminder: '{task.title}' is due soon",
                    message=(
                        f"Hi {task.user.username},\n\n"
                        f"Your task \"{task.title}\" is due on "
                        f"{task.due_date.strftime('%b %d, %Y at %I:%M %p')}.\n\n"
                        f"{task.description or ''}\n\n"
                        f"Complete it soon to stay on track!"
                    ),
                    from_email=None,  
                    recipient_list=[task.user.email],
                )
                task.reminder_sent = True
                task.save(update_fields=['reminder_sent'])
                sent_count += 1
            except Exception as e:
                self.stderr.write(f"Failed to email {task.user.email}: {e}")

        self.stdout.write(self.style.SUCCESS(f"Sent {sent_count} reminder email(s)"))