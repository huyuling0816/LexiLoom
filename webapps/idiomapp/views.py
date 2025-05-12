import json
import os
import magic

from django.contrib.auth import authenticate, login, logout, get_user_model, get_backends
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
from django.db import transaction

from django.http import HttpResponse
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from deep_translator import GoogleTranslator
from django.views.decorators.csrf import ensure_csrf_cookie

from idiomapp.models import Character

User = get_user_model()


# Create your views here.
# These are only used for testing rendering the front end
def index(request):
    return render(request, 'build/index.html')


@ensure_csrf_cookie
def get_user_status(request):
    if request.user.is_authenticated:
        username = request.user.username
        return JsonResponse({
            'is_authenticated': True,
            'first_name': request.user.first_name,
            'last_name': request.user.last_name,
            'username': username,
            'user_id': request.user.id,
            'email': request.user.email,
            'avatar': request.user.get_avatar_url(),
        })
    else:
        return JsonResponse({
            'is_authenticated': False,
            'first_name': '',
            'last_name': '',
            'user_id': '',
            'username': '',
            'email': '',
            'avatar': '',
        })


def ws_action_1(request):
    return render(request, 'websocket/ws1.html')


def ws_action_2(request):
    return render(request, 'websocket/ws2.html')


def error_response(message, status=200):
    response_json = '{"error": "' + message + '"}'
    return HttpResponse(response_json, content_type='application/json', status=status)


def login_action(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        email = data.get('email')
        password = data.get('password')

        if not email or not password:
            return JsonResponse({'error': 'Both email and password are required'}, status=400)

        user = authenticate(request, username=email,
                            password=password)  # authenticate uses email since USERNAME_FIELD = 'email'
        if user is not None:
            backend = get_backends()[0]  # Use the first configured backend
            user.backend = f"{backend.__module__}.{backend.__class__.__name__}"
            # delete old session key
            # if user.current_session_key:
            #     print("Deleting old session key: ", user.current_session_key)
            #     Session.objects.filter(session_key=user.current_session_key).delete()
            login(request, user)
            # update the current session key
            # print("Updating session key: ", request.session.session_key)
            # user.current_session_key = request.session.session_key
            # user.save()
            return JsonResponse({'message': 'Login successful'}, status=200)
        else:
            return JsonResponse({'error': 'Invalid email or password'}, status=400)

    return JsonResponse({'error': 'Invalid request method'}, status=405)


def logout_view(request):
    logout(request)
    return JsonResponse({'message': 'Logged out'})


@transaction.atomic()
def register_action(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        first_name = data.get("firstname")
        last_name = data.get('lastname')
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')

        if not username or not email or not password:
            return JsonResponse({'error': 'All fields are required'}, status=400)

        if User.objects.filter(email=email).exists():
            return JsonResponse({'error': 'Email is already registered'}, status=400)

        user = User.objects.create_user(username=username, email=email, password=password,
                                        first_name=first_name, last_name=last_name)

        backend = get_backends()[0]  # Use the first configured backend
        user.backend = f"{backend.__module__}.{backend.__class__.__name__}"
        user = authenticate(request, username=email,
                            password=password)  # authenticate uses email since USERNAME_FIELD = 'email'
        login(request, user)  # Automatically log in the user after registration
        return JsonResponse({'message': 'User registered successfully',
                             'user_id': user.id}, status=201)

    return JsonResponse({'error': 'Invalid request method'}, status=405)


@transaction.atomic
def edit_action(request):
    if request.method == 'POST':
        if not request.user.is_authenticated:
            return JsonResponse({'error': 'Unauthorized'}, status=401)

        data = json.loads(request.body)
        user = User.objects.select_for_update().get(id=data.get("id"))

        # Helper function to update fields only if the value is provided and not empty
        def update_field(field_name, value):
            if value is not None and value.strip() != "":
                setattr(user, field_name, value)

        update_field("first_name", data.get("firstname"))
        update_field("last_name", data.get("lastname"))
        update_field("username", data.get("username"))

        user.save()
        return JsonResponse({'message': 'Profile updated successfully'})

    return JsonResponse({'error': 'Invalid request method'}, status=405)


@transaction.atomic
def edit_profile_picture(request):
    if request.method == 'POST':
        if not request.user.is_authenticated:
            return JsonResponse({'error': 'Unauthorized'}, status=401)

        user = User.objects.select_for_update().get(id=request.user.id)
        # user = User.objects.select_for_update().get(id=1)

        # If an avatar file is uploaded, save it
        if 'avatar' in request.FILES:
            avatar_file = request.FILES['avatar']

            if avatar_file.size > 2 * 1024 * 1024:
                return JsonResponse({'error': 'File size exceeds 2MB limit'}, status=400)
            
            file_content = avatar_file.read()
            avatar_file.seek(0)
            mime = magic.Magic(mime=True)
            file_mime = mime.from_buffer(file_content)
            allowed_mimes = ['image/jpeg', 'image/png', 'image/gif']
            if file_mime not in allowed_mimes:
                return JsonResponse({'error': 'Invalid file type. Only JPEG, PNG and GIF allowed'}, status=400)

            if avatar_file:
                # Define file path
                avatar_path = f'user_{user.id}_{avatar_file.name}'

                # Remove old uploaded avatar if it exists (but don't delete Google avatars)
                if user.avatar and not user.avatar.startswith("http"):
                    old_avatar_path = os.path.join('idiomapp/static/profile_images', user.avatar)
                    if os.path.exists(old_avatar_path):
                        os.remove(old_avatar_path)

                # Save new file and update avatar field
                saved_path = default_storage.save(avatar_path, ContentFile(avatar_file.read()))
                user.avatar = saved_path  # Store relative path

        user.save()

        return JsonResponse({'message': 'Profile picture updated successfully', 'avatar_url': user.get_avatar_url()})

    return JsonResponse({'error': 'Invalid request method'}, status=405)


def get_character_translation(request, character):
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Unauthorized'}, status=401)

    if request.method != 'GET':
        return error_response("You must use a GET request for this operation", status=405)

    if not character:
        return error_response("Missing parameter for translation!", status=400)

    # Check if the character exists in the database
    try:
        entry = Character.objects.get(character=character)
        translation = entry.translation
    except Character.DoesNotExist:
        # If not found, translate using API
        try:
            translation = GoogleTranslator(source='zh-CN', target='en').translate(character)
            # Save it to the database
            entry = Character.objects.create(character=character, translation=translation)
        except Exception as e:
            return error_response(f"Translation failed: {str(e)}", status=500)

    return JsonResponse({"translation": translation, "character": character})
