import React, { useState } from "react";
import { CiSquarePlus, CiSquareMinus } from "react-icons/ci";
import { IoMdSend } from "react-icons/io";
import { FaCopy, FaDownload } from "react-icons/fa";

function ManyLanguageTranslator() {
  const [translateMode, setTranslateMode] = useState("text");
  const [textInput, setTextInput] = useState("");
  const [fileContent, setFileContent] = useState(null);
  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const [translations, setTranslations] = useState({});
  const [culturalContext, setCulturalContext] = useState(0.5);
  const [loading, setLoading] = useState(false);
  const languages = ["English", "Hindi", "Tamil", "Bangla", "Gujarati"];

  const handleTranslate = async () => {
    if (!selectedLanguages.length || (!textInput && !fileContent)) {
      alert("Please provide text or upload a document and select languages.");
      return;
    }

    const content = translateMode === "text" ? textInput : fileContent;
    setLoading(true);

    try {
      const response = await fetch("http://localhost:8000/translate/specific", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: content,
          cultural_context: culturalContext,
          languages: selectedLanguages,
        }),
      });

      if (!response.ok) throw new Error("Translation request failed.");

      const data = await response.json();
      setTranslations(data.translations || {});
    } catch (error) {
      alert(`Error during translation: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setFileContent(e.target.result);
      reader.readAsText(file);
    }
  };

  const toggleLanguageSelection = (lang) =>
    setSelectedLanguages((prev) =>
      prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]
    );

  const copyToClipboard = () => {
    const content = Object.entries(translations)
      .map(([lang, text]) => `${lang}:\n${text}`)
      .join("\n\n");
    navigator.clipboard.writeText(content);
    alert("Translations copied to clipboard.");
  };

  const downloadTranslations = () => {
    const content = Object.entries(translations)
      .map(([lang, text]) => `${lang}:\n${text}`)
      .join("\n\n");
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "translations.txt";
    link.click();
  };

  return (
    <div className="p-4 h-full">
      <h1 className="text-xl font-bold">Language Translator</h1>

      <div className="mt-2">
        <div className="flex gap-4">
          <button
            onClick={() => setTranslateMode("text")}
            className={`px-4 py-2 rounded ${
              translateMode === "text" ? "bg-blue-500 text-white" : "bg-gray-300"
            }`}
          >
            Text Input
          </button>
          <button
            onClick={() => setTranslateMode("file")}
            className={`px-4 py-2 rounded ${
              translateMode === "file" ? "bg-blue-500 text-white" : "bg-gray-300"
            }`}
          >
            Upload Document
          </button>
        </div>

        {translateMode === "text" ? (
          <textarea
            className="mt-4 w-full p-2 border rounded"
            placeholder="Enter text here..."
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
          />
        ) : (
          <input
            type="file"
            className="mt-4"
            accept=".txt"
            onChange={handleFileUpload}
          />
        )}
      </div>

      <div className="mt-4">
        <label>Cultural Context: {culturalContext}</label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={culturalContext}
          onChange={(e) => setCulturalContext(parseFloat(e.target.value))}
          className="w-full"
        />
      </div>

      <div className="mt-4">
        <h3>Select Target Languages:</h3>
        <div className="flex flex-wrap gap-2 mt-2">
          {languages.map((lang) => (
            <button
              key={lang}
              onClick={() => toggleLanguageSelection(lang)}
              className={`px-4 py-2 rounded ${
                selectedLanguages.includes(lang)
                  ? "bg-green-500 text-white"
                  : "bg-gray-300"
              }`}
            >
              {lang}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={handleTranslate}
        className="mt-4 w-full p-2 bg-blue-500 text-white rounded"
      >
        {loading ? "Translating..." : "Translate"}
      </button>

      {Object.keys(translations).length > 0 && (
        <div className="mt-4">
          <h3>Translations:</h3>
          <div className="flex gap-4 mt-2">
            <button
              onClick={copyToClipboard}
              className="px-4 py-2 bg-gray-500 text-white rounded"
            >
              Copy
            </button>
            <button
              onClick={downloadTranslations}
              className="px-4 py-2 bg-gray-500 text-white rounded"
            >
              Download
            </button>
          </div>
          <div className="mt-4">
            {Object.entries(translations).map(([lang, text]) => (
              <div key={lang} className="mt-2">
                <h4>{lang}:</h4>
                <p>{text}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ManyLanguageTranslator;
