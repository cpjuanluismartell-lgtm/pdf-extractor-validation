
import type { ExtractedData, DescuentoData } from '../types';

/**
 * Helper function to execute a regex against a text block and return a specific capture group.
 * @param text The text to search within.
 * @param regex The regular expression to execute.
 * @param group The capture group number to return (defaults to 1).
 * @returns The trimmed string of the found group, or an empty string if not found.
 */
const extract = (text: string, regex: RegExp, group: number = 1): string => {
  const match = text.match(regex);
  return match?.[group]?.trim() ?? '';
};

/**
 * Extracts structured information from raw text using local regular expressions.
 * This function is designed to replace the remote Gemini API call.
 * @param text The raw text extracted from the PDF.
 * @returns A promise that resolves to the ExtractedData object.
 */
export const extractInfoFromText = async (text: string): Promise<ExtractedData> => {
  // FIX: The original code had a syntax error attempting to call a Promise.
  // The logic is now placed directly inside the async function. The `async`
  // keyword automatically ensures a Promise is returned, so the wrapper is not needed.
  const data: ExtractedData = {};

  // --- GENERAL INFORMATION ---
  data.numeroAcreedorSAP = extract(text, /Número de Acreedor SAP:?\s*(\d+)/i);
  data.noCopade = extract(text, /No\.\s*COPADE:?\s*([\w\d-]+)/i);
  data.noContrato = extract(text, /No\.\s*Contrato:?\s*([\w\d-]+)/i);
  data.noEstRem = extract(text, /(?:No\.\s*Est\s*\/\s*Rem|Estimación|Remisión|Rem):?\s*([\w\d.-]+)/i);
  
  // Look for either "Fecha cont." or "Emisión" and normalize the date format.
  const fechaContMatch = text.match(/(?:Fecha\s*cont\.|Emisión):?\s*(\d{2})[\.\/](\d{2})[\.\/](\d{4})/i);
  if (fechaContMatch) {
    data.fechaCont = `${fechaContMatch[1]}/${fechaContMatch[2]}/${fechaContMatch[3]}`;
  }


  // --- FINANCIAL SUMMARY ---
  // More flexible regex to find financial summary fields, not anchored to the start of a line.
  data.importe = extract(text, /\bImporte:?\s+\$?\s*([\d,]+\.\d{2})/i);
  data.iva = extract(text, /\bIVA:?\s+\$?\s*([\d,]+\.\d{2})/i);
  data.total = extract(text, /\bTOTAL:?\s+\$?\s*([\d,]+\.\d{2})/i);
  data.netoAPagar = extract(text, /(?:Neto a\s+)?Pagar:?\s+\$?\s*([\d,]+\.\d{2})/i);

  // --- DESCRIPTIVE & LINE ITEMS (more complex) ---
  const descMatch = text.match(/Descripción de Bien y Servicio\s*([\s\S]*?)(?=Pedido Sap|TOTAL|Neto a pagar|$)/i);
  if (descMatch) {
    data.descripcionBienServicio = descMatch[1]
        .replace(/Aceptación del Bien o Servicio/gi, '') // Remove unwanted phrase
        .replace(/^:\s*/, '')                           // Remove leading colon and any space after it
        .replace(/\s+/g, ' ')                           // Collapse multiple whitespace into one
        .trim();                                        // Trim final whitespace from ends
  }

  // Find Pedido Sap ID first, then find the amount on the same line.
  data.pedidoSap = extract(text, /Pedido Sap\s+([\d]+)/i);
  if (data.pedidoSap) {
    const lineRegex = new RegExp(`Pedido Sap\\s+${data.pedidoSap}[^\\r\\n]*?(\\d{1,3}(?:,\\d{3})*\\.\\d{2})`, 'i');
    data.importePedidoSap = extract(text, lineRegex);
  }
  
  // Same logic for Recepción del bien.
  data.recepcionBien = extract(text, /Recepción del bien \(s\)\s+([\d]+)/i);
  if (data.recepcionBien) {
    const lineRegex = new RegExp(`Recepción del bien \\(s\\)\\s+${data.recepcionBien}[^\\r\\n]*?(\\d{1,3}(?:,\\d{3})*\\.\\d{2})`, 'i');
    data.importeRecepcionBien = extract(text, lineRegex);
  }
  
  // --- DISCOUNT SECTION (optional) ---
  const descuentoSectionMatch = text.match(/DESCUENTO S\/COMPRAS \(NC\)([\s\S]*?)(?=Neto a pagar|TOTAL|$)/i);
  if (descuentoSectionMatch) {
      const descuentoText = descuentoSectionMatch[1];
      const descuentoData: DescuentoData = {
          cantidad: extract(descuentoText, /Cantidad\s+\$?\s*(-?[\d,]+\.\d{2})/i),
          iva: extract(descuentoText, /IVA\s+\$?\s*(-?[\d,]+\.\d{2})/i),
          total: extract(descuentoText, /Total\s+\$?\s*(-?[\d,]+\.\d{2})/i),
      };
      // Only add the discount object if we found any actual data for it.
      if (Object.values(descuentoData).some(value => value)) {
          data.descuento = descuentoData;
      }
  }

  return data;
};