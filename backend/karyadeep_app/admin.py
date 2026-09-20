from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import Task
from accounts.models import Account

@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ['id', 'title', 'priority', 'created_at', 'updated_at', 'is_completed']  
    list_filter = ['priority', 'is_completed', 'priority_score', 'due_date', 'created_at', 'updated_at']
    search_fields = ['title', 'description']
    ordering = ['-created_at']
    readonly_fields = ['created_at']

@admin.register(Account)
class AccountAdmin(UserAdmin):
    list_display = ['id', 'username', 'email', 'is_staff', 'is_active', 'created_at']
    list_filter = ['is_staff', 'is_active']
    search_fields = ['username', 'email']
    ordering = ['-created_at']
    readonly_fields = ['created_at', 'updated_at']

    fieldsets = UserAdmin.fieldsets + (
        ('Timestamps', {
            'fields': ('created_at', 'updated_at')
        }),
    )