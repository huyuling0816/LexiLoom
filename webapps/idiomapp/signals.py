from django.contrib.auth.signals import user_logged_in
from django.dispatch import receiver
from django.contrib.sessions.models import Session


@receiver(user_logged_in)
def update_session_key_on_login(sender, request, user, **kwargs):
    old_key = user.current_session_key
    # delete old session key
    if old_key:
        Session.objects.filter(session_key=old_key).delete()
    # save the new session key
    user.current_session_key = request.session.session_key
    user.save()
    print(f"[Signal] user_logged_in triggered for {user.username}")
