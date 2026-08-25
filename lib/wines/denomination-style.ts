export const denominationCountryStyles: Record<string, { accent: string; soft: string; label: string }> = {
  Espana: { accent: '#fb7185', soft: 'rgba(251,113,133,.12)', label: 'España' },
  Italia: { accent: '#6ee7b7', soft: 'rgba(110,231,183,.12)', label: 'Italia' },
  Francia: { accent: '#a78bfa', soft: 'rgba(167,139,250,.12)', label: 'Francia' },
};

export function normalizeAtlasText(value?: string) {
  return (value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

export function denominationStyle(country?: string) {
  const key = Object.keys(denominationCountryStyles).find((item) => normalizeAtlasText(item) === normalizeAtlasText(country));
  return key ? denominationCountryStyles[key] : { accent: '#f4f4f5', soft: 'rgba(244,244,245,.1)', label: country || 'Europa' };
}

export function denominationMatches(value: string | undefined, target: string | undefined) {
  if (!value || !target) return false;
  const current = normalizeAtlasText(value).replace(/^(do|doca|docg|aoc|aop|dop)\s+/, '').replace(/\s+(do|doca|docg|aoc|aop|dop)$/, '');
  const expected = normalizeAtlasText(target).replace(/^(do|doca|docg|aoc|aop|dop)\s+/, '').replace(/\s+(do|doca|docg|aoc|aop|dop)$/, '');
  return current === expected || current.includes(expected) || expected.includes(current);
}
