from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import Task

@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ['id', 'title', 'priority', 'created_at', 'updated_at', 'is_completed']  
    list_filter = ['priority', 'is_completed', 'priority_score', 'due_date', 'created_at', 'updated_at']
    search_fields = ['title', 'description']
    ordering = ['-created_at']
    readonly_fields = ['created_at']