# Translation Server with OpenRouter

This Node.js server provides translation services using OpenRouter API to access multiple AI models.

## Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Create a `.env` file in the root directory with the following variables:

```env
OPENROUTER_API_KEY=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
OPENROUTER_MODEL=openai/gpt-4o-mini
SITE_URL=https://your-app-domain.com
SITE_NAME=Translation Service
PORT=8000
```

**Available Models:**
- `openai/gpt-4o-mini` (default) - Fast and cost-effective
- `openai/gpt-4o` - More capable but slower
- `anthropic/claude-3-haiku` - Fast and cost-effective
- `google/gemini-2.0-flash-exp:free` - Google's free model
- `meta-llama/llama-3.1-8b-instruct` - Open source option

### 3. Run the Server
```bash
# Production
npm start

# Development (with auto-restart)
npm run dev
```

## API Endpoints

### POST /translate/all
Translates text to all supported languages.

**Request Body:**
```json
{
  "text": "Hello world",
  "cultural_context": 0.5
}
```

**Response:**
```json
{
  "translations": {
    "English": "Hello world",
    "Hindi": "नमस्ते दुनिया",
    "Tamil": "வணக்கம் உலகம்",
    // ... all supported languages
  }
}
```

### POST /translate/specific
Translates text to specific languages.

**Request Body:**
```json
{
  "text": "Hello world",
  "languages": ["Hindi", "Tamil", "Telugu"],
  "cultural_context": 0.5
}
```

### GET /health
Health check endpoint.

**Response:**
```json
{
  "status": "OK",
  "message": "Translation service is running with OpenRouter",
  "model": "openai/gpt-4o-mini"
}
```

## Supported Languages
- English, Assamese, Bangla, Bodo, Dogri, Gujarati, Hindi, Kashmiri
- Kannada, Konkani, Maithili, Malayalam, Manipuri, Marathi, Nepali, Odia
- Punjabi, Tamil, Telugu, Santali, Sindhi, Urdu, Konyak, Khasi, Jaintia

## Features
- ✅ OpenRouter API integration with correct configuration
- ✅ Configurable AI model via environment variables
- ✅ Cultural context weighting (0.0 to 1.0)
- ✅ Batch translation with rate limiting
- ✅ Error handling
- ✅ CORS enabled
- ✅ Environment variable configuration 