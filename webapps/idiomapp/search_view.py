import re
import json
import openai
from django.http import JsonResponse
from django.conf import settings
from idiomapp.models import Idiom, Collection

# Set your OpenAI API key
openai.api_key = settings.OPENAI_API_KEY


def search_idioms(request):
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Unauthorized'}, status=401)

    if request.method != 'GET':
        return JsonResponse({"error": "Only GET method is allowed"}, status=405)

    description = request.GET.get('description', '')

    user_id = None
    if request.user.is_authenticated:
        user_id = request.user.id

    if not description:
        return JsonResponse({"error": "Description is required"}, status=400)

    try:
        # Prepare the prompt for the AI
        system_prompt = """You are an expert in Chinese idioms (chengyu).
        Based on the user's description, provide the most relevant Chinese idioms.
        IMPORTANT: ONLY provide idioms that are EXACTLY four Chinese characters long. This is a strict requirement.
        For each idiom, provide the following information:
        1. The idiom (Chinese characters)
        2. Pronunciation (pinyin with tone marks)
        3. English translation
        4. Detailed explanation (MUST be concise, around 20 words only)
        5. Relevance score (between 0 and 1)
        
        Always return results in JSON format.
        """

        user_prompt = f"""
        User description: {description}

        Please provide the top 3 Chinese idioms that best match this description.
        IMPORTANT: Each idiom MUST be EXACTLY four Chinese characters long.
        For each idiom, include:
        - The idiom (Chinese characters)
        - Pinyin (with tone marks)
        - English translation
        - Detailed explanation (MUST be concise, around 20 words only)
        - Relevance score (between 0 and 1)
        
        Return only in JSON format:
        [
          {{
            "idiom": "idiom",
            "pronunciation": "pinyin",
            "translation": "English translation",
            "explanation": "Detailed explanation",
            "relevance_score": 0.95
          }}
        ]
        """

        response = openai.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.3,
            max_tokens=1000
        )

        ai_response = response.choices[0].message.content

        # Parse the AI response
        try:
            ai_results = json.loads(ai_response)
        except json.JSONDecodeError:
            json_pattern = r'\[.*\]'
            json_match = re.search(json_pattern, ai_response, re.DOTALL)
            if json_match:
                try:
                    ai_results = json.loads(json_match.group())
                except:
                    return JsonResponse({"error": "Failed to parse AI response"}, status=500)
            else:
                return JsonResponse({"error": "Failed to parse AI response"}, status=500)

        results = []
        for idx, ai_result in enumerate(ai_results):
            idiom_text = ai_result.get('idiom')

            # Validate that the idiom is exactly 4 Chinese characters
            if not idiom_text or len(idiom_text) != 4:
                continue
            
            existing_idiom = Idiom.objects.filter(idiom=idiom_text).first()
            
            if existing_idiom:
                idiom_id = existing_idiom.id
                idiom = existing_idiom.idiom
                pronunciation = existing_idiom.pronunciation
                translation = existing_idiom.translation
                explanation = existing_idiom.explanation
            else:
                new_idiom = Idiom(
                    idiom=idiom_text,
                    pronunciation=ai_result.get('pronunciation', ''),
                    translation=ai_result.get('translation', ''),
                    explanation=ai_result.get('explanation', '')
                )
                new_idiom.save()
                
                idiom_id = new_idiom.id
                idiom = new_idiom.idiom
                pronunciation = new_idiom.pronunciation
                translation = new_idiom.translation
                explanation = new_idiom.explanation
            
            # Check if the idiom is collected by the user
            is_collected = False
            if user_id:
                try:
                    is_collected = Collection.objects.filter(
                        user_id=user_id, 
                        idiom_id=idiom_id
                    ).exists()
                except:
                    is_collected = False
            
            results.append({
                "id": idiom_id,
                "idiom": idiom,
                "pronunciation": pronunciation,
                "translation": translation,
                "explanation": explanation,
                "relevance_score": ai_result.get('relevance_score', 1.0 - 0.1 * idx),  # If AI doesn't provide a score, set based on order
                "is_collected": is_collected
            })
        
        if not results:
            return JsonResponse({
                "query": description,
                "results": [],
                "error": "No idioms found matching your description."
            }, status=200)

        return JsonResponse({
            "query": description,
            "results": results
        })

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)