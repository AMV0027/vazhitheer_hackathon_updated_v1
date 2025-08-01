# AI Multi-Language Translator Backend

This backend provides a Streamlit application for translating text into multiple languages with cultural context control using OpenAI and OpenRouter APIs.

## Setup Instructions

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Environment Configuration

Copy the example environment file and configure your API keys:

```bash
cp env.example .env
```

Edit the `.env` file with your API keys:

```env
# OpenAI API Configuration
OPENAI_API_KEY=your_openai_api_key_here

# OpenRouter Configuration
OPENROUTER_API_KEY=your_openrouter_api_key_here
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1

# Model Configuration
DEFAULT_MODEL=gpt-4o-mini
OPENROUTER_MODEL=openai/gpt-4o-mini

# API Configuration
MAX_TOKENS=500
TEMPERATURE=0.3
MAX_RETRIES=3
RETRY_DELAY=2
```

### 3. Getting API Keys

#### OpenAI API Key
1. Visit [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key to your `.env` file

#### OpenRouter API Key
1. Visit [OpenRouter](https://openrouter.ai/)
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key to your `.env` file

### 4. Running the Application

```bash
streamlit run frontend_ai_openAi.py
```

## Features

- **Multi-language Translation**: Support for 25+ Indian languages
- **Cultural Context Control**: Adjust translation style from literal to culturally adapted
- **API Provider Selection**: Choose between OpenRouter and direct OpenAI
- **Model Selection**: Access to various AI models through OpenRouter
- **Batch Translation**: Translate to multiple languages simultaneously
- **Error Handling**: Robust error handling with retry mechanisms

## Supported Languages

- English, Assamese, Bangla, Bodo, Dogri, Gujarati
- Hindi, Kashmiri, Kannada, Konkani, Maithili
- Malayalam, Manipuri, Marathi, Nepali, Odia, Punjabi
- Tamil, Telugu, Santali, Sindhi, Urdu
- Konyak, Khasi, Jaintia

## API Configuration

The application supports two API providers:

### OpenRouter
- Provides access to multiple AI models
- More cost-effective for some use cases
- Supports models from OpenAI, Anthropic, Meta, Google, and others

### OpenAI Direct
- Direct access to OpenAI models
- Uses your OpenAI API key directly
- Limited to OpenAI models only

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `OPENAI_API_KEY` | Your OpenAI API key | Required |
| `OPENROUTER_API_KEY` | Your OpenRouter API key | Required |
| `OPENROUTER_BASE_URL` | OpenRouter API base URL | `https://openrouter.ai/api/v1` |
| `DEFAULT_MODEL` | Default model for OpenAI | `gpt-4o-mini` |
| `OPENROUTER_MODEL` | Default model for OpenRouter | `google/gemini-2.0-flash-exp:free` |
| `MAX_TOKENS` | Maximum tokens for responses | `500` |
| `TEMPERATURE` | Model temperature (creativity) | `0.3` |
| `MAX_RETRIES` | Maximum retry attempts | `3` |
| `RETRY_DELAY` | Delay between retries (seconds) | `2` |

## Usage

1. Start the Streamlit application
2. Configure API settings in the sidebar
3. Enter text to translate
4. Adjust cultural context level
5. Select target languages
6. Click "Translate" to get results

## Troubleshooting

### Common Issues

1. **No API keys found**: Make sure you've created a `.env` file with your API keys
2. **API errors**: Check your API key validity and internet connection
3. **Model not available**: Some models may not be available through OpenRouter, try a different model

### Error Messages

- `No API keys found`: Set up your API keys in the `.env` file
- `API error`: Check your API key and internet connection
- `Model not found`: Try a different model from the dropdown 