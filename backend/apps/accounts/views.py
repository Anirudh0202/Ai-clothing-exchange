from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer, TokenRefreshSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .models import User
from .permissions import IsAccountOwner
from .serializers import RegisterSerializer, UserSerializer


def build_success_response(data=None, message=None):
    response = {'success': True}
    if message:
        response['message'] = message
    if data is not None:
        response['data'] = data
    return response


def build_error_response(errors=None, message=None):
    response = {'success': False}
    if message:
        response['message'] = message
    if errors is not None:
        response['errors'] = errors
    return response


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        payload = build_success_response(data=UserSerializer(user).data, message='Registration successful.')
        return Response(payload, status=status.HTTP_201_CREATED)


class LoginSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['username'] = user.username
        token['email'] = user.email
        return token


class LoginView(TokenObtainPairView):
    permission_classes = [permissions.AllowAny]
    serializer_class = LoginSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.user
        success_data = {
            'tokens': serializer.validated_data,
            'user': UserSerializer(user).data,
        }
        return Response(build_success_response(data=success_data, message='Login successful.'), status=status.HTTP_200_OK)


class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        refresh_token = request.data.get('refresh')
        if not refresh_token:
            return Response(build_error_response(message='Refresh token is required.'), status=status.HTTP_400_BAD_REQUEST)

        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
        except TokenError as exc:
            return Response(build_error_response(errors={'refresh': str(exc)}, message='Invalid refresh token.'), status=status.HTTP_400_BAD_REQUEST)

        return Response(build_success_response(message='Logout successful.'), status=status.HTTP_200_OK)


class CustomTokenRefreshView(TokenRefreshView):
    permission_classes = [permissions.AllowAny]
    serializer_class = TokenRefreshSerializer

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        if response.status_code == status.HTTP_200_OK:
            return Response(build_success_response(data=response.data, message='Token refreshed successfully.'), status=status.HTTP_200_OK)
        return Response(build_error_response(errors=response.data, message='Token refresh failed.'), status=response.status_code)


class UserProfileView(APIView):
    permission_classes = [IsAccountOwner]

    def get(self, request, *args, **kwargs):
        serializer = UserSerializer(request.user)
        return Response(build_success_response(data=serializer.data, message='Current user profile retrieved.'), status=status.HTTP_200_OK)
