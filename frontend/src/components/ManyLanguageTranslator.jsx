import React, { useState } from "react";
import { CiSquarePlus, CiSquareMinus } from "react-icons/ci";
import { IoMdSend } from "react-icons/io";
import { FaCopy, FaDownload } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold text-blue-800">Language Translator</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Mode Selection */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Translation Mode</Label>
            <div className="flex gap-2">
              <Button
                onClick={() => setTranslateMode("text")}
                variant={translateMode === "text" ? "default" : "outline"}
                className="flex-1"
              >
                Text Input
              </Button>
              <Button
                onClick={() => setTranslateMode("file")}
                variant={translateMode === "file" ? "default" : "outline"}
                className="flex-1"
              >
                Upload Document
              </Button>
            </div>
          </div>

          {/* Input Section */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              {translateMode === "text" ? "Text to Translate" : "Upload Document"}
            </Label>
            {translateMode === "text" ? (
              <Textarea
                placeholder="Enter text here..."
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                className="min-h-[120px] resize-none"
              />
            ) : (
              <div className="space-y-2">
                <Input
                  type="file"
                  accept=".txt"
                  onChange={handleFileUpload}
                  className="cursor-pointer"
                />
                {fileContent && (
                  <div className="p-3 bg-gray-50 rounded-md">
                    <p className="text-sm text-gray-600">File loaded successfully</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Cultural Context Slider */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              Cultural Context: {culturalContext}
            </Label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={culturalContext}
              onChange={(e) => setCulturalContext(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>

          {/* Language Selection */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Select Target Languages</Label>
            <div className="flex flex-wrap gap-2">
              {languages.map((lang) => (
                <Button
                  key={lang}
                  onClick={() => toggleLanguageSelection(lang)}
                  variant={selectedLanguages.includes(lang) ? "default" : "outline"}
                  size="sm"
                  className="text-xs"
                >
                  {lang}
                </Button>
              ))}
            </div>
          </div>

          {/* Translate Button */}
          <Button
            onClick={handleTranslate}
            disabled={loading || (!textInput && !fileContent) || selectedLanguages.length === 0}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Translating...
              </>
            ) : (
              <>
                <IoMdSend className="mr-2 h-4 w-4" />
                Translate
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Results Section */}
      {Object.keys(translations).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-green-800">Translations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button
                onClick={copyToClipboard}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <FaCopy className="h-4 w-4" />
                Copy All
              </Button>
              <Button
                onClick={downloadTranslations}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <FaDownload className="h-4 w-4" />
                Download
              </Button>
            </div>

            <Separator />

            <ScrollArea className="h-[300px]">
              <div className="space-y-4">
                {Object.entries(translations).map(([lang, text]) => (
                  <Card key={lang} className="bg-gray-50">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                          {lang}
                        </Badge>
                      </div>
                      <p className="text-gray-800 leading-relaxed">{text}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default ManyLanguageTranslator;
