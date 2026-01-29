export interface DescuentoData {
  cantidad?: string;
  iva?: string;
  total?: string;
}

export interface ExtractedData {
  numeroAcreedorSAP?: string;
  noCopade?: string;
  noContrato?: string;
  importe?: string;
  iva?: string;
  total?: string;
  noEstRem?: string;
  descripcionBienServicio?: string;
  pedidoSap?: string;
  importePedidoSap?: string;
  recepcionBien?: string;
  importeRecepcionBien?: string;
  fechaCont?: string;
  descuento?: DescuentoData;
  netoAPagar?: string;
}