from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import Account

class AccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = Account
        fields = ['id', 'username', 'email', 'password', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def create(self, validated_data):
        account = Account.objects.create_user(
            username = validated_data['username'],
            email = validated_data['email'],
            password = validated_data['password']
        )
        return account

    def update(self, instance, validated_data):
        instance.username = validated_data.get('username', instance.username)
        instance.email = validated_data.get('email', instance.email)
        password = validated_data.get('password', None)
        if password:
            instance.set_password(password)
        instance.save()
        return instance    

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        from django.contrib.auth import authenticate
         # authenticate using username field but pass email as username
        try:
            user = Account.objects.get(email=data['email'])
        except Account.DoesNotExist:
            raise serializers.ValidationError("Invalid email or password.")
        
        account = authenticate(username=user.username, password=data['password'])
        if not account:
            raise serializers.ValidationError("Invalid email or password.")
        
        data['account'] = account
        return data

class ProfileSerializer(serializers.ModelSerializer):
    """Used for viewing/editing profile info only — password excluded on purpose."""
    class Meta:
        model = Account
        fields = ['id', 'username', 'email']
        read_only_fields = ['id']


class ChangePasswordSerializer(serializers.Serializer):
    current_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, min_length=8)

    def validate_current_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Current password is incorrect.")
        return value