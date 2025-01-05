import streamlit as st
from typing import List, Dict, Optional
from huggingface_hub import InferenceClient
from concurrent.futures import ThreadPoolExecutor
import time
from dataclasses import dataclass

@dataclass
class TranslationResult:
    language: str
    translated_text: str
    success: bool
    error: Optional[str] = None

class TranslationService:
    DEFAULT_API_KEY = "<YOUR HUGGING FACE KEY>"
    
    LANGUAGE_MAPPING = {
        'Hindi': 'hi',
        'Gujarati': 'gu',
        'Marathi': 'mr',
        'Konkani': 'kok',
        'Bengali': 'bn',
        'Oriya': 'or',
        'Kashmiri': 'ks',
        'Assamese': 'as',
        'Nepali': 'ne',
        'Manipuri': 'mni',
        'Tamil': 'ta',
        'Malayalam': 'ml',
        'Punjabi': 'pa',
        'Telugu': 'te',
        'Kannada': 'kn',
        'English': 'en'
    }

    def __init__(self, model_name: str = "Qwen/Qwen2.5-72B-Instruct"):
        self.client = InferenceClient(api_key=self.DEFAULT_API_KEY)
        self.model_name = model_name
        self.max_retries = 3
        self.retry_delay = 2

    def _create_translation_prompt(self, text: str, target_language: str, cultural_context: float) -> List[Dict]:
        if cultural_context > 0.7:
            content = (
                f"You are an expert {target_language} translator with a deep understanding of the culture. Your task is to translate the text in a way that resonates strongly with the cultural values, emotions, and nuances of the target audience. Focus on adapting idioms, metaphors, and culturally significant references that connect emotionally with them. It’s not necessary to follow the exact wording; the core message should be conveyed in a culturally meaningful way.\n"
                f"Think about how this text would naturally fit within the culture and everyday language of {target_language} speakers. Prioritize making the message clear, relatable, and engaging.\n\n"
                "Rules:\n"
                "1. Focus on **emotional resonance**, adjusting expressions and metaphors to fit the culture.\n"
                "2. **Exact translation is secondary**; adapt meaning to reflect local values and emotions.\n"
                "3. Utilize **local expressions** and culturally significant references to make the message relatable.\n"
                "4. Avoid overly formal language if it does not align with the cultural tone.\n"
                "5. Use expressions and tone that would be familiar to the audience, making it emotionally impactful."
            )
        elif cultural_context > 0.3:
            content = (
                f"You are a skilled {target_language} translator. Your job is to translate the text faithfully, but also make sure the meaning is **clear** for the target audience by including relevant cultural aspects. Use familiar terms and expressions that reflect the language and culture of the {target_language} speakers. However, the translation should not drastically change the original text, only adjusting where necessary for understanding and readability.\n\n"
                "Rules:\n"
                "1. Retain **faithful meaning** and tone from the original text, adjusting only for cultural relevance.\n"
                "2. Keep **clarity and accuracy**, ensuring the translation is easy for the audience to understand.\n"
                "3. **Adjust terminology** where necessary for cultural or language-specific differences.\n"
                "4. Maintain **appropriate tone**, adjusting only where needed to be culturally appropriate.\n"
                "5. Focus on **clear and simple language** that resonates with the target audience."
            )
        else:
            content = (
                f"You are a precise {target_language} translator. Translate the text as closely as possible to the original, keeping the meaning, tone, and words intact. Make sure the message stays accurate, and avoid adding extra cultural adaptations or local expressions. The focus should remain on the exact words and sentence structure from the original text, while only adjusting for grammatical differences or vocabulary that must be adapted in the {target_language}.\n\n"
                "Rules:\n"
                "1. Provide an **exact translation**, maintaining the original meaning without added cultural expressions.\n"
                "2. Preserve the **original tone** and structure, adjusting only for language-specific grammar.\n"
                "3. Use precise terminology, only altering if there is no direct translation in the target language.\n"
                "4. Do not add any **local cultural references** or expressions unless absolutely necessary.\n"
                "5. Maintain simplicity in language, focusing only on the message's clarity and accuracy."
            )

        if target_language == "Manipuri":
            content = f"Translate the given text into {target_language} using Hindi letters."

        return [
            {"role": "system", "content": content},
            {"role": "user", "content": text},
        ]


    def translate_single(self, text: str, target_language: str, cultural_context: float) -> TranslationResult:
        for attempt in range(self.max_retries):
            try:
                messages = self._create_translation_prompt(text, target_language, cultural_context)
                response = self.client.chat.completions.create(
                    model=self.model_name,
                    messages=messages,
                    max_tokens=500,
                    temperature=0.3
                )
                return TranslationResult(
                    language=target_language,
                    translated_text=response.choices[0].message['content'].strip(),
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
    
    st.title("AI Multi-Language Translator + Cultural Context")
    st.write("Translate text into multiple Indian languages with cultural context control")

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
    available_languages = list(TranslationService.LANGUAGE_MAPPING.keys())
    selected_languages = st.multiselect(
        "Select target languages:",
        available_languages,
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

            # Display results in columns
            st.subheader("Translation Results:")
            for result in results:
                with st.expander(f"{result.language} Translation"):
                    if result.success:
                        st.write(result.translated_text)
                    else:
                        st.error(f"Error: {result.error}")

        except Exception as e:
            st.error(f"An error occurred: {str(e)}")

    # Add some usage tips
    with st.sidebar:
        st.subheader("Usage Tips")
        st.markdown("""
        - Type or paste your text
        - Adjust the cultural context slider:
            - 0-0.3: Literal translation
            - 0.3-0.7: Balanced translation
            - 0.7-1.0: Culturally adapted
        - Select target languages
        - Click Translate
        """)

if __name__ == "__main__":
    main()