from django.urls import path
from idiomapp import views
from idiomapp import flash_view
from idiomapp import game_view
from idiomapp import collection_view
from idiomapp import search_view
from django.urls import re_path

urlpatterns = [
    # frontend URLs
    path('', views.index, name='home'),
    path('flash-card', views.index, name='home'),
    path('collection', views.index, name='home'),
    path('battle-game', views.index, name='home'),
    path('self-test', views.index, name='home'),
    path('search', views.index, name='home'),
    path('battle-result', views.index, name='home'),
    path('test-result', views.index, name='home'),
    path('pre-test', views.index, name='home'),
    path('profile', views.index, name='home'),
    path('register', views.index, name='home'),
    path('login', views.index, name='home'),

    # backend URLs
    path('get_user_status', views.get_user_status, name='get_user_status'),
    path('ws1', views.ws_action_1, name='ws1'),
    path('ws2', views.ws_action_2, name='ws2'),
    path('logout', views.logout_view, name='logout'),
    path('login_req', views.login_action, name='login'),
    path('edit_profile', views.edit_action, name='edit_profile'),
    path('edit_profile_picture', views.edit_profile_picture, name='edit_profile_picture'),
    path('register_req', views.register_action, name='register'),
    path('end_battle', game_view.end_battle_session, name='end_battle'),
    path('start_test', game_view.start_test_session, name='start_test'),
    path('end_test', game_view.end_test_session, name='end_test'),
    path('get_winning_rate/<int:user_id>/', game_view.get_winning_rate, name='get_winning_rate'),
    path('translate/<str:character>/', views.get_character_translation, name='get_character_translation'),

    # Flashcard URLs
    path('flash_cards', flash_view.flash_cards, name='flash_cards'),
    path('get_random_idiom', flash_view.get_random_idiom, name='get_random_idiom'),
    path('add_to_collection', flash_view.add_to_collection, name='add_to_collection'),

    # Collection URLs
    path('my_collection', collection_view.my_collection, name='my_collection'),
    path('get_my_collection', collection_view.get_my_collection, name='get_my_collection'),
    path('remove_from_collection', collection_view.remove_from_collection, name='remove_from_collection'),
    path('clear_collection', collection_view.clear_collection, name='clear_collection'),

    # Search URLs
    path('search_idioms', search_view.search_idioms, name='search_idioms'),
    # path('manual_google_login', views.manual_google_login, name='manual_google_login'),

    # other invalid paths
    re_path(r'^(?!api/|admin/|static/|oauth/).*$', views.index, name='home'),
]
