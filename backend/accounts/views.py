from django.shortcuts import render
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes
from rest_framework_simplejwt.tokens import RefreshToken
from django_ratelimit.decorators import ratelimit
from django.utils.decorators import method_decorator
from django_ratelimit.exceptions import Ratelimited
from .models import Account
from .serializers import AccountSerializer, LoginSerializer, ProfileSerializer, ChangePasswordSerializer

class AccountListCreateView(generics.ListCreateAPIView):
    serializer_class = AccountSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]

    def get_queryset(self):
        return Account.objects.all()

class AccountDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = AccountSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Account.objects.filter(id=self.request.user.id)

@method_decorator(
    ratelimit(key='ip', rate='5/m', method='POST', block=True),
    name='dispatch'
)

class AccountLoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def handle_exception(self, exc):
        if isinstance(exc, Ratelimited):
            return Response(
                 {"error": "Too many login attempts. Please wait 1 minute and try again."},
                status=status.HTTP_429_TOO_MANY_REQUESTS
            )
        return super().handle_exception(exc)

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        account = serializer.validated_data['account']
        refresh = RefreshToken.for_user(account)

        return Response({
            "message": "Login successful.",
            "access": str(refresh.access_token),
            "refresh": str(refresh),
        }, status=status.HTTP_200_OK)

class AccountLogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def handle_exception(self, exc):
        if isinstance(exc, Ratelimited):
            return Response(
                {"error": "Too many login attempts. Please wait 1 minute and try again."},
                status=status.HTTP_429_TOO_MANY_REQUESTS
            )
        return super().handle_exception(exc)

    def post(self, request):
        try:
            refresh_token = request.data.get("refresh")
            if not refresh_token:
                return Response(
                    {"error": "Refresh token is required."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({"message": "Logout successful."}, status=status.HTTP_200_OK)
        except Exception:
            return Response({"error": "Invalid token."}, status=status.HTTP_400_BAD_REQUEST)

# ------------------- me endpoint ---------------------------
@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def me(request):
    serializer = AccountSerializer(request.user)
    return Response(serializer.data)    

class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = ProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def change_password(request):
    serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        request.user.set_password(serializer.validated_data['new_password'])
        request.user.save()
        return Response({"detail": "Password updated successfully."})
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)