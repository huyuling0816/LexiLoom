import json
import os
import random
from datetime import datetime

from django.contrib.auth import get_user_model
from django.core.exceptions import ObjectDoesNotExist
from django.db.models import Q
from django.utils import timezone

from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from idiomapp.models import BattleSession, Idiom, TestSession
from django.http import JsonResponse

from idiomapp.views import error_response

User = get_user_model()

def start_battle_session(player_1_id: int, player_2_id: int):
    # if not request.user.is_authenticated:
    #     return error_response("You must be logged in to do this operation", status=401)

    # if request.method == 'GET':
    #     return error_response("You must use a POST request for this operation", status=405)

    # data = json.loads(request.body)
    # if not 'player_1_id' in data or not 'player_2_id' in data:
    #     return error_response("Who are the players?", status=400)
    #
    # player_1_id = data.get('player_1_id')
    # player_2_id = data.get('player_2_id')

    # Check if both player IDs exist in the User model
    if not User.objects.filter(id=player_1_id).exists() or not User.objects.filter(id=player_2_id).exists():
        return -1, []

    player_1 = User.objects.get(id=player_1_id)
    player_2 = User.objects.get(id=player_2_id)

    new_battle = BattleSession(player_1=player_1, player_2=player_2,
                               start_time=timezone.localtime(),
                               status="ongoing")
    new_battle.save()

    # Get all questions and shuffle them to get a random order
    idioms = list(Idiom.objects.all())
    random.shuffle(idioms)
    questions = []
    for idiom in idioms[:3]:
        options = random.sample([i for i in idioms if i != idiom], 3)
        question = {
            'question': idiom.explanation,
            'answer': idiom.idiom + " (" + idiom.pronunciation + ")",
            'option_1': f"{options[0].idiom} ({options[0].pronunciation})",
            'option_2': f"{options[1].idiom} ({options[1].pronunciation})",
            'option_3': f"{options[2].idiom} ({options[2].pronunciation})",
            'type': "match_idiom"
        }
        questions.append(question)

    for idiom in idioms[4:7]:
        characters = list(idiom.idiom)  # Convert idiom to list of characters
        random.shuffle(characters)  # Shuffle the characters
        shuffled_options = []

        # Create 3 unique shuffled versions
        while len(shuffled_options) < 3:
            random.shuffle(characters)  # Shuffle the characters

            shuffled = ''.join(characters)

            # Ensure shuffled version is not the same as the original order
            if shuffled != idiom.idiom and shuffled not in shuffled_options:
                shuffled_options.append(shuffled)

        question = {
            'question': f"Please figure out the correct idiom: {idiom.pronunciation} ({idiom.translation})",
            'answer': idiom.idiom,
            'option_1': shuffled_options[0],
            'option_2': shuffled_options[1],
            'option_3': shuffled_options[2],
            'type': "rearrange_characters"
        }
        questions.append(question)

    for idiom in idioms[-4:]:
        options = random.sample([i for i in idioms if i != idiom], 3)
        question = {
            'question': f"{idiom.idiom} ({idiom.pronunciation})",
            'translation': idiom.translation,
            'answer': idiom.explanation,
            'option_1': options[0].explanation,
            'option_2': options[1].explanation,
            'option_3': options[2].explanation,
            'type': "understand_meaning"
        }
        questions.append(question)
    random.shuffle(questions)
    for idx, question in enumerate(questions):
        question['id'] = idx
    return new_battle.id, questions, player_1.username, player_2.username


def end_battle_session(request):
    if not request.user.is_authenticated:
        return error_response("You must be logged in to do this operation", status=401)

    if request.method != 'POST':
        return error_response("You must use a POST request for this operation", status=405)

    data = json.loads(request.body)
    if not 'session_id' in data or not 'player_1_endtime' in data or not 'player_2_endtime' in data \
            or not 'player_1_score' in data or not 'player_2_score' in data:
        return error_response("Missing necessary session information", status=400)

    try:
        battle = BattleSession.objects.select_for_update().get(id=data['session_id'])
    except ObjectDoesNotExist:
        return error_response("Session does not exist", status=400)
    if battle.status != "ongoing":
        return error_response("This is not a live session", status=400)
    start_time = timezone.localtime(battle.start_time)
    player_1_endtime = datetime.strptime(data['player_1_endtime'], "%Y-%m-%d %H:%M:%S.%f")
    player_2_endtime = datetime.strptime(data['player_2_endtime'], "%Y-%m-%d %H:%M:%S.%f")

    player_1_endtime = timezone.make_aware(player_1_endtime, timezone.get_default_timezone())
    player_2_endtime = timezone.make_aware(player_2_endtime, timezone.get_default_timezone())

    battle.status = "finished"
    battle.player_1_score = data['player_1_score']
    battle.player_2_score = data['player_2_score']
    battle.player_1_time = int((player_1_endtime - start_time).total_seconds() * 1000)
    battle.player_2_time = int((player_2_endtime - start_time).total_seconds() * 1000)
    if battle.player_1_score > battle.player_2_score:
        battle.winner_id = battle.player_1
    elif battle.player_1_score < battle.player_2_score:
        battle.winner_id = battle.player_2
    else:
        battle.winner_id = battle.player_1_time < battle.player_2_time and battle.player_1 or battle.player_2
    battle.save()
    battle_data = {
        'player_1_score': battle.player_1_score,
        'player_2_score': battle.player_2_score,
        'player_1_time': battle.player_1_time,
        'player_2_time': battle.player_2_time,
        'winner_id': battle.winner_id.id
    }
    return HttpResponse(json.dumps(battle_data), content_type='application/json',
                        status=200)


def start_test_session(request):
    if not request.user.is_authenticated:
        return error_response("You must be logged in to do this operation", status=401)

    if request.method == 'GET':
        return error_response("You must use a POST request for this operation", status=405)

    data = json.loads(request.body)
    if not 'user_id' in data:
        return error_response("Who is the player?", status=400)

    user_id = data['user_id']

    # Check if both player IDs exist in the User model
    if not User.objects.filter(id=user_id).exists():
        return error_response("Player does not exist", status=400)

    new_test = TestSession(test_user=User.objects.get(id=user_id), start_time=timezone.localtime(), score=0)

    # test_user = request.user
    # new_test = TestSession(player_1=test_user, start_time=timezone.localtime())
    new_test.save()

    # Get all questions and shuffle them to get a random order
    idioms = list(Idiom.objects.all())
    random.shuffle(idioms)
    questions = []
    for idiom in idioms[:3]:
        options = random.sample([i for i in idioms if i != idiom], 3)
        question = {
            'question': idiom.explanation,
            'answer': idiom.idiom + " (" + idiom.pronunciation + ")",
            'option_1': f"{options[0].idiom} ({options[0].pronunciation})",
            'option_2': f"{options[1].idiom} ({options[1].pronunciation})",
            'option_3': f"{options[2].idiom} ({options[2].pronunciation})",
            'type': "match_idiom"
        }
        questions.append(question)

    for idiom in idioms[4:7]:
        characters = list(idiom.idiom)  # Convert idiom to list of characters
        random.shuffle(characters)  # Shuffle the characters
        shuffled_options = []

        # Create 3 unique shuffled versions
        while len(shuffled_options) < 3:
            random.shuffle(characters)  # Shuffle the characters

            shuffled = ''.join(characters)

            # Ensure shuffled version is not the same as the original order
            if shuffled != idiom.idiom and shuffled not in shuffled_options:
                shuffled_options.append(shuffled)

        question = {
            'question': f"Please figure out the correct idiom: {idiom.pronunciation} ({idiom.translation})",
            'answer': idiom.idiom,
            'option_1': shuffled_options[0],
            'option_2': shuffled_options[1],
            'option_3': shuffled_options[2],
            'type': "rearrange_characters"
        }
        questions.append(question)

    for idiom in idioms[-4:]:
        options = random.sample([i for i in idioms if i != idiom], 3)
        question = {
            'question': f"{idiom.idiom} ({idiom.pronunciation}): {idiom.translation}",
            'answer': idiom.explanation,
            'option_1': options[0].explanation,
            'option_2': options[1].explanation,
            'option_3': options[2].explanation,
            'type': "understand_meaning"
        }
        questions.append(question)
    random.shuffle(questions)
    for idx, question in enumerate(questions):
        question['id'] = idx
    response_json = json.dumps({'session_id': new_test.id, 'questions': questions})
    return HttpResponse(response_json, content_type='application/json',
                        status=200)


def end_test_session(request):
    if not request.user.is_authenticated:
        return error_response("You must be logged in to do this operation", status=401)

    if request.method != 'POST':
        return error_response("You must use a POST request for this operation", status=405)

    data = json.loads(request.body)
    if not 'session_id' in data or not 'score' in data:
        return error_response("Missing necessary session information", status=400)

    try:
        test_session = TestSession.objects.select_for_update().get(id=data['session_id'])
    except ObjectDoesNotExist:
        return error_response("Session does not exist", status=400)
    if test_session.end_time:
        return error_response("This is not a live session", status=400)

    test_session.score = data['score']
    test_session.end_time = timezone.localtime()
    complete_time = int((test_session.end_time - test_session.start_time).total_seconds() * 1000)
    test_session.save()
    test_data = {
        'score': test_session.score,
        'time': complete_time
    }
    return HttpResponse(json.dumps(test_data), content_type='application/json',
                        status=200)


def get_winning_rate(request, user_id):
    if not request.user.is_authenticated:
        return error_response("You must be logged in to do this operation", status=401)
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return JsonResponse({"error": "User not found"}, status=404)

    total_games = BattleSession.objects.filter(Q(player_1=user) | Q(player_2=user)).count()
    total_wins = BattleSession.objects.filter(winner_id=user).count()

    if total_games == 0:
        winning_rate = 0.0  # Avoid division by zero
    else:
        winning_rate = total_wins / total_games

    return JsonResponse({"user_id": user_id, "winning_rate": winning_rate})