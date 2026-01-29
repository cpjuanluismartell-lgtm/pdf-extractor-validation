import type { ExtractedData, DescuentoData } from './types';

export const dataLabels: Record<keyof Omit<ExtractedData, 'descuento'>, string> = {
    numeroAcreedorSAP: "Número de Acreedor SAP:",
    noCopade: "No. COPADE:",
    noContrato: "No. Contrato:",
    importe: "Importe:",
    iva: "IVA:",
    total: "TOTAL:",
    noEstRem: "No. Est / Rem:",
    descripcionBienServicio: "Descripción de Bien y Servicio:",
    pedidoSap: "Pedido Sap:",
    importePedidoSap: "Importe Pedido Sap:",
    recepcionBien: "Recepción del bien (s):",
    importeRecepcionBien: "Importe Recepción bien:",
    fechaCont: "Fecha cont.:",
    netoAPagar: "Neto a pagar:"
};

export const descuentoLabels: Record<keyof DescuentoData, string> = {
    cantidad: "Cantidad:",
    iva: "IVA:",
    total: "Total:"
};

export const orderedKeys: (keyof Omit<ExtractedData, 'descuento'>)[] = [
    'numeroAcreedorSAP',
    'noCopade',
    'noContrato',
    'importe',
    'iva',
    'total',
    'noEstRem',
    'descripcionBienServicio',
    'pedidoSap',
    'recepcionBien',
    'importePedidoSap',
    'importeRecepcionBien',
    'fechaCont',
    'netoAPagar',
];

export const orderedDescuentoKeys: (keyof DescuentoData)[] = [
    'cantidad',
    'iva',
    'total'
];