import React, { useState } from 'react';
import type { ExtractedData, DescuentoData } from '../types';
import { dataLabels, descuentoLabels, orderedKeys } from '../constants';

interface ResultsDisplayProps {
  data: ExtractedData;
  onReset: () => void;
}

const CopyButtonContent: React.FC<{ copied: boolean; defaultIcon: React.ReactNode; label: string }> = ({ copied, defaultIcon, label }) => (
    <>
        {copied ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
        ) : (
            defaultIcon
        )}
        <span className="sr-only">{copied ? 'Copied' : label}</span>
    </>
);

const DataRow: React.FC<{ fieldKey: string; label: string; value?: string; onCopy: (key: string, value?: string) => void; copiedKey: string | null; }> = ({ fieldKey, label, value, onCopy, copiedKey }) => {
    const hasValue = value && value.trim() !== '';
    return (
        <div className="px-4 py-2 grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
            <dt className="font-semibold text-red-700 sm:col-span-1">{label}</dt>
            <dd className="sm:col-span-2">
                <button
                    onClick={() => onCopy(fieldKey, value)}
                    disabled={!hasValue}
                    className="w-full text-left p-2 rounded-md transition-colors duration-200 disabled:cursor-not-allowed group hover:bg-emerald-50 disabled:hover:bg-transparent"
                    aria-label={`Copy ${label}`}
                >
                    <div className="flex justify-between items-center">
                        <span className={`break-words ${hasValue ? 'text-emerald-700 font-medium' : 'text-gray-400 italic'}`}>
                            {value || 'Not found'}
                        </span>
                        {hasValue && (
                            <span className="ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <CopyButtonContent
                                    copied={copiedKey === fieldKey}
                                    label={`Copy ${label}`}
                                    defaultIcon={
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        </svg>
                                    }
                                />
                            </span>
                        )}
                    </div>
                </button>
            </dd>
        </div>
    );
};


export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ data, onReset }) => {
    const [copiedKey, setCopiedKey] = useState<string | null>(null);
    const [removeCommas, setRemoveCommas] = useState(true);

    const formatValue = (value?: string) => {
        if (!value) return value;
        return removeCommas ? value.replace(/,/g, '') : value;
    };

    const handleCopy = (key: string, value?: string) => {
        if (!value) return;
        const valueToCopy = formatValue(value);
        if (!valueToCopy) return;

        navigator.clipboard.writeText(valueToCopy)
            .then(() => {
                setCopiedKey(key);
                setTimeout(() => setCopiedKey(null), 2000);
            })
            .catch(err => console.error('Failed to copy text: ', err));
    };

    const handleCopyAll = () => {
        let textToCopy = orderedKeys
            .map(key => {
                const label = dataLabels[key];
                const value = formatValue(data[key] as string) || 'Not found';
                return `${label} ${value}`;
            })
            .join('\n');
        
        if (data.descuento) {
            textToCopy += '\n\nDESCUENTO S/COMPRAS (NC):\n';
            textToCopy += Object.entries(data.descuento)
                .map(([key, value]) => `  ${descuentoLabels[key as keyof DescuentoData]} ${formatValue(value as string) || 'Not found'}`)
                .join('\n');
        }
        
        navigator.clipboard.writeText(textToCopy)
            .then(() => {
                setCopiedKey('all_labels');
                setTimeout(() => setCopiedKey(null), 2000);
            })
            .catch(err => console.error('Failed to copy all text: ', err));
    };
    
    const handleCopyAllValuesOnly = () => {
        const valuesToCopy = orderedKeys
            .map(key => formatValue(data[key] as string))
            .filter(value => value && value.trim() && value.trim() !== 'Not found');

        if (data.descuento) {
            const discountValues = Object.values(data.descuento)
                .map(value => formatValue(value as string))
                .filter(value => value && value.trim() && value.trim() !== 'Not found');
            valuesToCopy.push(...discountValues);
        }
    
        const textToCopy = valuesToCopy.join('\n');

        navigator.clipboard.writeText(textToCopy)
            .then(() => {
                setCopiedKey('all_values_only');
                setTimeout(() => setCopiedKey(null), 2000);
            })
            .catch(err => console.error('Failed to copy all values: ', err));
    };

  return (
    <div className="w-full max-w-4xl animate-fade-in">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-2">Extracted Information</h2>
        
        <div className="flex justify-center items-center mb-6">
            <label htmlFor="remove-commas-checkbox" className="flex items-center cursor-pointer select-none">
                <input
                    id="remove-commas-checkbox"
                    type="checkbox"
                    checked={removeCommas}
                    onChange={() => setRemoveCommas(!removeCommas)}
                    className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                <span className="ml-2 text-gray-700">Remove commas from numbers</span>
            </label>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6">
            <div className="md:col-span-2 bg-white rounded-lg shadow-md border border-gray-200 divide-y divide-gray-200">
                {orderedKeys.map((key) => (
                    <DataRow 
                        key={key}
                        fieldKey={key}
                        label={dataLabels[key]}
                        value={formatValue(data[key] as string)}
                        onCopy={handleCopy}
                        copiedKey={copiedKey}
                    />
                ))}
            </div>
            
            {data.descuento && (
                 <div className="md:col-span-1">
                    <h3 className="text-xl font-bold text-gray-800 mb-3 pl-2">Descuento S/Compras (NC)</h3>
                     <div className="bg-white rounded-lg shadow-md border border-gray-200 divide-y divide-gray-200">
                        {Object.entries(data.descuento).map(([key, value]) => (
                             <DataRow 
                                key={`descuento-${key}`}
                                fieldKey={`descuento-${key}`}
                                label={descuentoLabels[key as keyof DescuentoData]}
                                value={formatValue(value as string)}
                                onCopy={handleCopy}
                                copiedKey={copiedKey}
                            />
                        ))}
                     </div>
                 </div>
            )}
        </div>
        
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 flex-wrap">
            <button 
                onClick={handleCopyAll}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-red-700 hover:bg-red-800 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-md"
            >
                {copiedKey === 'all_labels' ? (
                     <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span>Copied!</span>
                    </>
                ) : (
                    <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2h-2m-4-5H5a2 2 0 00-2 2v6a2 2 0 002 2h6a2 2 0 002 2v-1" />
                        </svg>
                        <span>Copy All</span>
                    </>
                )}
            </button>
             <button 
                onClick={handleCopyAllValuesOnly}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-md"
            >
                {copiedKey === 'all_values_only' ? (
                     <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span>Copied!</span>
                    </>
                ) : (
                    <>
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                        </svg>
                        <span>Copy Values</span>
                    </>
                )}
            </button>
            <button 
                onClick={onReset}
                className="w-full sm:w-auto bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-md"
            >
                Upload Another PDF
            </button>
        </div>
    </div>
  );
};