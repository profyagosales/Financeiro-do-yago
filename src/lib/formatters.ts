export function formatCurrency(value: number, currency = "BRL", locale = "pt-BR") {
  return new Intl.NumberFormat(locale, { style: "currency", currency }).format(value);
}
