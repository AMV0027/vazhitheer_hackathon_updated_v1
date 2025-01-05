from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, conlist
from typing import List, Dict, Optional
from huggingface_hub import InferenceClient
import asyncio
import time

app = FastAPI()

# CORS settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models for request validation
class TranslateAllRequest(BaseModel):
    text: str = Field(..., description="Text to be translated")
    cultural_context: float = Field(
        default=0.5,
        ge=0.0,
        le=1.0,
        description="Cultural context weight (0.0 to 1.0)"
    )

class TranslateSpecificRequest(BaseModel):
    text: str = Field(..., description="Text to be translated")
    cultural_context: float = Field(
        default=0.5,
        ge=0.0,
        le=1.0,
        description="Cultural context weight (0.0 to 1.0)"
    )
    languages: List[str] = Field(
        ...,
        description="List of target languages for translation"
    )

class TranslationResponse(BaseModel):
    translations: Dict[str, str]


class TranslationService:
    DEFAULT_API_KEY = "<YOUR HUGGING FACE KEY>"
    # Array of supported languages
    SUPPORTED_LANGUAGES = [
        "English",
        "Assamese",
        "Bangla",
        "Bodo",
        "Dogri",
        "Gujarati",
        "Hindi",
        "Kashmiri",
        "Kannada",
        "Konkani",
        "Maithili",
        "Malayalam",
        "Manipuri",
        "Marathi",
        "Nepali",
        "Odia",
        "Punjabi",
        "Tamil",
        "Telugu",
        "Santali",
        "Sindhi",
        "Urdu",
        "Konyak",
        "Khasi",
        "Jaintia",
    ]

    def __init__(self, model_name="mistralai/Mistral-Nemo-Instruct-2407"):
        self.client = InferenceClient(api_key=self.DEFAULT_API_KEY)
        self.model_name = model_name

    def create_prompt(self, text: str, language: str, context: float) -> List[Dict[str, str]]:
        if context > 0.7:
            cultural_instruction = (
                "Provide a direct, nuanced translation with a strong emphasis on cultural context to enhance understanding. Use modern, idiomatic expressions and phrasing suitable for both formal and informal contexts."
            )
        elif context > 0.3:
            cultural_instruction = (
                "Provide a direct translation, integrating relevant cultural context where necessary to clarify the meaning. Ensure modern clarity while maintaining formal correctness."
            )
        else:
            cultural_instruction = (
                "Provide a translation, prioritizing cultural context to convey deeper nuances and avoid misinterpretations."
            )
        
        # Adjust content based on specific languages and their distinct script/script-adaptations:
        if language == "Khasi" or language == "Konyak" or language == "Jaintia":
            content = (
                f"You are a highly skilled {language} translator. Your task is to translate the provided text into {language}, but use Hindi script for the translation. Avoid any English words, phrases, or explanations. Only provide the direct translation in {language}.\n"
                f"Cultural context: {cultural_instruction}\n"
                "Be precise, as {language} may have unique interpretations in context."
            )
        elif language == "Santali":
            content = (
                f"You are a highly skilled {language} translator. Your task is to translate the provided text into {language}, but use Devanagari script. Ensure that no English prefixes or suffixes are added. Provide only the direct translation in Santali.\n"
                f"Cultural context: {cultural_instruction}\n"
                "Pay special attention to nuances in cultural references that may be embedded in the language."
            )
        elif language == "Manipuri":
            content = (
                f"You are a highly skilled {language} translator. Your task is to translate the provided text into {language}, using Bengali script. Do not add any prefixes, suffixes, or English explanations. Only provide the direct translation.\n"
                f"Cultural context: {cultural_instruction}\n"
                "Be aware of how specific phrases in Manipuri may have a cultural resonance beyond the literal meaning."
            )
        else:
            content = (
                f"You are a highly skilled {language} translator. Your task is to translate the provided text into {language}, accurately preserving meaning and tone without any additional context or explanations. Your translation should focus on fluency, accuracy, and appropriateness.\n"
                "Rules to follow:\n"
                f"Cultural context: {cultural_instruction}\n"
                "1. Preserve the original meaning and tone without grammatical errors.\n"
                "2. Use formal language unless the source text is more informal or colloquial.\n"
                "3. Ensure technical terms are translated accurately. If no specific term exists in {language}, retain the English term as-is.\n"
                "4. Do not add explanations, notes, or emojis—focus solely on translation.\n"
                "5. Do not use any markdown stylings or formatting. Simply provide the clean, accurate translation."
            )
        content += (
            "Ensure that all cultural subtleties and linguistic variations in {language} are considered, especially in terms of local expressions or idioms that could enhance the quality of the translation.\n"
        )

        return [
            {"role": "system", "content": content},
            {"role": "user", "content": f"provided text: {text}"},
        ]


    async def translate(self, text: str, language: str, context: float) -> Dict[str, Optional[str]]:
        try:
            prompt = self.create_prompt(text, language, context)
            response = await asyncio.to_thread(
                self.client.chat.completions.create,
                model=self.model_name,
                messages=prompt,
                max_tokens=1000,
                temperature=0.3,
            )
            return {"language": language, "text": response.choices[0].message["content"].strip(), "error": None}
        except Exception as e:
            return {"language": language, "text": None, "error": str(e)}

    async def batch_translate(self, text: str, languages: List[str], context: float) -> List[Dict[str, Optional[str]]]:
        tasks = []
        for i, lang in enumerate(languages):
            task = asyncio.create_task(self.translate(text, lang, context))
            tasks.append(task)
            # Insert a small delay (e.g., 0.5 seconds) between requests to reduce load on the Hugging Face API
            if i < len(languages) - 1:  # Avoid adding unnecessary delay at the end
                await asyncio.sleep(0.5)  # Adjust delay as needed for load balancing
        # Wait for all translations to finish
        results = await asyncio.gather(*tasks)
        return results


@app.post("/translate/all", response_model=TranslationResponse)
async def translate_all(request: TranslateAllRequest) -> Dict[str, Dict[str, str]]:
    translator = TranslationService()
    results = await translator.batch_translate(
        request.text,
        TranslationService.SUPPORTED_LANGUAGES,
        request.cultural_context
    )
    translations = {
        res["language"]: res["text"] if not res["error"] else f"Error: {res['error']}"
        for res in results
    }
    return {"translations": translations}


@app.post("/translate/specific", response_model=TranslationResponse)
async def translate_specific(request: TranslateSpecificRequest) -> Dict[str, Dict[str, str]]:
    # Validate requested languages
    invalid_languages = [lang for lang in request.languages if lang not in TranslationService.SUPPORTED_LANGUAGES]
    if invalid_languages:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid languages: {', '.join(invalid_languages)}. Supported languages are: {', '.join(TranslationService.SUPPORTED_LANGUAGES)}"
        )

    translator = TranslationService()
    results = await translator.batch_translate(
        request.text,
        request.languages,
        request.cultural_context
    )
    translations = {
        res["language"]: res["text"] if not res["error"] else f"Error: {res['error']}"
        for res in results
    }
    return {"translations": translations}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)