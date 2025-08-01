require('dotenv').config();
const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');

// Initialize OpenRouter API using environment variables
const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": process.env.SITE_URL || "https://your-app-domain.com", // Optional. Site URL for rankings on openrouter.ai.
    "X-Title": process.env.SITE_NAME || "Translation Service", // Optional. Site title for rankings on openrouter.ai.
  },
});

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors({
  origin: "*",
  credentials: true,
  methods: ["*"],
  allowedHeaders: ["*"]
}));

app.use(express.json());

// Supported languages
const SUPPORTED_LANGUAGES = [
  "English", "Assamese", "Bangla", "Bodo", "Dogri", "Gujarati", "Hindi", "Kashmiri", 
  "Kannada", "Konkani", "Maithili", "Malayalam", "Manipuri", "Marathi", "Nepali", "Odia", 
  "Punjabi", "Tamil", "Telugu", "Santali", "Sindhi", "Urdu", "Konyak", "Khasi", "Jaintia",
];

class TranslationService {
  constructor(modelName = process.env.OPENROUTER_MODEL) {
    this.modelName = modelName;
  }

  createPrompt(text, language, context) {
    let culturalInstruction;
    
    if (context > 0.7) {
      culturalInstruction = "Provide a direct, nuanced translation with a strong emphasis on cultural context to enhance understanding. Use modern, idiomatic expressions and phrasing suitable for both formal and informal contexts.";
    } else if (context > 0.3) {
      culturalInstruction = "Provide a direct translation, integrating relevant cultural context where necessary to clarify the meaning. Ensure modern clarity while maintaining formal correctness.";
    } else {
      culturalInstruction = "Provide a translation, prioritizing cultural context to convey deeper nuances and avoid misinterpretations.";
    }

    const content = (
      `You are a highly skilled ${language} translator. Your task is to translate the provided text into ${language}, accurately preserving meaning and tone without any additional context or explanations. Your translation should focus on fluency, accuracy, and appropriateness.\n` +
      "Rules to follow:\n" +
      `Cultural context: ${culturalInstruction}\n` +
      "1. Preserve the original meaning and tone without grammatical errors.\n" +
      "2. Use formal language unless the source text is more informal or colloquial.\n" +
      "3. Ensure technical terms are translated accurately. If no specific term exists in " + language + ", retain the English term as-is.\n" +
      "4. Do not add explanations, notes, or emojis—focus solely on translation.\n" +
      "5. Do not use any markdown stylings or formatting. Simply provide the clean, accurate translation.\n" +
      `6. If the proper script for the ${language} is not available, give it in the script of the nearby most spoken languages script.\n` +
      `Ensure that all cultural subtleties and linguistic variations in ${language} are considered, especially in terms of local expressions or idioms that could enhance the quality of the translation.\n`
    );

    return [
      { role: "system", content: content },
      { role: "user", content: `provided text: ${text}` }
    ];
  }

  async translate(text, language, context) {
    try {
      const prompt = this.createPrompt(text, language, context);
      const response = await openai.chat.completions.create({
        model: this.modelName,
        messages: prompt,
        max_tokens: 180000,
        temperature: 0.3,
      });

      return {
        language: language,
        text: response.choices[0].message.content.trim(),
        error: null
      };
    } catch (error) {
      return {
        language: language,
        text: null,
        error: error.message
      };
    }
  }

  async batchTranslate(text, languages, context) {
    const results = [];
    
    for (let i = 0; i < languages.length; i++) {
      const lang = languages[i];
      const result = await this.translate(text, lang, context);
      results.push(result);
      
      // Add delay between requests (except for the last one)
      if (i < languages.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    return results;
  }
}

// Validation middleware
const validateCulturalContext = (req, res, next) => {
  const { cultural_context } = req.body;
  if (cultural_context !== undefined && (cultural_context < 0.0 || cultural_context > 1.0)) {
    return res.status(400).json({
      error: "Cultural context must be between 0.0 and 1.0"
    });
  }
  next();
};

// Routes
app.post("/translate/all", validateCulturalContext, async (req, res) => {
  try {
    const { text, cultural_context = 0.5 } = req.body;
    
    if (!text) {
      return res.status(400).json({
        error: "Text is required"
      });
    }

    const translator = new TranslationService();
    const results = await translator.batchTranslate(
      text,
      SUPPORTED_LANGUAGES,
      cultural_context
    );

    const translations = {};
    results.forEach(res => {
      translations[res.language] = res.error ? `Error: ${res.error}` : res.text;
    });

    res.json({ translations });
  } catch (error) {
    res.status(500).json({
      error: "Internal server error",
      message: error.message
    });
  }
});

app.post("/translate/specific", validateCulturalContext, async (req, res) => {
  try {
    const { text, cultural_context = 0.5, languages } = req.body;
    
    if (!text) {
      return res.status(400).json({
        error: "Text is required"
      });
    }

    if (!languages || !Array.isArray(languages)) {
      return res.status(400).json({
        error: "Languages array is required"
      });
    }

    // Validate requested languages
    const invalidLanguages = languages.filter(lang => !SUPPORTED_LANGUAGES.includes(lang));
    if (invalidLanguages.length > 0) {
      return res.status(400).json({
        error: `Invalid languages: ${invalidLanguages.join(', ')}. Supported languages are: ${SUPPORTED_LANGUAGES.join(', ')}`
      });
    }

    const translator = new TranslationService();
    const results = await translator.batchTranslate(
      text,
      languages,
      cultural_context
    );

    const translations = {};
    results.forEach(res => {
      translations[res.language] = res.error ? `Error: ${res.error}` : res.text;
    });

    res.json({ translations });
  } catch (error) {
    res.status(500).json({
      error: "Internal server error",
      message: error.message
    });
  }
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ 
    status: "OK", 
    message: "Translation service is running with OpenRouter",
    model: process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini"
  });
});

// Start server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on port ${PORT} with OpenRouter integration`);
  console.log(`Using API key: ${process.env.OPENROUTER_API_KEY ? 'Configured' : 'Not configured'}`);
  console.log(`Using model: ${process.env.OPENROUTER_MODEL}`);
});

module.exports = app;
