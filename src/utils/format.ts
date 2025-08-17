export function currency(value: number, locale: string = 'pt-BR', currency: string = 'BRL') {
  return value.toLocaleString(locale, { style: 'currency', currency });
}

export function percent(value: number, sign: boolean = true, digits: number = 2) {
  const pct = (value * 100).toFixed(digits) + '%';
  if (!sign) return pct;
  if (value > 0) return '+' + pct;
  return pct;
}
