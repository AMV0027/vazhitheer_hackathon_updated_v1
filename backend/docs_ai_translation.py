import streamlit as st
from typing import List, Dict, Optional
from huggingface_hub import InferenceClient
from concurrent.futures import ThreadPoolExecutor
import time
from dataclasses import dataclass
from io import BytesIO
from PyPDF2 import PdfReader
from docx import Document

# Define TranslationResult data class
@dataclass
class TranslationResult:
    language: str
    translated_text: str
    success: bool
    error: Optional[str] = None

# TranslationService class for handling translation logic
class TranslationService:
    DEFAULT_API_KEY = "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"
    
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
            cultural_instruction = (
                "Provide direct translation with high preference on cultural context, for better understanding. Consider using modern wordings and phrases to make people understand better."
            )
        elif cultural_context > 0.3:
            cultural_instruction = (
                "Provide only the direct translation with relevant cultural context for better explanation. Consider using modern wordings and phrases to make people understand better."
            )
        else:
            cultural_instruction = (
                "Provide only the direct translation with cultural context"
            )

        if target_language == "Manipuri":
            content = f"Translate the given text into {target_language} using Hindi letters."
        else:
            content = f"""
            You are a highly skilled {target_language} translator. You translate the text given by the user into {target_language}.
            Rules to follow:
            1. {cultural_instruction}
            2. Maintain the original meaning and tone.
            3. Use formal language unless the source is casual.
            4. Keep any technical terms accurate.
            5. Do not add explanations or notes.
            6. Don't add emojis.                    
            """  

        return [
            {
                "role": "system",
                "content": content,
            },
            {
                "role": "user",
                "content": text,
            }
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

# Utility function to extract text from PDF by page
def extract_pdf_text_by_page(file) -> List[str]:
    reader = PdfReader(file)
    pages = [page.extract_text() for page in reader.pages]
    return [page.strip() for page in pages if page.strip()]

# Utility function to extract text from DOCX file
def extract_docx_text(file) -> str:
    doc = Document(file)
    return "\n".join([para.text for para in doc.paragraphs])

# Utility function to extract text from TXT file
def extract_txt_text(file) -> str:
    return file.read().decode("utf-8")

# Main function to run the Streamlit app
def main():
    st.set_page_config(page_title="File Language Translator with Preservation", page_icon="🌐")

    st.title("AI Document Translator (PDF, DOCX, TXT) + Cultural Context")

    # File upload
    uploaded_file = st.file_uploader("Choose a file (PDF, DOCX, TXT)", type=["pdf", "docx", "txt"])
    
    if uploaded_file is not None:
        pages = []
        text = ""
        
        # Extract text based on file type
        if uploaded_file.type == "application/pdf":
            pages = extract_pdf_text_by_page(BytesIO(uploaded_file.read()))
            st.subheader("PDF Text:")
            for i, page in enumerate(pages[:5]):  # show first 5 pages as preview
                st.write(f"Page {i+1}: {page[:500]}...")  # Preview first 500 characters
        elif uploaded_file.type == "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
            text = extract_docx_text(uploaded_file)
            st.subheader("Document Text:")
            st.write(text[:500] + "...")
        elif uploaded_file.type == "text/plain":
            text = extract_txt_text(uploaded_file)
            st.subheader("Text File:")
            st.write(text[:500] + "...")

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

        if st.button("Translate") and selected_languages:
            try:
                with st.spinner("Translating..."):
                    translator = TranslationService()
                    translated_texts = []
                    
                    # Translate each page separately to avoid token overflow
                    for i, page_text in enumerate(pages):
                        results = translator.translate_batch(
                            page_text, selected_languages, cultural_context
                        )
                        translated_page_texts = {
                            lang: result.translated_text for result, lang in zip(results, selected_languages)
                        }
                        translated_texts.append(translated_page_texts)

                    # Display results and allow file download
                    st.subheader("Translation Results:")
                    for page_num, translated_page_texts in enumerate(translated_texts):
                        for lang, translated_text in translated_page_texts.items():
                            st.write(f"Page {page_num + 1} - {lang}: {translated_text[:500]}...")  # Show preview

                    # Optionally save translated content back to file
                    # Here you can implement saving translated content back to a new file if needed.

            except Exception as e:
                st.error(f"An error occurred: {str(e)}")

if __name__ == "__main__":
    main()
