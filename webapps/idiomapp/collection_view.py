import json
from django.http import JsonResponse
from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.core.paginator import Paginator

from idiomapp.models import Collection, Idiom


@login_required
def my_collection(request):
    return render(request, 'idiomapp/learn/my_collection.html')


def get_my_collection(request):
    if not request.user.is_authenticated:
        return JsonResponse({"error": "You must be logged in to view your collection"}, status=401)

    page = request.GET.get('page', 1)
    items_per_page = request.GET.get('items_per_page', 10)

    try:
        page = int(page)
        items_per_page = int(items_per_page)
    except ValueError:
        return JsonResponse({"error": "Invalid pagination parameters"}, status=400)

    collection_items = Collection.objects.filter(user_id=request.user).select_related('idiom_id').order_by('-id')

    paginator = Paginator(collection_items, items_per_page)
    current_page = paginator.get_page(page)

    collection_data = {
        "total_items": paginator.count,
        "total_pages": paginator.num_pages,
        "current_page": page,
        "items_per_page": items_per_page,
        "idioms": []
    }

    for item in current_page:
        idiom = item.idiom_id
        collection_data["idioms"].append({
            "id": idiom.id,
            "idiom": idiom.idiom,
            "pronunciation": idiom.pronunciation,
            "translation": idiom.translation,
            "explanation": idiom.explanation
        })

    return JsonResponse(collection_data)


def remove_from_collection(request):
    if not request.user.is_authenticated:
        return JsonResponse({"error": "You must be logged in to remove from your collection"}, status=401)

    if request.method != 'POST':
        return JsonResponse({"error": "Only POST method is allowed"}, status=405)

    try:
        data = json.loads(request.body)
        idiom_id = data.get('idiom_id')

        if not idiom_id:
            return JsonResponse({"error": "idiom_id is required"}, status=400)

        collection_item = Collection.objects.filter(user_id=request.user, idiom_id_id=idiom_id)
        if collection_item.exists():
            collection_item.delete()
            return JsonResponse({"status": "success", "message": "Idiom removed from collection"})
        else:
            return JsonResponse({"error": "Idiom not found in your collection"}, status=404)

    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status=400)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


def clear_collection(request):
    if not request.user.is_authenticated:
        return JsonResponse({"error": "You must be logged in to clear your collection"}, status=401)

    if request.method != 'POST':
        return JsonResponse({"error": "Only POST method is allowed"}, status=405)

    try:
        Collection.objects.filter(user_id=request.user).delete()
        return JsonResponse({"status": "success", "message": "Collection cleared successfully"})

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)