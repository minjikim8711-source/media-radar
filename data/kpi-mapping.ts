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
    label: '도시 인프라 매체',
    description: '역명 병기권, EV 충전 스크린, 공공 키오스크, 스마트시티 협찬 등 도시 인프라 기반 매체입니다.',
    categories: ['Transit Branding', 'EV Infrastructure', 'Public Infrastructure'],
    accentClass: 'violet',
    channelCount: 8,
  },
  {
    id: 'cinema',
    label: '시네마 & 여가',
    description: '시네마 에티켓 광고, 스크린골프 브랜딩, 코인 세탁소, 프리미엄 여가 공간 등입니다.',
    categories: ['Cinema', 'Emerging'],
    accentClass: 'blue',
    channelCount: 5,
  },
  {
    id: 'community',
    label: '캠퍼스 & 커뮤니티',
    description: '대학 캠퍼스, 아파트 커뮤니티 플랫폼, 코워킹 스페이스 기반 매체입니다.',
    categories: ['Campus', 'Apartment Community', 'Coworking'],
    accentClass: 'emerald',
    channelCount: 8,
  },
  {
    id: 'health',
    label: '헬스 & 웰니스',
    description: '병원 외래 대기실, 산부인과·소아과 대기실, 약국 카운터 등 의료 접점 매체입니다.',
    categories: ['Healthcare'],
    accentClass: 'pink',
    channelCount: 3,
  },
  {
    id: 'partnership',
    label: '핀테크 & 리테일',
    description: 'Toss, Kakao Pay 등 핀테크 제휴 및 리테일 공동 마케팅 프로그램입니다.',
    categories: ['Fintech Partnership', 'Retail Partnership', 'Audio'],
    accentClass: 'amber',
    channelCount: 8,
  },
  {
    id: 'airport',
    label: '공항 & 여행',
    description: '탑승 게이트, 수하물 수취대, 입국 심사 구역, 공항 스마트 보관함 등 여행자 접점 매체입니다.',
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
