/**
 * Formata um valor numérico como moeda brasileira (BRL).
 * Centralizado aqui para evitar múltiplas cópias do Intl.NumberFormat pelo app.
 */
export const formatBRL = (value: number): string =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
