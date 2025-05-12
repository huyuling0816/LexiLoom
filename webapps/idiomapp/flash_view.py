from django.shortcuts import render
from django.http import JsonResponse
from idiomapp.models import Idiom, Collection
import random
import json


def flash_cards(request):
    return render(request, 'build/flash.html')

def get_random_idiom(request):
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Unauthorized'}, status=401)
    try:
        all_idiom_ids = list(Idiom.objects.values_list('id', flat=True))

        if all_idiom_ids:
            random_id = random.choice(all_idiom_ids)
            idiom = Idiom.objects.get(id=random_id)

            is_collected = False
            if request.user.is_authenticated:
                is_collected = Collection.objects.filter(
                    user_id=request.user,
                    idiom_id=idiom
                ).exists()

            return JsonResponse({
                'id': idiom.id,
                'idiom': idiom.idiom,
                'pronunciation': idiom.pronunciation,
                'translation': idiom.translation,
                'explanation': idiom.explanation,
                'is_collected': is_collected
            })
        else:
            return JsonResponse({"error": "No idioms found in the database"}, status=404)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


def add_to_collection(request):
    if not request.user.is_authenticated:
        return JsonResponse({"error": "You must be logged in to save idioms"}, status=401)

    if request.method != 'POST':
        return JsonResponse({"error": "Only POST method is allowed"}, status=405)

    try:
        data = json.loads(request.body)
        idiom_id = data.get('idiom_id')

        if not idiom_id:
            return JsonResponse({"error": "idiom_id is required"}, status=400)

        try:
            idiom = Idiom.objects.get(id=idiom_id)
        except Idiom.DoesNotExist:
            return JsonResponse({"error": "Idiom not found"}, status=404)

        if Collection.objects.filter(user_id=request.user, idiom_id=idiom).exists():
            return JsonResponse({
                "status": "warning",
                "message": "This idiom is already in your collection"
            })

        Collection.objects.create(user_id=request.user, idiom_id=idiom)
        return JsonResponse({
            "status": "success",
            "message": "Idiom added to your collection"
        })

    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status=400)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)