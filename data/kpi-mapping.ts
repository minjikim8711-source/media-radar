export interface KPI {
  id: string;
  label: string;
  description: string;
  categories: string[];   // matches "category" values in media-opportunities.json
  accentClass: string;    // Tailwind color token for borders/text/bg
  channelCount: number;
}

export const kpis: KPI[] = [
  {
    id: 'infrastructure',
    label: 'Urban Infrastructure',
    description: 'Station naming rights, EV charging screens, public kiosks, and smart city sponsorships.',
    categories: ['Transit Branding', 'EV Infrastructure', 'Public Infrastructure'],
    accentClass: 'violet',
    channelCount: 8,
  },
  {
    id: 'cinema',
    label: 'Cinema & Leisure',
    description: 'Cinema etiquette slots, screen golf lounges, laundromats, and premium leisure environments.',
    categories: ['Cinema', 'Emerging'],
    accentClass: 'blue',
    channelCount: 5,
  },
  {
    id: 'community',
    label: 'Campus & Community',
    description: 'University campuses, apartment community platforms, and coworking spaces.',
    categories: ['Campus', 'Apartment Community', 'Coworking'],
    accentClass: 'emerald',
    channelCount: 8,
  },
  {
    id: 'health',
    label: 'Health & Wellness',
    description: 'Hospital waiting rooms, maternity clinics, and pharmacy counter touchpoints.',
    categories: ['Healthcare'],
    accentClass: 'pink',
    channelCount: 3,
  },
  {
    id: 'partnership',
    label: 'Fintech & Retail',
    description: 'Embedded fintech integrations (Toss, Kakao Pay) and retail co-marketing programs.',
    categories: ['Fintech Partnership', 'Retail Partnership', 'Audio'],
    accentClass: 'amber',
    channelCount: 8,
  },
  {
    id: 'airport',
    label: 'Airport & Travel',
    description: 'Gate lounges, baggage claim, immigration corridors, and airport smart lockers.',
    categories: ['Airport'],
    accentClass: 'orange',
    channelCount: 4,
  },
];

/** Returns all category strings covered by the given KPI ids. */
export function resolveCategories(kpiIds: string[]): string[] {
  const selected = kpis.filter(k => kpiIds.includes(k.id));
  return [...new Set(selected.flatMap(k => k.categories))];
}

/** Returns the KPI objects for the given ids, preserving order. */
export function resolveKpis(kpiIds: string[]): KPI[] {
  return kpis.filter(k => kpiIds.includes(k.id));
}
