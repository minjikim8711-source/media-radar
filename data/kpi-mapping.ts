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
    id: 'cinema',
    label: 'Cinema Ads',
    description: 'Pre-show placements at CGV and Lotte Cinema for captive, distraction-free audiences.',
    categories: ['Cinema'],
    accentClass: 'blue',
    channelCount: 1,
  },
  {
    id: 'transit',
    label: 'Transit Ads',
    description: 'Subway screen doors, buses, station naming rights, taxis, airports, and rail.',
    categories: ['Transit', 'Transit Branding'],
    accentClass: 'violet',
    channelCount: 6,
  },
  {
    id: 'experiential',
    label: 'Experiential',
    description: 'Pop-up stores and offline brand activation events driving UGC and direct engagement.',
    categories: ['Experiential'],
    accentClass: 'pink',
    channelCount: 1,
  },
  {
    id: 'retail',
    label: 'Retail & Financial',
    description: 'ATM screens, convenience store receipt touchpoints, and bank branch environments.',
    categories: ['Retail', 'Financial Touchpoint'],
    accentClass: 'emerald',
    channelCount: 2,
  },
  {
    id: 'ooh',
    label: 'OOH / Billboard',
    description: 'Digital billboards, elevator lobbies, and university campus placements.',
    categories: ['OOH', 'Digital OOH'],
    accentClass: 'amber',
    channelCount: 3,
  },
  {
    id: 'sponsorship',
    label: 'Sponsorship',
    description: 'Sports stadium naming rights, kit sponsorship, and event partnerships.',
    categories: ['Sponsorship'],
    accentClass: 'orange',
    channelCount: 1,
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
