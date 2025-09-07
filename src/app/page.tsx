"use client";

import { useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Download, RotateCcw, Sparkles } from "lucide-react";

interface ProcessedImage {
  original: string;
  processed: string;
  filename: string;
}

export default function HomePage() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [processedImage, setProcessedImage] = useState<ProcessedImage | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string>("");
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file");
      return;
    }
    
    if (file.size > 10 * 1024 * 1024) {
      setError("File size must be less than 10MB");
      return;
    }
    
    setError("");
    setSelectedImage(file);
    setProcessedImage(null);
    
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const processImage = async () => {
    if (!selectedImage) return;
    
    setIsProcessing(true);
    setError("");
    
    try {
      const formData = new FormData();
      formData.append("image", selectedImage);
      
      const response = await fetch("/api/remove-background", {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to process image");
      }
      
      const processedBlob = await response.blob();
      const processedUrl = URL.createObjectURL(processedBlob);
      
      setProcessedImage({
        original: previewUrl,
        processed: processedUrl,
        filename: selectedImage.name,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadImage = () => {
    if (!processedImage) return;
    
    const link = document.createElement("a");
    link.href = processedImage.processed;
    link.download = `no-bg-${processedImage.filename}`;
    link.click();
  };

  const resetApp = () => {
    setSelectedImage(null);
    setPreviewUrl("");
    setProcessedImage(null);
    setIsProcessing(false);
    setError("");
    setDragActive(false);
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-full p-3">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Photo Background Remover
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Remove backgrounds from your photos instantly using AI. Perfect for product photos, 
            portraits, and creating professional images.
          </p>
        </div>

        {/* Upload Section */}
        {!selectedImage && (
          <Card className="p-8 border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors">
            <div
              className={`text-center cursor-pointer ${
                dragActive ? "bg-blue-50" : ""
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Drop your image here
              </h3>
              <p className="text-gray-600 mb-6">
                or click to browse files (PNG, JPG, JPEG, WEBP up to 10MB)
              </p>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload">
                <Button size="lg" className="cursor-pointer">
                  Choose File
                </Button>
              </label>
            </div>
          </Card>
        )}

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-center">{error}</p>
          </div>
        )}

        {/* Preview and Processing */}
        {selectedImage && !processedImage && (
          <div className="grid md:grid-cols-1 gap-6">
            <Card className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Original Image
              </h3>
              <div className="flex flex-col items-center">
                <img
                  src={previewUrl}
                  alt="Selected"
                  className="max-w-full h-auto max-h-96 rounded-lg shadow-lg mb-6"
                />
                <div className="flex gap-4">
                  <Button
                    onClick={processImage}
                    disabled={isProcessing}
                    size="lg"
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  >
                    {isProcessing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Remove Background
                      </>
                    )}
                  </Button>
                  <Button onClick={resetApp} variant="outline" size="lg">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Start Over
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Results Comparison */}
        {processedImage && (
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Original
              </h3>
              <img
                src={processedImage.original}
                alt="Original"
                className="w-full h-auto rounded-lg shadow-lg"
              />
            </Card>
            
            <Card className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Background Removed
              </h3>
              <div className="relative">
                <img
                  src={processedImage.processed}
                  alt="Background removed"
                  className="w-full h-auto rounded-lg shadow-lg"
                  style={{ backgroundColor: "transparent" }}
                />
                <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 opacity-30 rounded-lg -z-10" />
              </div>
            </Card>
            
            <div className="md:col-span-2 text-center">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={downloadImage}
                  size="lg"
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Result
                </Button>
                <Button onClick={resetApp} variant="outline" size="lg">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Process Another Image
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Features */}
        <div className="mt-16 grid md:grid-cols-3 gap-6">
          <div className="text-center p-6">
            <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Upload className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Easy Upload
            </h3>
            <p className="text-gray-600">
              Simply drag and drop or click to upload your image files
            </p>
          </div>
          
          <div className="text-center p-6">
            <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              AI Processing
            </h3>
            <p className="text-gray-600">
              Advanced AI algorithms automatically detect and remove backgrounds
            </p>
          </div>
          
          <div className="text-center p-6">
            <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Download className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Instant Download
            </h3>
            <p className="text-gray-600">
              Download your background-free image in high quality immediately
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}