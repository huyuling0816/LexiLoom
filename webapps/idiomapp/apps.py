from django.apps import AppConfig


class IdiomappConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'idiomapp'

    def ready(self):
        import idiomapp.signals # noqa
