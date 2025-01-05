import streamlit as st
from typing import List, Optional
from concurrent.futures import ThreadPoolExecutor
import time
from dataclasses import dataclass
import openai

@dataclass
class TranslationResult:
    language: str
    translated_text: str
    success: bool
    error: Optional[str] = None

class TranslationService:
    SUPPORTED_LANGUAGES = [
        "English", "Assamese", "Bangla", "Bodo", "Dogri", "Gujarati",
        "Hindi", "Kashmiri", "Kannada", "Konkani", "Maithili",
        "Malayalam", "Manipuri", "Marathi", "Nepali", "Odia", "Punjabi",
        "Tamil", "Telugu", "Santali", "Sindhi", "Urdu", "Konyak", "Khasi", "Jaintia",
    ]

    def __init__(self, model_name: str = "gpt-4o-mini"):
        self.model_name = model_name
        self.max_retries = 3
        self.retry_delay = 2
        openai.api_key = "<YOUR OPENAI KEY>"

    def _create_translation_prompt(self, text: str, target_language: str, cultural_context: float) -> List[dict]:
        # High cultural context (> 0.7): Emotional, immersive, deeply cultural
        if cultural_context > 0.7:
            content = (
                    f"You are a skilled {target_language} translator with deep cultural understanding. Your task is to provide a culturally immersive translation:\n"
                    "Translate the text by deeply integrating **emotional resonance**, **local expressions**, and **cultural nuances** into the translation.\n"
                    "Focus on conveying the **core meaning** in a manner that directly connects with the target audience, using culturally relevant language and tone.\n"
                    "Exact translation is not necessary; adapt the phrasing and structure to ensure the message resonates emotionally and culturally."
                )
        # Medium cultural context (0.3 < cultural_context <= 0.7): Balanced, culturally relevant
        elif cultural_context > 0.3:
            content = (
                f"You are an expert {target_language} translator with awareness of local culture. Your task is to **adapt the translation** with cultural sensitivity while staying close to the original meaning:\n"
                "Rules to follow:\n"
                "1. **Maintain the essence** of the original message but adapt phrasing to make it accessible for the target audience without deviating too far from the original tone.\n"
                "2. Integrate **local idioms** or cultural terminology when it adds clarity and relatability. The translation should still feel grounded in the original content.\n"
                "3. Ensure that the message is culturally acceptable, but without dramatic changes—don’t lose the spirit of the original text.\n"
                "4. **Do not overly formalize** language unless it's part of the original text's tone.\n"
                "5. Do not add personal interpretations or emotional exaggerations, but **make adjustments for readability** in the target language.\n"
                "6. Use local spelling, expressions, or script conventions that reflect cultural appropriateness, without over-adapting."
            )
        # Low cultural context (<= 0.3): Strict, precise translation with minimal cultural adaptation
        else:
            content = (
                f"You are a precise {target_language} translator focused on **faithfully translating** the text:\n"
                "Rules to follow:\n"
                "1. **Provide a direct translation**. Focus on accuracy, maintaining the original meaning, tone, and grammatical structure.\n"
                "2. **Do not alter** the phrasing or add any personal flair. The goal is to preserve the message without unnecessary cultural adaptation.\n"
                "3. Translate technical terms exactly as they are. Do not use local phrases unless explicitly stated in the original text.\n"
                "4. Do not use idiomatic expressions unless they are part of the original text.\n"
                "5. Keep the structure intact; do not adjust for cultural familiarity—preserve the text as closely as possible.\n"
                "6. Use the script most commonly accepted in the target language region."
            )

        # Return the tailored prompt with the provided text
        return [
            {"role": "system", "content": content},
            {"role": "user", "content": f"Translate the following text: {text}"},
        ]




    def translate_single(self, text: str, target_language: str, cultural_context: float) -> TranslationResult:
        for attempt in range(self.max_retries):
            try:
                prompt = self._create_translation_prompt(text, target_language, cultural_context)
                response = openai.ChatCompletion.create(
                    model=self.model_name,
                    messages=prompt,
                    max_tokens=500,
                    temperature=0.3
                )
                translated_text = response.choices[0].message["content"].strip()
                return TranslationResult(
                    language=target_language, 
                    translated_text=translated_text, 
                    success=True
                )
            except Exception as e:
                if attempt == self.max_retries - 1:
                    return TranslationResult(
                        language=target_language, 
                        translated_text="", 
                        success=False, 
                        error=str(e)
                    )
                time.sleep(self.retry_delay)

    def translate_batch(self, text: str, languages: List[str], cultural_context: float, max_workers: int = 5) -> List[TranslationResult]:
        with ThreadPoolExecutor(max_workers=max_workers) as executor:
            futures = [
                executor.submit(self.translate_single, text, lang, cultural_context) 
                for lang in languages
            ]
            return [future.result() for future in futures]

def main():
    st.set_page_config(page_title="Multi-Language Translator", page_icon="🌐")
    
    st.title("AI Multi-Language Translator")
    st.write("Translate text into multiple languages with cultural context control.")

    # Input text
    input_text = st.text_area("Enter text to translate:", height=100)

    # Cultural context slider
    cultural_context = st.slider(
        "Cultural Context Level",
        min_value=0.0,
        max_value=1.0,
        value=0.5,
        step=0.1,
        help="0: Literal translation, 1: Highly culturally adapted"
    )

    # Language selection
    languages = [
        "English", "Assamese", "Bangla", "Bodo", "Dogri", "Gujarati",
        "Hindi", "Kashmiri", "Kannada", "Konkani", "Maithili",
        "Malayalam", "Manipuri", "Marathi", "Nepali", "Odia", "Punjabi",
        "Tamil", "Telugu", "Santali", "Sindhi", "Urdu", "Konyak", "Khasi", "Jaintia",
    ]
    selected_languages = st.multiselect(
        "Select target languages:",
        languages,
        default=["Hindi", "Tamil"]
    )

    if st.button("Translate") and input_text and selected_languages:
        try:
            with st.spinner("Translating..."):
                translator = TranslationService()
                results = translator.translate_batch(
                    input_text,
                    selected_languages,
                    cultural_context
                )

            # Display results
            st.subheader("Translation Results:")
            for result in results:
                with st.expander(f"{result.language} Translation"):
                    if result.success:
                        st.write(result.translated_text)
                    else:
                        st.error(f"Error: {result.error}")

        except Exception as e:
            st.error(f"An error occurred: {str(e)}")

if __name__ == "__main__":
    main()
