import React, { useState, useMemo } from 'react';
import type { ExtractedData } from '../types';
import { orderedKeys, dataLabels, orderedDescuentoKeys, descuentoLabels } from '../constants';

interface InteractiveSelectorProps {
  initialData: ExtractedData;
  pdfText: string;
  onSubmit: (confirmedData: ExtractedData) => void;
}

export const InteractiveSelector: React.FC<InteractiveSelectorProps> = ({ initialData, pdfText, onSubmit }) => {
  const [mappedData, setMappedData] = useState<ExtractedData>(initialData);
  const [activeLabelKey, setActiveLabelKey] = useState<string | null>(null);
  const [selectedTokens, setSelectedTokens] = useState<{ token: string; index: number }[]>([]);

  const pdfTokens = useMemo(() => pdfText.split(/[\s\n]+/).filter(Boolean), [pdfText]);

  const commitSelection = (key: string, value: string) => {
    const [parentKey, childKey] = key.split('.');
    
    if (childKey) {
        setMappedData(prev => ({
            ...prev,
            descuento: {
                ...(prev.descuento as any),
                [childKey]: value,
            },
        }));
    } else {
        setMappedData(prev => {
            const isPedidoSap = parentKey === 'importePedidoSap';
            return {
                ...prev,
                [parentKey]: value,
                // Also update recepcionBien if we are updating pedidoSap
                ...(isPedidoSap && { importeRecepcionBien: value }),
            };
        });
    }
  }

  const handleLabelClick = (newKey: string) => {
    if (activeLabelKey && activeLabelKey !== newKey && selectedTokens.length > 0) {
      const value = selectedTokens.map(t => t.token).join(' ');
      commitSelection(activeLabelKey, value);
    }

    if (activeLabelKey === newKey) {
      setActiveLabelKey(null);
      setSelectedTokens([]);
    } else {
      setActiveLabelKey(newKey);
      setSelectedTokens([]);
    }
  };

  const handleTokenClick = (token: string, index: number) => {
    if (!activeLabelKey) return;

    setSelectedTokens(prev => {
      const isSelected = prev.some(t => t.index === index);
      if (isSelected) {
        return prev.filter(t => t.index !== index);
      } else {
        const newSelection = [...prev, { token, index }];
        return newSelection.sort((a, b) => a.index - b.index);
      }
    });
  };
  
  const handleSubmit = () => {
    if (activeLabelKey && selectedTokens.length > 0) {
        const value = selectedTokens.map(t => t.token).join(' ');
        const [parentKey, childKey] = activeLabelKey.split('.');
        let finalData = { ...mappedData };

        if (childKey) {
            finalData = {
                ...mappedData,
                descuento: {
                    ...(mappedData.descuento),
                    [childKey]: value,
                },
            };
        } else {
            const isPedidoSap = parentKey === 'importePedidoSap';
            finalData = { 
                ...mappedData, 
                [parentKey]: value,
                ...(isPedidoSap && { importeRecepcionBien: value }),
            };
        }
        onSubmit(finalData);
    } else {
        onSubmit(mappedData);
    }
  };

  const renderField = (fieldKey: string, label: string, value?: string) => {
    const isActive = activeLabelKey === fieldKey;
    const isSelecting = isActive && selectedTokens.length > 0;
    const displayValue = isSelecting ? selectedTokens.map(t => t.token).join(' ') : value;

    return (
      <button
        key={fieldKey}
        onClick={() => handleLabelClick(fieldKey)}
        className={`w-full text-left p-3 rounded-md transition-all duration-200 border-2 ${isActive ? 'bg-red-50 border-red-400 shadow' : 'bg-white border-transparent hover:bg-gray-50'}`}
      >
        <div className="flex justify-between items-center">
          <p className="font-semibold text-red-700">{label}</p>
          <p className={`mt-1 text-sm break-all text-right ${displayValue ? (isSelecting ? 'text-red-600 font-medium' : 'text-emerald-700 font-medium') : 'text-gray-400 italic'}`}>
            {displayValue || 'Click to select...'}
          </p>
        </div>
      </button>
    );
  };

  return (
    <div className="w-full animate-fade-in">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Left Column: Main Data */}
            <div className="bg-gray-50 p-4 rounded-lg shadow-inner">
                <div className="space-y-1 divide-y divide-gray-200">
                    {orderedKeys.map(key => renderField(key, dataLabels[key], mappedData[key] as string))}
                </div>
            </div>

            {/* Right Column: Discount and Preview */}
            <div className="flex flex-col gap-8">
                {/* Discount Data Section */}
                <div className="bg-gray-50 p-4 rounded-lg shadow-inner">
                    <h3 className="text-xl font-bold text-gray-800 mb-3 pl-2">Descuento S/Compras (NC)</h3>
                    <div className="bg-white rounded-lg shadow-md border border-gray-200 divide-y divide-gray-200">
                        {orderedDescuentoKeys.map(key => {
                            const compositeKey = `descuento.${key}`;
                            return renderField(compositeKey, descuentoLabels[key], mappedData.descuento?.[key]);
                        })}
                    </div>
                </div>

                {/* Document Preview Section */}
                <div className="bg-gray-50 p-4 rounded-lg shadow-inner flex-grow flex flex-col">
                    <div className="flex-grow min-h-[24rem] overflow-y-auto p-2 bg-white border-2 border-dashed border-blue-400 rounded-md flex flex-wrap gap-1 content-start">
                        {pdfTokens.map((token, index) => {
                        const isSelected = selectedTokens.some(t => t.index === index);
                        const isLabel = token.endsWith(':');
                        const buttonClasses = `
                            p-1 rounded text-xs transition-colors duration-150 disabled:cursor-not-allowed disabled:hover:bg-gray-100 disabled:opacity-50
                            ${isSelected ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-red-200 hover:text-red-800'}
                            ${isLabel ? 'font-bold' : ''}
                        `;
                        return (
                            <button
                            key={`${token}-${index}`}
                            onClick={() => handleTokenClick(token, index)}
                            disabled={!activeLabelKey}
                            className={buttonClasses.replace(/\s+/g, ' ').trim()}
                            aria-label={`Select '${token}'`}
                            >
                            {token}
                            </button>
                        );
                        })}
                    </div>
                </div>
            </div>
        </div>

        <div className="mt-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Confirm Extracted Data</h2>
            <p className="text-gray-500 mb-6 max-w-2xl mx-auto">Click a label from the lists above, then click the correct value(s) from the document preview.</p>
            <button
              onClick={handleSubmit}
              className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3 px-12 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Process Data
            </button>
        </div>
    </div>
  );
};
