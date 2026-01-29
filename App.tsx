import React, { useState, useCallback } from 'react';
import { FileUpload } from './components/FileUpload';
import { ResultsDisplay } from './components/ResultsDisplay';
import { Spinner } from './components/Spinner';
import { Header } from './components/Header';
import { extractInfoFromText } from './services/geminiService';
import type { ExtractedData } from './types';
import { InteractiveSelector } from './components/InteractiveSelector';

// Make pdfjsLib globally available from the CDN script
declare const pdfjsLib: any;

type AppStep = 'upload' | 'selection' | 'results';

export default function App() {
  const [step, setStep] = useState<AppStep>('upload');
  const [initialData, setInitialData] = useState<ExtractedData | null>(null);
  const [pdfText, setPdfText] = useState<string>('');
  const [finalData, setFinalData] = useState<ExtractedData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const processPdf = useCallback(async (file: File) => {
    setIsLoading(true);
    setError(null);
    setInitialData(null);
    setPdfText('');

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const numPages = pdf.numPages;
      const pagesToProcess = Math.min(numPages, 2); // Process only the first 2 pages for speed
      let fullText = '';

      for (let i = 1; i <= pagesToProcess; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(' ');
        fullText += pageText + '\n\n';
      }
      
      if (!fullText.trim()) {
        throw new Error("Could not extract any text from the PDF. The file might be image-based or empty.");
      }

      setPdfText(fullText);
      const data = await extractInfoFromText(fullText);
      setInitialData(data);
      setStep('selection');

    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred during PDF processing.';
      setError(`Failed to process PDF: ${errorMessage}`);
      setStep('upload');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSelectionSubmit = (confirmedData: ExtractedData) => {
    setFinalData(confirmedData);
    setStep('results');
  };

  const handleReset = () => {
    setStep('upload');
    setInitialData(null);
    setFinalData(null);
    setPdfText('');
    setError(null);
    setIsLoading(false);
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="text-center">
          <Spinner />
          <p className="mt-4 text-lg text-gray-500">Analyzing your document... this may take a moment.</p>
        </div>
      );
    }
    if (error) {
      return (
        <div className="text-center bg-red-50 border border-red-200 p-6 rounded-lg">
          <p className="text-xl font-bold text-red-800">An Error Occurred</p>
          <p className="mt-2 text-red-600">{error}</p>
          <button
            onClick={handleReset}
            className="mt-6 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg transition-colors duration-300"
          >
            Try Again
          </button>
        </div>
      );
    }
    
    switch (step) {
      case 'upload':
        return <FileUpload onFileSelect={processPdf} />;
      case 'selection':
        return <InteractiveSelector initialData={initialData!} pdfText={pdfText} onSubmit={handleSelectionSubmit} />;
      case 'results':
        return <ResultsDisplay data={finalData!} onReset={handleReset} />;
      default:
        return <FileUpload onFileSelect={processPdf} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-4xl lg:max-w-7xl mx-auto shadow-2xl rounded-2xl">
            <Header />
            <main className="bg-white rounded-b-2xl p-6 sm:p-10 min-h-[30rem] flex items-center justify-center">
                {renderContent()}
            </main>
        </div>
    </div>
  );
}