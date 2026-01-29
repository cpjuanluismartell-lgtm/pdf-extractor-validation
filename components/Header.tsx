import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="bg-emerald-800 text-center p-8 rounded-t-2xl">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white">
            PDF Information Extractor
        </h1>
        <p className="mt-3 text-lg text-emerald-200 max-w-2xl mx-auto">
            Optimized for speed. Upload a PDF and our lightweight AI will instantly extract key information from the first few pages.
        </p>
    </header>
  );
};