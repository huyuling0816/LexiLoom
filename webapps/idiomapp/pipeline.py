def set_avatar_from_google(strategy, details, response, user=None, *args, **kwargs):
    print(user.first_name)
    if user and response.get('picture'):
        avatar_url = response['picture']
        if not user.avatar:
            user.avatar = avatar_url
            user.save()


def custom_user_details(strategy, details, backend, user=None, *args, **kwargs):
    """
    Update user details using data from the provider,
    but skip updating first_name and last_name if already set.
    """
    if user is None:
        return

    protected_fields = ['username', 'id', 'pk', 'email']  # email is optional to protect
    for name, value in details.items():
        if value is None or name in protected_fields:
            continue
        if name in ['first_name', 'last_name']:
            current = getattr(user, name, None)
            if current:  # skip if user already has a name
                continue
        setattr(user, name, value)

    user.save()
