import streamlit as st
from typing import List, Optional
from concurrent.futures import ThreadPoolExecutor
import time
from dataclasses import dataclass
from openai import OpenAI
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

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

    def __init__(self, model_name: str = None, use_openrouter: bool = True):
        # Get configuration from environment variables
        self.model_name = model_name or os.getenv("DEFAULT_MODEL", "gpt-4o-mini")
        self.max_retries = int(os.getenv("MAX_RETRIES", "3"))
        self.retry_delay = int(os.getenv("RETRY_DELAY", "2"))
        self.max_tokens = int(os.getenv("MAX_TOKENS", "500"))
        self.temperature = float(os.getenv("TEMPERATURE", "0.3"))
        
        # Configure API based on whether to use OpenRouter or direct OpenAI
        if use_openrouter:
            self._setup_openrouter()
        else:
            self._setup_openai()

    def _setup_openrouter(self):
        """Configure OpenRouter API settings"""
        self.client = OpenAI(
            base_url=os.getenv("OPENROUTER_BASE_URL", "https://openrouter.ai/api/v1"),
            api_key=os.getenv("OPENROUTER_API_KEY"),
        )
        # Use OpenRouter model
        self.model_name = os.getenv("OPENROUTER_MODEL", "google/gemini-2.0-flash-exp:free")

    def _setup_openai(self):
        """Configure direct OpenAI API settings"""
        self.client = OpenAI(
            api_key=os.getenv("OPENAI_API_KEY"),
        )

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
                "3. Ensure that the message is culturally acceptable, but without dramatic changes—don't lose the spirit of the original text.\n"
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
                
                # Prepare extra headers for OpenRouter
                extra_headers = {}
                extra_body = {}
                
                # Add OpenRouter specific headers if using OpenRouter
                if hasattr(self, 'client') and self.client.base_url and "openrouter.ai" in str(self.client.base_url):
                    extra_headers = {
                        "HTTP-Referer": "https://github.com/your-repo",  # Optional
                        "X-Title": "AI Multi-Language Translator",  # Optional
                    }
                
                response = self.client.chat.completions.create(
                    model=self.model_name,
                    messages=prompt,
                    max_tokens=self.max_tokens,
                    temperature=self.temperature,
                    extra_headers=extra_headers,
                    extra_body=extra_body
                )
                translated_text = response.choices[0].message.content.strip()
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

    # API Configuration Section
    st.sidebar.header("API Configuration")
    
    # Check if environment variables are set
    openai_key = os.getenv("OPENAI_API_KEY")
    openrouter_key = os.getenv("OPENROUTER_API_KEY")
    
    if not openai_key and not openrouter_key:
        st.error("⚠️ No API keys found in environment variables!")
        st.info("Please set up your API keys in the .env file:")
        st.code("""
# For OpenAI
OPENAI_API_KEY=your_openai_api_key_here

# For OpenRouter
OPENROUTER_API_KEY=your_openrouter_api_key_here
        """)
        return
    
    # API Provider Selection
    api_provider = st.sidebar.selectbox(
        "API Provider",
        ["OpenRouter", "OpenAI Direct"],
        help="OpenRouter provides access to multiple AI models, while OpenAI Direct uses your OpenAI API key directly"
    )
    
    use_openrouter = api_provider == "OpenRouter"
    
    # Model selection
    if use_openrouter:
        model_options = [
            "google/gemini-2.0-flash-exp:free",
            "openai/gpt-4o-mini",
            "openai/gpt-4o",
            "anthropic/claude-3-5-sonnet",
            "meta-llama/llama-3.1-8b-instruct"
        ]
    else:
        model_options = [
            "gpt-4o-mini",
            "gpt-4o",
            "gpt-3.5-turbo"
        ]
    
    selected_model = st.sidebar.selectbox(
        "Model",
        model_options,
        index=0
    )

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
                translator = TranslationService(
                    model_name=selected_model,
                    use_openrouter=use_openrouter
                )
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
            st.info("Please check your API keys and internet connection.")

if __name__ == "__main__":
    main()
