from django.urls import path

from idiomapp import consumers

websocket_urlpatterns = [
    path('ws/battle/<str:userId>/', consumers.BattleConsumer.as_asgi()),
]