#!/usr/bin/env node
'use strict';

const fs   = require('fs');
const path = require('path');

const WEIGHTS = { kpiFit: 0.30, novelty: 0.20, reach: 0.30, feasibility: 0.20 };

function computeScore({ kpiFit, novelty, reach, feasibility }) {
  const raw = kpiFit * WEIGHTS.kpiFit + novelty * WEIGHTS.novelty
            + reach  * WEIGHTS.reach  + feasibility * WEIGHTS.feasibility;
  return Math.round(raw * 10) / 10;
}

function jitter(base) {
  const val = base + (Math.random() * 0.8 - 0.4);
  return Math.round(Math.min(10, Math.max(1, val)) * 10) / 10;
}

// ── Weekly themes ─────────────────────────────────────────────────────────────
const WEEKLY_THEMES = [
  {
    theme: '비활용 접점 발굴',
    commentary: "이번 주는 국내 은행 브랜드가 아직 진입하지 않은 '제로 경쟁' 포맷을 중심으로 선정했습니다. 선점 이점이 핵심 선정 기준입니다.",
    preferHigh: ['novelty'],
  },
  {
    theme: '프리미엄 체류형 매체 집중',
    commentary: "15분 이상 체류하는 포획형 오디언스를 가진 채널 — 병원 대기실, 공항 라운지, 영화관 — 을 중심으로 브랜드 스토리텔링 공간이 충분한 매체를 선정했습니다.",
    preferHigh: ['kpiFit', 'reach'],
  },
  {
    theme: '파트너십 우선 전략',
    commentary: "이번 주는 광고 집행보다 파트너십 임베딩에 집중합니다. 핀테크 앱과 리테일 접점에 브랜드를 자연스럽게 녹여내는 방식입니다.",
    preferHigh: ['kpiFit', 'novelty'],
  },
  {
    theme: '커뮤니티 금융 이니셔티브',
    commentary: "아파트 플랫폼, 캠퍼스 네트워크, 코워킹 스페이스 등 신뢰 기반의 지역 커뮤니티 맥락에 집중했습니다. 금융 메시지 전환율이 평균 이상인 환경입니다.",
    preferHigh: ['novelty', 'reach'],
  },
  {
    theme: '인프라 접점 전략',
    commentary: "EV 충전소, 역명 병기권, 스마트시티 키오스크 등 공공 인프라 접점은 일상적 유틸리티 순간을 경쟁 노이즈가 낮은 지속적 브랜드 인상으로 전환합니다.",
    preferHigh: ['feasibility', 'novelty'],
  },
  {
    theme: '생애주기 접점 공략',
    commentary: "산부인과, MBA 프로그램, 첫 EV 구매자 등 핵심 금융 생애주기 전환점과 정렬된 채널을 선정했습니다. 장기 LTV 관점에서 고객 획득 가치가 가장 높은 구간입니다.",
    preferHigh: ['kpiFit'],
  },
];

// ── Opportunity pool ──────────────────────────────────────────────────────────
// Excluded by design: Naver Ads, Kakao Ads, Google/Facebook, broadcast TV,
// subway screen door ads, bus wraps, generic digital display.
// New fields: whyNew, marketAdoption, exampleBrands[], expectedImpact

const POOL = [

  // ── Transit Branding ──────────────────────────────────────────────────────
  {
    name: 'Subway Station Naming Rights',
    category: 'Transit Branding',
    description: "Co-naming rights for a Seoul Metro station — the bank's brand appended to every station sign, PA announcement, Kakao Map pin, and Naver Map label.",
    why: 'Station names are broadcast 40–60 times per hour and embedded in every navigation app in Korea. Unlike a billboard, the brand literally becomes part of the city\'s address system.',
    details: "Seoul Metro's co-naming program has available inventory on 20+ stations. Contracts run 1–3 years. Proximity to a flagship branch or HQ creates a permanent geographic anchor. The format is underused by digital-first banks who overlook offline naming equity.",
    risks: ['Premium station inventory (Gangnam, Sinchon, Yeouido) sells out quickly at renewal', 'Negative local incidents in the catchment area create unwanted brand association', 'Requires multi-year budget commitment with limited mid-contract flexibility'],
    exampleUsage: "Secure 'Seolleung · K Bank Station' on Line 2 for 2 years — anchoring wealth management awareness in Gangnam's highest-income office corridor.",
    trend: 'Rising',
    competition: 'Low',
    whyNew: 'Digital-first banks have not used station co-naming despite its 24/7 presence across maps and PA — it remains dominated by a few legacy retail and telecom brands.',
    marketAdoption: 'Emerging',
    exampleBrands: ['Shinhan Card (Suseo)', 'NH Nonghyup (Yangjae)'],
    expectedImpact: 'Long-term top-of-mind anchoring; geographic brand ownership near high-income corridors with no creative decay.',
    base: { kpiFit: 9, novelty: 8, reach: 8, feasibility: 7 },
  },
  {
    name: 'T-money Reload Machine Screens',
    category: 'Transit Branding',
    description: 'Idle-screen ad inventory on T-money top-up kiosks at subway stations, convenience stores, and transit hubs — a touchpoint no financial brand currently occupies.',
    why: 'Users at a T-money machine are in a literal payment context and stationary for 20–40 seconds. The financial mindset and captive moment are ideal for a banking message.',
    details: 'Korea has 15,000+ T-money reload machines. The idle screen between transactions is currently unfilled or filled with generic Seoul Metro imagery. Ad inventory can be secured through Seoul Metro\'s digital signage arm. QR codes support instant app deep-links.',
    risks: ['T-money physical card usage is declining as NFC phone tap grows', 'Screen quality on older kiosks is inconsistent', 'Inventory management is fragmented across multiple operators'],
    exampleUsage: 'A brand awareness creative on T-money kiosks along Line 2 and Line 9 promoting a transit-linked cashback debit card — QR opening the card application directly.',
    trend: 'Stable',
    competition: 'Low',
    whyNew: 'No financial brand has claimed this idle-screen inventory. It sits in a financial transaction context with zero creative competition.',
    marketAdoption: 'Early Adopter',
    exampleBrands: [],
    expectedImpact: 'High-relevance frequency impressions in a payment-primed mindset at near-zero competitive noise.',
    base: { kpiFit: 7, novelty: 9, reach: 7, feasibility: 8 },
  },

  // ── EV Infrastructure ─────────────────────────────────────────────────────
  {
    name: 'EV Charging Station Display Ads',
    category: 'EV Infrastructure',
    description: 'Digital screens on public EV chargers at apartment complexes, malls, and highway rest stops — reaching drivers during mandatory 15–45 minute charging dwell time.',
    why: 'EV owners skew 35–55, higher income, and early-adopter oriented — a prime profile for investment, premium credit, and auto-loan refinancing products. Dwell time is exceptionally long.',
    details: 'Korea installed 270,000+ public EV chargers as of 2025 with rapid annual growth. ChargeEV, SK Plug, and Hyundai Electrix networks are beginning to monetize screens. The advertising ecosystem is nascent — CPMs are low and category exclusivity is available.',
    risks: ['Charger screen rollout varies by operator — national coverage still patchy', 'Outdoor display quality degrades in extreme heat or cold', 'Audience measurement for EV charger ads is immature'],
    exampleUsage: 'A 3-month campaign on ChargeEV screens at major apartment complexes in Pangyo and Bundang — promoting an EV loan refinancing offer during the charging session with a QR for instant rate comparison.',
    trend: 'Rising',
    competition: 'Low',
    whyNew: 'EV charger advertising is at pre-monetization stage in Korea. Financial brands have not entered this space — it is open for a first-mover claim.',
    marketAdoption: 'Early Adopter',
    exampleBrands: ['Hyundai Card (pilot, proprietary Hyundai chargers only)'],
    expectedImpact: 'First-mover brand association with sustainable mobility; high dwell-time impression quality in premium residential and retail locations.',
    base: { kpiFit: 8, novelty: 9, reach: 7, feasibility: 7 },
  },
  {
    name: 'EV Dealer Finance Integration',
    category: 'EV Infrastructure',
    description: "Bank-branded loan calculator embedded in Hyundai/Kia EV showroom touchscreens at the point of vehicle selection — not an ad, a native financing tool.",
    why: "Auto purchase is a guaranteed financial product trigger. Positioning the bank's financing inside the dealer UX before the customer considers alternatives converts far above any external ad.",
    details: "Hyundai's 400+ dealerships and Kia's 320+ locations see 3M+ vehicle comparison interactions annually. Integrated finance tools in the dealer digital ecosystem convert at 5–15× the rate of external display advertising.",
    risks: ['Dealership system integration requires IT partnership and lengthy contract negotiation', 'Exclusivity is hard to secure against established auto finance partners', 'Revenue share model with dealerships adds cost complexity'],
    exampleUsage: "A branded 'K Bank Auto Finance' module embedded in Hyundai's digital showroom tablets — showing live loan rates, monthly payment calculator, and one-tap pre-approval for EV buyers.",
    trend: 'Rising',
    competition: 'Medium',
    whyNew: 'Most banks advertise auto loans externally. Embedding the product inside the dealer purchase UX as a native tool — not an ad — is rarely done and converts dramatically better.',
    marketAdoption: 'Emerging',
    exampleBrands: ['Hyundai Capital (proprietary only)', 'KB Auto Finance (limited integration)'],
    expectedImpact: 'Direct product conversion at a high-intent purchase moment; brand association with premium EV ownership.',
    base: { kpiFit: 9, novelty: 7, reach: 7, feasibility: 6 },
  },

  // ── Apartment Community ───────────────────────────────────────────────────
  {
    name: '아파트아이 / 아파트365 In-app Ads',
    category: 'Apartment Community',
    description: "In-app banner and push notification placements within Korea's leading apartment management apps — used daily by residents for maintenance requests, community notices, and bill payments.",
    why: 'Apartment management apps are opened daily by household financial decision-makers in a domestic/financial context. No financial brand has saturated this ecosystem.',
    details: '아파트아이 has 3M+ registered households; combined with 아파트365 and similar apps the ecosystem reaches 8M+ households. Users interact with bill amounts and community fund notices — natural adjacency for savings and mortgage products.',
    risks: ['Ad inventory is fragmented across multiple operators — requires separate deals', 'Resident communities are sensitive to commercial intrusion in community platforms', 'Targeting precision is household-level, not individual-level'],
    exampleUsage: "A push notification to residents when monthly maintenance fees are due — 'Did you know you can earn 4.2% APY on your maintenance reserves? Open a K Bank savings account in 2 minutes.'",
    trend: 'Rising',
    competition: 'Low',
    whyNew: 'No major bank brand has entered apartment community platforms despite their daily engagement with household finances.',
    marketAdoption: 'Early Adopter',
    exampleBrands: [],
    expectedImpact: 'Contextually relevant household financial messaging in a daily-use, low-competition platform with strong community trust.',
    base: { kpiFit: 8, novelty: 9, reach: 8, feasibility: 7 },
  },
  {
    name: 'Apartment Complex Lobby Digital Board',
    category: 'Apartment Community',
    description: 'Branded financial content on digital notice boards in apartment complex lobbies — the last touchpoint before residents leave home and the first they see returning.',
    why: 'High daily frequency, neighbourhood trust context, and zero competitive clutter. Residents associate the lobby board with community authority.',
    details: 'Korea has 12,000+ apartment complexes with digital lobby boards reaching 15M+ households. Partnership agreements typically involve community fund contributions in exchange for branding space.',
    risks: ['Each complex requires individual negotiation — no national network exists', 'Resident association approval can be slow or denied', 'Creative must comply with apartment community content guidelines'],
    exampleUsage: "A 'Financial Tip of the Month' branded slot on lobby screens in 500 premium apartment complexes in Gangnam, Mapo, and Bundang — rotating monthly savings tips with a QR to a product offer.",
    trend: 'Stable',
    competition: 'Low',
    whyNew: 'Financial brands have not systematically partnered with apartment resident associations to secure lobby screen inventory — a genuine blind spot.',
    marketAdoption: 'Early Adopter',
    exampleBrands: ['Samsung Life (individual complex deals)', 'NH Life Insurance (community boards)'],
    expectedImpact: 'Trusted, neighbourhood-level brand presence with repeat daily exposure to household decision-makers.',
    base: { kpiFit: 7, novelty: 8, reach: 7, feasibility: 7 },
  },
  {
    name: 'Apartment Monthly Maintenance Notice Insert',
    category: 'Apartment Community',
    description: "Co-inserted flyer with the monthly apartment maintenance fee notice (관리비 고지서) delivered to every household — handled physically by the financial decision-maker.",
    why: 'The maintenance fee notice is physically handled by every apartment household in a financial document context. An attached insert goes to the right person at the exact right moment.',
    details: '아파트 management notices reach 8M+ households monthly. Paper inserts enjoy near-100% physical handling rates. QR codes, coupons, and personalised offers can be segmented by building tier.',
    risks: ['Physical print limits creative richness', 'Opt-out is increasing as complexes switch to digital-only notices', 'Quality of insert distribution varies by management company'],
    exampleUsage: "A quarterly insert in maintenance notices for ₩500M+ tier complexes — promoting a mortgage refinancing consultation with a QR scheduling link and a ₩50,000 gift card for booked appointments.",
    trend: 'Stable',
    competition: 'Low',
    whyNew: 'Banks use mass DM but rarely co-insert with apartment maintenance notices — the financial context and physical delivery create far higher relevance than generic mail.',
    marketAdoption: 'Emerging',
    exampleBrands: ['KB Kookmin Bank (limited pilots)', 'Samsung Fire & Marine Insurance'],
    expectedImpact: 'Household-level financial messaging in a document already associated with money — uniquely high contextual relevance.',
    base: { kpiFit: 8, novelty: 7, reach: 7, feasibility: 8 },
  },

  // ── Coworking ─────────────────────────────────────────────────────────────
  {
    name: 'Coworking Space Wi-Fi & Lounge Branding',
    category: 'Coworking',
    description: "Branded Wi-Fi login pages, lounge screen placements, and meeting room naming rights at FastFive, Maru180, and WeWork Korea — reaching freelancers and startup founders daily.",
    why: 'Freelancers, startup founders, and solo workers are chronically underserved by traditional banking products yet have complex financial needs. Coworking spaces are where they spend 40+ hours per week.',
    details: "FastFive has 50+ locations in Seoul; the broader ecosystem reaches 300+ locations. Wi-Fi sponsorship provides a branded splash page seen at every login — 3–5 times per day per user. Lounge screens supplement with brand creative.",
    risks: ['Space-by-space negotiation required — no national network sales team', 'Wi-Fi branding must be tasteful — users will switch SSIDs if experience feels too commercial', 'Demographic range is wide — creative must work for very different freelancer profiles'],
    exampleUsage: "Sponsor FastFive Wi-Fi across all Seoul locations with a branded splash page offering a 'Freelancer Banking Bundle' — business account, tax savings calculator, and invoicing tool — trackable via UTM to individual location.",
    trend: 'Rising',
    competition: 'Low',
    whyNew: "Banks have offered freelancer accounts but haven't embedded brand presence inside the coworking environments where the target audience actually spends their day.",
    marketAdoption: 'Early Adopter',
    exampleBrands: ['Toss (FastFive event sponsor)', 'Shinhan Bank (Wi-Fi pilot)'],
    expectedImpact: 'Daily brand exposure to a high-LTV freelancer demographic in a financially relevant context.',
    base: { kpiFit: 8, novelty: 8, reach: 6, feasibility: 7 },
  },
  {
    name: 'Freelancer Financial Literacy Workshop',
    category: 'Coworking',
    description: "Branded free monthly workshops — 'Tax Filing for Freelancers', '3.3% Withholding Explained', 'First Business Account Setup' — hosted at coworking spaces.",
    why: 'Freelancers are deeply confused by Korean tax and business banking rules. A bank that provides genuine help before asking for a product sale earns trust that outlasts any ad.',
    details: 'FastFive and Maru180 already host member events. A monthly branded finance workshop positions the bank as a trusted advisor. Workshop attendees convert to product holders at 15–25% within 90 days. Workshop content can be repurposed as YouTube or blog SEO.',
    risks: ['Workshop quality depends entirely on speaker expertise — poor execution harms brand credibility', 'No immediate revenue — conversion cycle is 60–120 days', 'Requires ongoing staff resourcing for monthly cadence'],
    exampleUsage: "A monthly 'K Bank Freelancer Finance Hour' at 5 FastFive locations — covering withholding tax, VAT basics, and retirement savings for independents — with a post-workshop consultation offer and 3-month fee waiver on business accounts.",
    trend: 'Rising',
    competition: 'Low',
    whyNew: 'No bank currently runs a sustained coworking-based financial education program in Korea. Toss has community events but not structured finance workshops at this scale.',
    marketAdoption: 'Early Adopter',
    exampleBrands: ['Toss (community meetups, not financial education)'],
    expectedImpact: 'High-trust brand positioning as the freelancer financial partner; above-average product conversion within 90 days of attendance.',
    base: { kpiFit: 9, novelty: 8, reach: 6, feasibility: 7 },
  },

  // ── Campus ────────────────────────────────────────────────────────────────
  {
    name: 'University Dormitory Lobby Screens',
    category: 'Campus',
    description: 'Digital display ads on screens in dormitory lobbies and study room panels at SKY, KAIST, Sogang, and POSTECH — seen multiple times daily by resident students.',
    why: 'Dormitory residents see the lobby screen every morning and night. It is the only OOH format with this level of daily repetition for on-campus students — and it is nearly unoccupied by financial brands.',
    details: "Korea's top 10 research universities house 80,000+ dormitory residents. Screens typically run university announcements. A paid partnership with the university IT or student affairs office unlocks a consistent ad slot in this captive environment.",
    risks: ['University approval process is slow and may require student government endorsement', 'Under-21 audience restrictions apply under FSC guidelines', 'Screen quality and uptime varies between dormitory buildings'],
    exampleUsage: "A semester-long campaign on KAIST and Yonsei dormitory lobby screens — 'Open your first account before graduation' with a student-exclusive 6% savings rate and instant app signup, shown during morning rush (7–9am).",
    trend: 'Rising',
    competition: 'Low',
    whyNew: 'Campus media for banks has focused on bulletin boards and club sponsorships. Dormitory digital screens — which have daily multiple-touch frequency — have not been systematically used.',
    marketAdoption: 'Early Adopter',
    exampleBrands: [],
    expectedImpact: 'High-frequency brand exposure to future high-earners at the earliest possible financial life stage; low CPM with strong long-term LTV.',
    base: { kpiFit: 7, novelty: 9, reach: 7, feasibility: 7 },
  },
  {
    name: 'University Cafeteria Tray Liner Ads',
    category: 'Campus',
    description: 'Printed tray liners on serving trays at university cafeterias — 100% viewable during the entire 15–20 minute meal period with no way to skip.',
    why: 'The cafeteria tray sits directly in the student\'s field of view for the full meal. Unlike any digital format, the student cannot scroll past it, close it, or skip it.',
    details: "Korea's top 30 universities serve 200,000+ cafeteria meals daily. Tray liner production costs are extremely low (₩10–30 per liner). The format supports QR codes. Students eating together create organic conversation around the brand message.",
    risks: ['Print format only — no motion, interaction, or A/B testing', 'Liners require printing cycle management — 2–3 week lead time per creative rotation', 'Association with cafeteria food may not align with premium product positioning'],
    exampleUsage: "'Your first salary deserves a real savings plan. Open in 2 min.' — a spring semester tray liner at 15 universities with a QR to a student savings calculator, rotating quarterly.",
    trend: 'Stable',
    competition: 'Low',
    whyNew: 'Tray liner advertising is common in the US but virtually unused by financial brands in Korea — guaranteed passive attention at minimal cost.',
    marketAdoption: 'Emerging',
    exampleBrands: ['Various insurance brands (one-off executions)'],
    expectedImpact: 'Guaranteed passive attention during a daily ritual; strong recall due to visual field dominance of the format.',
    base: { kpiFit: 6, novelty: 8, reach: 7, feasibility: 9 },
  },
  {
    name: 'Graduate School MBA Partnership',
    category: 'Campus',
    description: "Branded sponsorship of case competitions, investment clubs, and career fairs at KAIST MBA, Yonsei Business School, and Sungkyunkwan GSB.",
    why: 'MBA students are 28–38 year-olds with household incomes already above average, accelerating fast, and about to become the highest-LTV financial product buyers in Korea.',
    details: "Korea's top business schools graduate 5,000+ MBA students annually. Case competition sponsorship (₩3–8M per event) delivers a logo on every submission, a branded judge seat, and networking access to top students.",
    risks: ['One-off event sponsorships have low brand recall without year-round touchpoints', 'Competitor banks have established MBA relationships and may be preferred employer-of-choice brands', 'Return is long-term — conversion to product holder is 2–5 years post-graduation'],
    exampleUsage: "Title sponsor of KAIST MBA's annual Finance Case Championship — branded award, ₩5M prize fund, and a 'K Bank Future Leaders' networking dinner for finalists, with a private banking consultation offer for graduating cohort.",
    trend: 'Stable',
    competition: 'Medium',
    whyNew: 'Digital-first banks have not systematically engaged the MBA ecosystem despite it being the clearest feeder for private banking, investment, and SME clients.',
    marketAdoption: 'Emerging',
    exampleBrands: ['KB Kookmin Bank (SKK GSB sponsor)', 'Hana Bank (Yonsei career fair)'],
    expectedImpact: 'Long-term pipeline of high-LTV private banking clients; brand positioning as the innovation-forward bank of choice for future finance leaders.',
    base: { kpiFit: 9, novelty: 6, reach: 6, feasibility: 8 },
  },

  // ── Healthcare ────────────────────────────────────────────────────────────
  {
    name: 'Hospital OPD Waiting Room Screens',
    category: 'Healthcare',
    description: 'Digital display ads on screens in outpatient department waiting areas at major general hospitals — Samsung Medical Center, Asan, Severance, SNUH.',
    why: 'Hospital waiting rooms generate 20–90 minutes of captive dwell time where patients naturally contemplate health costs, insurance adequacy, and financial planning. No financial brand currently appears here.',
    details: "Korea's top 20 general hospitals receive 150,000+ outpatient visits daily. Waiting room screens run health education content with ad slots available through hospital media arms. Premium hospital audiences are above-average income and health-conscious.",
    risks: ['Hospital partnership approval requires Board and ethics committee review — 3–6 month process', 'Advertising restrictions in medical settings vary by hospital policy', 'Message tone must be carefully calibrated — financial anxiety in a health context can backfire'],
    exampleUsage: "A branded 'Financial Health Check' campaign on screens at Samsung Medical Center and Asan — a 30-second spot on emergency fund adequacy, ending with a QR for a savings health assessment tool in the K Bank app.",
    trend: 'Stable',
    competition: 'Low',
    whyNew: 'Hospital waiting room media is used by pharmaceutical and insurance brands but has not been entered by retail banks in Korea — a genuine category white space.',
    marketAdoption: 'Early Adopter',
    exampleBrands: ['Samsung Life Insurance (pilot, Samsung Medical Center)', 'Kyobo Life (health content sponsorship)'],
    expectedImpact: 'Brand association with financial wellbeing in a contemplative mindset; high-quality impression with an above-average-income audience.',
    base: { kpiFit: 8, novelty: 9, reach: 7, feasibility: 6 },
  },
  {
    name: 'Maternity & Pediatric Clinic Waiting Rooms',
    category: 'Healthcare',
    description: "Branded content and product information on screens and brochure stands in OB/GYN and pediatric clinic waiting areas — targeting new and expectant parents at a pivotal financial life stage.",
    why: 'The arrival of a child is the single strongest trigger for savings accounts, education funds, life insurance, and mortgage planning. A bank present at this exact moment earns relationships that last decades.',
    details: "Korea has 1,500+ OB/GYN clinics and 2,000+ pediatric clinics. New parents are 28–40, actively reassessing their financial situation, and open to guidance. Printed brochure stands, digital screens, and Wi-Fi sponsorship are viable access points.",
    risks: ['Sensitive environment — messaging must be warm, not salesy', 'Clinic-by-clinic negotiation required — no network exists yet', 'Privacy considerations for in-clinic data collection'],
    exampleUsage: "A 'Welcome to Parenthood' financial starter kit in 300 OB/GYN clinic waiting rooms — a branded brochure with a QR to a 'New Parent Financial Plan' tool and a ₩10,000 baby fund contribution for new accounts.",
    trend: 'Rising',
    competition: 'Low',
    whyNew: 'Insurance companies advertise here but retail banks have not systematically entered maternity/pediatric clinic media — the life-stage alignment is perfect and the space is unclaimed.',
    marketAdoption: 'Early Adopter',
    exampleBrands: ['Kyobo Life (maternity insurance brochures)', 'Samsung Fire & Marine (pediatric clinic)'],
    expectedImpact: 'Life-stage acquisition with the highest long-term LTV profile; brand as the trusted financial partner from day one of parenthood.',
    base: { kpiFit: 9, novelty: 9, reach: 6, feasibility: 7 },
  },
  {
    name: 'Pharmacy Counter Display (약국 POP)',
    category: 'Healthcare',
    description: 'Counter-top display stands and A5 brochure holders at independent pharmacies in residential neighbourhoods — reaching patients in a prescription pickup context.',
    why: 'Pharmacy customers managing chronic conditions have ongoing financial implications (medication costs, insurance claims). The moment of prescription pickup is underused for financial product adjacency.',
    details: "Korea has 23,000+ pharmacies, the majority independent. Counter POP displays are inexpensive and require only pharmacy owner consent. A network of 5,000 pharmacies in target residential areas can be activated for ₩30–50M.",
    risks: ['No digital format — static print only', 'Distribution and replenishment across 5,000 locations requires a field force or agency', 'Conversion tracking is limited without QR code integration'],
    exampleUsage: "An A5 brochure holder at pharmacy counters in Mapo, Nowon, and Dobong-gu promoting a healthcare savings account — 'Earn interest while saving for medical costs' with a QR to the K Bank health savings product page.",
    trend: 'Stable',
    competition: 'Low',
    whyNew: "Banks have never systematically entered pharmacy retail media. Insurance companies hold some presence but retail banking is completely absent from this high-trust health touchpoint.",
    marketAdoption: 'Emerging',
    exampleBrands: ['Various life insurers (brochure stands)'],
    expectedImpact: 'Trusted health-adjacent brand presence; low cost, high distribution density in residential areas.',
    base: { kpiFit: 7, novelty: 8, reach: 7, feasibility: 8 },
  },

  // ── Airport ───────────────────────────────────────────────────────────────
  {
    name: 'Airport Gate Charging Station Sponsorship',
    category: 'Airport',
    description: "Sponsor USB and AC power outlets at Incheon and Gimpo departure gates — branded charging units with the bank's logo and QR codes during 30–90 min pre-boarding waits.",
    why: "Travelers actively seek charging stations and feel gratitude toward the provider. The bank becomes the literal enabler of the passenger's departure experience — an emotional brand link standard signage cannot create.",
    details: "Incheon Airport has 130+ gates. Charging station sponsorship is common globally (Delta Sky Club, Singapore Changi) but remains unclaimed at Korean airports. A 1-year sponsorship of all departure gate chargers costs an estimated ₩1–3억 — CPM far below any other airport format.",
    risks: ['Airport infrastructure contracts require lengthy AACI procurement approval', 'Competitor bank could claim the same format at Gimpo while you hold Incheon', 'Physical charging unit maintenance is an ongoing operational responsibility'],
    exampleUsage: "Sponsor all Incheon Terminal 2 gate charging stations — branded 'Power by K Bank' units with a QR offering ₩5,000 in overseas transaction fee waiver for travel card applications completed while charging.",
    trend: 'Rising',
    competition: 'Low',
    whyNew: "Charging station sponsorship at airports is common in US and Singapore but has not been executed at Korean airports by any financial brand.",
    marketAdoption: 'Early Adopter',
    exampleBrands: ['Delta SkyMiles (Atlanta Hartsfield)', 'Standard Chartered (Changi Airport)'],
    expectedImpact: "Premium brand association with international travel; high gratitude-driven memorability; natural trigger for travel card and overseas remittance product offer.",
    base: { kpiFit: 8, novelty: 9, reach: 7, feasibility: 7 },
  },
  {
    name: 'Airport Immigration Corridor Lightbox',
    category: 'Airport',
    description: "Static and digital lightbox placements along the 5–10 minute walking corridor between arrival gate and immigration — a captive, ad-free environment almost no brand occupies.",
    why: 'Arriving passengers walk 400–800m through the immigration corridor with nothing but walls and signage. The format is static, but it is the only channel in this undivided attention window.',
    details: "Incheon Airport Terminal 1 arrival corridor has 50+ available panel positions between gates and immigration hall. A branded lightbox campaign of 10–20 panels would dominate the visual field of 40M+ arriving passengers annually.",
    risks: ['Competition from duty-free and luxury brands for prime panel positions', 'Static format only — no digital or motion available in most corridor sections', 'Panel maintenance requires airport authority coordination'],
    exampleUsage: "A 10-panel lightbox campaign along Terminal 1's international arrivals corridor — a sequential brand story ending with a QR for an overseas investment product overview.",
    trend: 'Stable',
    competition: 'Low',
    whyNew: "Financial brands cluster in duty-free corridors and departure lounges. The arrivals corridor — where travelers are thinking about returning home — is systematically underused.",
    marketAdoption: 'Emerging',
    exampleBrands: ['Hana Bank (limited Incheon panel)', 'Citi Korea (arrivals hall lightbox)'],
    expectedImpact: "Dominant brand presence for returning Korean travelers; sequential storytelling across 5–10 minutes of walking time.",
    base: { kpiFit: 7, novelty: 8, reach: 7, feasibility: 7 },
  },
  {
    name: 'Airport Baggage Claim Carousel Wrap',
    category: 'Airport',
    description: 'Full vinyl wrap on the baggage carousel belt itself — passengers stare at the carousel for 10–25 minutes upon arrival with nothing competing for their attention.',
    why: "The baggage claim wait is one of the most consistently attention-available moments in travel. A brand visible during that wait achieves recall impossible in most OOH formats.",
    details: "Incheon has 24 baggage carousels across two terminals. Full wrap of one carousel for a year costs an estimated ₩50–100M. The audience is arriving international travelers watching an average of 18 minutes per flight.",
    risks: ['Vinyl quality on a moving belt requires premium materials — higher production cost', 'Not all carousel positions have equal visibility from the claim area', 'Wear from luggage requires quarterly creative refresh'],
    exampleUsage: "A full carousel wrap at Incheon Terminal 1 International Arrivals — branded pattern with 'Welcome home, your savings missed you' and a QR for a foreign currency conversion rate offer valid 48 hours post-arrival.",
    trend: 'Stable',
    competition: 'Low',
    whyNew: "Baggage carousel wraps exist globally but have never been executed by a Korean financial brand — the dwell time and audience quality are superior to any other airport format.",
    marketAdoption: 'Early Adopter',
    exampleBrands: ['Marriott Bonvoy (JFK)', 'American Express (London Heathrow)'],
    expectedImpact: 'Unmissable brand presence during a captive dwell period; strong recall driven by novelty and size of the format.',
    base: { kpiFit: 7, novelty: 9, reach: 7, feasibility: 7 },
  },
  {
    name: 'Airport Smart Locker Branding',
    category: 'Airport',
    description: 'Branded smart luggage storage lockers at Incheon and Gimpo — travelers interact with a branded touchscreen for 1–3 minutes during bag storage booking.',
    why: 'Smart locker users are travelers with time between flights — a high dwell group who are planning-minded and receptive to financial product messages in a controlled interaction.',
    details: 'Incheon Airport has expanded smart locker installations post-2022. Touchscreen interaction at booking provides a 60–120 second brand placement window with guaranteed attention. QR codes on the locker door sustain the touchpoint.',
    risks: ['Smart locker operator partnerships are limited — only 1–2 providers at Incheon currently', 'User interaction is transactional — messaging must be extremely concise', 'Revenue model and exclusivity terms with locker operators still evolving'],
    exampleUsage: "Brand the touchscreen confirmation screen with a 'Travel card offer: 0% overseas fee for 30 days' — claimable via QR during the locker booking interaction.",
    trend: 'Rising',
    competition: 'Low',
    whyNew: "Smart locker branding at airports is a 2023–2025 emerging global format. No Korean financial brand has entered this space at Incheon.",
    marketAdoption: 'Early Adopter',
    exampleBrands: ['Revolut (Amsterdam Schiphol)'],
    expectedImpact: 'Precise touchpoint with active traveler mindset; strong product relevance for travel financial products.',
    base: { kpiFit: 7, novelty: 9, reach: 6, feasibility: 7 },
  },

  // ── Fintech Partnership ───────────────────────────────────────────────────
  {
    name: 'Toss 비바리퍼블리카 Co-brand Integration',
    category: 'Fintech Partnership',
    description: "The bank's product embedded as a native partner offer inside Toss's money management flows — savings goals, spending summaries, or credit score tools.",
    why: "Toss has 24M MAU and Korea's highest financial app engagement. Appearing inside Toss as a partner product — not an ad — positions the bank as infrastructure rather than a competitor.",
    details: "Toss's Open Finance platform allows third-party product integration via API. A co-branded savings product ('Powered by K Bank') inside the Toss savings goal feature would appear in primary app navigation, not in an ad slot.",
    risks: ['Toss is a direct competitor — partnership requires careful product boundary negotiation', 'Revenue sharing and data sharing terms are complex', 'Integration is technically demanding and requires 6–12 months to develop'],
    exampleUsage: "A co-branded 'Toss × K Bank Goal Savings' product inside the Toss savings goal UI — 4.5% APY for goals over 6 months, with instant transfer from Toss balance and K Bank interest crediting.",
    trend: 'Rising',
    competition: 'Low',
    whyNew: "Banks view Toss as a threat and compete against it. Partnering to embed product inside Toss's UX — counter-intuitive — is a move no Korean bank has publicly executed.",
    marketAdoption: 'Early Adopter',
    exampleBrands: ['Kakao Bank (limited Toss integration, now discontinued)'],
    expectedImpact: "Access to 24M highly engaged fintech users without ad spend; brand positioned as trusted infrastructure partner rather than traditional bank.",
    base: { kpiFit: 10, novelty: 9, reach: 9, feasibility: 5 },
  },
  {
    name: 'Kakao Pay QR Merchant Co-branding',
    category: 'Fintech Partnership',
    description: "Co-branded Kakao Pay QR sticker program — a bank-exclusive benefit badge alongside the Kakao Pay QR at 3M+ participating stores, visible at every point of sale.",
    why: "Kakao Pay QR codes are on the counter of virtually every small business in Korea. A 'K Bank cardholders get X% back here' badge creates a persistent zero-ad-budget brand impression at every purchase moment.",
    details: "Kakao Pay's 40M user base and 3M+ merchant network make this the highest-reach physical touchpoint in Korean retail. A card-linked cashback partnership surfaces the bank's brand at the most frequent consumer interaction point in daily life.",
    risks: ['Requires a formal card-linked offer partnership with Kakao Pay — contract complexity is high', 'Cashback cost must be subsidised within card interchange economics', 'Exclusivity is difficult to maintain if competing banks offer similar terms'],
    exampleUsage: "A 6-month Kakao Pay partner program — K Bank Visa cardholders earn 2% cashback at any Kakao Pay merchant, displayed as a 'K Bank 2%↑' badge on the merchant QR sticker in 500,000 locations.",
    trend: 'Rising',
    competition: 'Medium',
    whyNew: "Card-linked offers exist digitally but have not been physically manifested as merchant QR badge programs in Korea — making the benefit visible at every purchase point is new.",
    marketAdoption: 'Emerging',
    exampleBrands: ['Hyundai Card (Kakao Pay co-marketing)'],
    expectedImpact: "Physical brand presence at 3M+ merchant points of sale; card usage incentive driving transaction volume and top-of-wallet behaviour.",
    base: { kpiFit: 9, novelty: 8, reach: 9, feasibility: 6 },
  },
  {
    name: '당근페이 Community Commerce Integration',
    category: 'Fintech Partnership',
    description: "A payment partnership within 당근마켓's peer-to-peer payment system — K Bank accounts as a featured funding source or a co-branded 'Safe Trade' guarantee product.",
    why: "당근마켓 is Korea's dominant community commerce platform with 22M MAU. P2P transactions require trust. A bank-backed 'Safe Trade' guarantee positions K Bank as the trust infrastructure for community commerce.",
    details: "당근마켓 has expanded into 당근페이 for P2P and local business payments. A 'K Bank Safe Trade' feature — where the bank holds funds in escrow during a trade and releases on buyer confirmation — creates genuine utility the platform currently lacks.",
    risks: ['당근마켓 has its own fintech ambitions and may prefer to build this internally', 'Escrow product creates balance sheet liability and regulatory complexity', 'User income on 당근마켓 skews lower than premium targets'],
    exampleUsage: "A 'K Bank Safe Trade' badge for 당근마켓 sellers who connect their K Bank account — funds held safely until buyer confirms receipt, with 당근 coins rewarded for completed trades.",
    trend: 'Rising',
    competition: 'Low',
    whyNew: "Community commerce platforms have P2P payment but no bank-backed trust layer. Providing this utility as a branded product creates infrastructure-level brand presence.",
    marketAdoption: 'Early Adopter',
    exampleBrands: [],
    expectedImpact: "Infrastructure-level brand embedding in Korea's #1 community platform; trust association transfers powerfully to banking brand perception.",
    base: { kpiFit: 8, novelty: 9, reach: 8, feasibility: 6 },
  },
  {
    name: 'Coupang Pay Post-purchase Card Embed',
    category: 'Fintech Partnership',
    description: "A native card recommendation embedded in the Coupang post-purchase confirmation screen — not a display ad, but a product placement inside the payment completion flow.",
    why: "The moment immediately after a successful Coupang purchase is the highest-intent financial product moment in Korean digital commerce. A card that earns cashback on this exact purchase is irresistible if presented at the right time.",
    details: "Coupang has 20M+ monthly active buyers. Post-purchase screens are monetised under Coupang's retail media program. A native 'Earn cashback on this order with K Bank Coupang Card' module outperforms any external ad by 10–30×.",
    risks: ["Coupang may prioritise its own financial products over third-party bank cards", "Integration requires Coupang API partnership and co-development effort", "Revenue sharing terms with Coupang are not yet established for bank card integrations"],
    exampleUsage: "A native embed on the Coupang order confirmation page: 'You just spent ₩89,000. With K Bank Coupang Card, you'd earn ₩2,670 back. Apply in 2 minutes.' — pre-filled application triggered by Coupang account data.",
    trend: 'Rising',
    competition: 'Medium',
    whyNew: "Post-purchase card embeds exist in US e-commerce (Amazon Store Card model) but have not been executed in Korean commerce at this level of native integration.",
    marketAdoption: 'Emerging',
    exampleBrands: ['Hyundai Card (Coupang co-brand card, separate product)'],
    expectedImpact: "High conversion at peak purchase intent; direct attribution of card applications to specific Coupang transactions.",
    base: { kpiFit: 8, novelty: 7, reach: 9, feasibility: 7 },
  },

  // ── Retail Partnership ────────────────────────────────────────────────────
  {
    name: 'IKEA Korea In-store Finance Kiosk',
    category: 'Retail Partnership',
    description: "A branded financial consultation kiosk inside IKEA Korea near the checkout zone — offering home loan, interior financing, and instalment products to shoppers making large purchases.",
    why: 'IKEA shoppers are in an active home improvement mindset. A large IKEA purchase is often a proxy trigger for a home loan or renovation credit product — the bank present at that moment converts far above cold channels.',
    details: "IKEA Korea has 6 locations with 10M+ annual visitors. Checkout zones have dwell time of 10–20 minutes. A kiosk or digital screen offering 'Interior Loan — Get instant approval while you shop' captures a high-intent audience at exactly the right moment.",
    risks: ['IKEA has its own IKEA Family card program — may restrict financial product partnerships', 'Kiosk staffing requires trained product consultants', 'Per-location footfall varies significantly between smaller and larger stores'],
    exampleUsage: "A branded K Bank kiosk at IKEA Gwangmyeong and Goyang — 'Interior Renovation Loan: up to ₩50M, approved in 10 minutes while you shop' — with QR for digital application and in-person consultation for complex cases.",
    trend: 'Rising',
    competition: 'Low',
    whyNew: "In-store financial product placement at home furnishing retailers exists in the US and UK but has not been done at Korean IKEA stores by a domestic bank.",
    marketAdoption: 'Early Adopter',
    exampleBrands: ['Ikano Bank (IKEA Europe)', 'Synchrony Financial (IKEA US)'],
    expectedImpact: "High-intent acquisition at the point of a major home purchase decision; above-average loan product conversion.",
    base: { kpiFit: 8, novelty: 8, reach: 7, feasibility: 7 },
  },
  {
    name: 'Olive Young Card-Linked Loyalty Offer',
    category: 'Retail Partnership',
    description: "A card-linked benefit where K Bank cardholders automatically receive bonus Olive Young Member points — surfaced inside the Olive Young app and at POS.",
    why: "Olive Young has 13M loyalty members, primarily women 20–35. A card-linked benefit turns K Bank into the preferred payment method for every Olive Young purchase — building top-of-wallet habit through genuine utility rather than advertising.",
    details: "Olive Young processes 90M+ transactions annually. A card-linked offer integrated with CJ Olive Young's loyalty API means K Bank cardholders see 'K Bank members earn 3× points today' at checkout — driving card usage without a traditional ad.",
    risks: ['CJ Olive Young may prioritise its own credit card partnership exclusivity', 'Points subsidy cost must be managed within card interchange economics', 'Demographic skew (female, 20–35) may need to be balanced with broader product strategy'],
    exampleUsage: "A permanent benefit: K Bank Visa cardholders earn 5% back in Olive Young points on all purchases, shown in the Olive Young app as a 'Special Benefit for K Bank Members' — no manual activation required.",
    trend: 'Rising',
    competition: 'Low',
    whyNew: "Card-linked loyalty at the product level (not just a card co-brand) is common in the US but Korean banks have not executed this integration with Olive Young.",
    marketAdoption: 'Emerging',
    exampleBrands: ['Samsung Card (CJ loyalty partnership, department stores)'],
    expectedImpact: "Daily top-of-wallet card habit formation; brand association with trusted lifestyle retail.",
    base: { kpiFit: 8, novelty: 8, reach: 7, feasibility: 7 },
  },
  {
    name: 'Supermarket Self-Checkout Screen Ads',
    category: 'Retail Partnership',
    description: "Idle-screen ads on self-checkout terminals at E-Mart and Homeplus — displayed while the customer scans items and bags groceries, a 3–5 minute captive interaction.",
    why: "Self-checkout screens display the running purchase total — a financial context — while the customer has nothing else to look at. No financial brand currently uses this placement.",
    details: "E-Mart has 700+ self-checkout terminals across 160 stores. Homeplus has a similar footprint. Idle-screen time between item scans offers a 10–30 second ad slot with natural contextual relevance to cashback card products.",
    risks: ['E-Mart self-checkout systems managed by Samsung SDS — requires system partnership approval', 'Customers at self-checkout are task-focused and may actively ignore screens', 'Ad delivery and tracking are harder to audit than digital formats'],
    exampleUsage: "A cashback card offer on E-Mart self-checkout screens — 'You saved ₩0 on this ₩85,000 shop. K Bank Cashback Card earns ₩2,550 back. Apply at checkout.' — with a QR scannable while bagging.",
    trend: 'Rising',
    competition: 'Low',
    whyNew: "Retail self-checkout screen advertising is a growing format in UK and US grocery but has not been used by Korean financial brands.",
    marketAdoption: 'Early Adopter',
    exampleBrands: ['Barclays (Tesco UK)', 'Chase (Kroger US)'],
    expectedImpact: "High contextual relevance at a financial transaction moment; unexplored category with no current competition.",
    base: { kpiFit: 7, novelty: 9, reach: 8, feasibility: 6 },
  },

  // ── Public Infrastructure ─────────────────────────────────────────────────
  {
    name: 'Han River Park Information Kiosk Sponsorship',
    category: 'Public Infrastructure',
    description: "Branded sponsor panels on digital map and information kiosks along the Han River park system — Seoul's most-visited leisure destination with 70M+ annual visits.",
    why: "Han River parks are used by every Seoul demographic year-round. Information kiosk sponsorship makes the bank the literal provider of public utility — a brand role that earns goodwill and visibility simultaneously.",
    details: "Seoul Metropolitan Government operates 80+ digital information kiosks across 12 Han River parks. Sponsorship programs are available through Seoul's public-private partnership framework. The kiosks show maps, event schedules, and emergency information.",
    risks: ['Seoul city procurement process is lengthy and competitive', 'Sponsorship terms may restrict commercial messaging — goodwill format only', 'Brand logo placement is secondary to public utility content'],
    exampleUsage: "'K Bank sponsors this Han River Information Kiosk' — with a QR to a 'Han River Savings Challenge' microsite where users set a savings goal tied to a personal Han River activity milestone.",
    trend: 'Stable',
    competition: 'Low',
    whyNew: "Public park information kiosk sponsorship by a financial brand is unprecedented in Seoul. The public utility association and ESG alignment are brand attributes advertising cannot buy.",
    marketAdoption: 'Early Adopter',
    exampleBrands: ['SK Telecom (Han River Wi-Fi sponsor)', 'Seoul Metro (partnership content)'],
    expectedImpact: "Public good brand association; persistent brand presence in Seoul's highest-footfall leisure space with ESG narrative value.",
    base: { kpiFit: 7, novelty: 8, reach: 8, feasibility: 6 },
  },
  {
    name: 'Seoul Smart City Pole Sponsorship',
    category: 'Public Infrastructure',
    description: "Sponsored ad panel on Seoul's Smart Pole program — multi-function city kiosks providing wayfinding, emergency SOS, and EV charging installed across major commercial districts.",
    why: "Smart Poles are becoming the new urban furniture of Seoul. A financial brand sponsoring a utility the city is actively building associates the bank with civic innovation — a positioning available now before poles become commoditised ad surfaces.",
    details: "Seoul plans 10,000+ Smart Poles by 2028. Current pilot zones include Hongdae, Gangnam, and Jongno. Seoul's digital infrastructure fund accepts private sponsorship partnerships. A brand sponsoring 500 poles in Gangnam gets 500 screens plus naming on the city's Smart City project website.",
    risks: ['Program rollout is slower than government projections — inventory may be limited near-term', 'Ad panel terms are still being defined — not a commercial ad network yet', 'Multiple pole designs across vendors make creative adaptation complex'],
    exampleUsage: "'K Bank Smart Pole' co-sponsorship for 200 poles in Gangnam and Mapo — displaying live branch wait times, nearest ATM directions, and a QR for contactless account opening.",
    trend: 'Rising',
    competition: 'Low',
    whyNew: "Smart Pole ad inventory is not available through any media agency — accessing it requires a direct civic partnership that most brands haven't pursued.",
    marketAdoption: 'Early Adopter',
    exampleBrands: ['KT (Smart Pole infrastructure partner, not advertising)'],
    expectedImpact: "Civic infrastructure brand association; future-proof presence as smart city surfaces become the dominant urban OOH format by 2028.",
    base: { kpiFit: 7, novelty: 9, reach: 8, feasibility: 6 },
  },
  {
    name: 'Parcel Locker Screen Ads (CU 택배함)',
    category: 'Public Infrastructure',
    description: "Idle-screen placements on CU and GS25 smart parcel locker terminals installed at apartment complex entrances — a daily touchpoint for Korea's 28M active online shoppers.",
    why: "Package pickup is now a daily ritual for Korean households. The parcel locker terminal interaction occurs in a residential context at the front door — a moment with no competing media and a financial decision-making mindset.",
    details: "CU and GS25 have deployed 80,000+ smart locker units at apartment complexes. Idle screens display CU promotional content but third-party ad inventory is not yet offered — a negotiated partnership would be first-mover.",
    risks: ['CU/GS25 parcel lockers are proprietary — third-party advertising requires a partnership deal, not a standard media buy', 'Interaction time is short — creative must be extremely concise', 'Ad revenue model for parcel lockers is not established in Korea yet'],
    exampleUsage: "A pilot with CU's parcel locker network in Mapo-gu — idle screen showing 'Earn cashback on every package you ordered. K Bank Cashback Card.' with a QR for application.",
    trend: 'Rising',
    competition: 'Low',
    whyNew: "Parcel locker advertising is a genuine white space — the format exists in China (Alibaba Cainiao) and the UK but has not been monetised in Korea.",
    marketAdoption: 'Early Adopter',
    exampleBrands: ['Alibaba Cainiao (China)', 'Amazon Hub (UK pilot)'],
    expectedImpact: "Daily residential touchpoint with e-commerce active shoppers; strong card product relevance at the exact moment of purchase behaviour evidence.",
    base: { kpiFit: 7, novelty: 9, reach: 8, feasibility: 6 },
  },
  {
    name: 'Public Library Financial Content Sponsorship',
    category: 'Public Infrastructure',
    description: "Branded content screens and a sponsored 'Financial Literacy Corner' in the entrance lobbies of public libraries — reaching an educated, financially literate demographic.",
    why: "Public library users are self-selected as information-seeking and community-oriented. A bank offering financial education content in this context earns credibility that commercial environments cannot provide.",
    details: "Seoul has 150+ public libraries with digital lobby displays managed by Seoul Metropolitan Library. Financial literacy content — market news, savings tips, investment basics — is a natural fit for the library's educational mission.",
    risks: ['Library content partnership requires Seoul city education department approval', 'Messaging must be information-first — overtly commercial content will be rejected', 'Audience numbers are modest compared to transit or retail formats'],
    exampleUsage: "'K Bank Financial Literacy Corner' on library lobby screens — rotating monthly content: savings calculators, retirement planning basics, and a QR to K Bank's in-app financial education series.",
    trend: 'Stable',
    competition: 'Low',
    whyNew: "Public library sponsorships are common in the US (Bank of America library programs) but unused by Korean banks — the trust and educational alignment offers rare brand credibility.",
    marketAdoption: 'Early Adopter',
    exampleBrands: ['Bank of America (US public libraries)', 'Shinhan Bank (limited university library)'],
    expectedImpact: "Community trust brand association; credibility as a financial education resource rather than a commercial advertiser.",
    base: { kpiFit: 7, novelty: 8, reach: 6, feasibility: 8 },
  },

  // ── Audio ─────────────────────────────────────────────────────────────────
  {
    name: 'Korean Personal Finance Podcast Sponsorship',
    category: 'Audio',
    description: "Mid-roll host-read sponsorship slots on Korea's top personal finance podcasts — 슈카월드, 머니그라피, 책읽는 라디오, 신사임당.",
    why: "Finance podcast listeners are self-selected as financially engaged, investment-minded, and above-average income. Host-read ads achieve 3–5× higher recall than pre-produced spots because the host's personal endorsement is embedded in the message.",
    details: "슈카월드 has 2M+ YouTube subscribers and 500K podcast listeners. Top 10 Korean finance podcasts reach a combined 2M+ monthly listeners. Mid-roll host reads of 60–90 seconds cost ₩3–10M per episode — a fraction of broadcast TV CPM.",
    risks: ['Podcast measurement in Korea is less developed than the US — listener counts are often estimates', "Host content is unscripted — brand message delivery depends on host relationship and briefing quality", 'Korean finance podcasts are dominated by individual creators — no centralized network buy'],
    exampleUsage: "A 6-month rolling sponsorship of 슈카월드 and 머니그라피 — host-read mid-roll: 'I personally use K Bank's 5.2% savings account for my emergency fund. Here's a listener link...' with a custom coupon code per podcast.",
    trend: 'Rising',
    competition: 'Low',
    whyNew: "Korean banks have not entered the personal finance podcast space despite it being the highest-intent financial audio format available.",
    marketAdoption: 'Early Adopter',
    exampleBrands: ['Toss (limited 신사임당 sponsor)', 'Mirae Asset (머니그라피 content partner)'],
    expectedImpact: "High-trust host endorsement reaching self-selected financially engaged listeners; trackable via coupon code with strong LTV per acquired customer.",
    base: { kpiFit: 9, novelty: 8, reach: 7, feasibility: 9 },
  },

  // ── Cinema ────────────────────────────────────────────────────────────────
  {
    name: 'Cinema Etiquette Pre-roll Slot',
    category: 'Cinema',
    description: "Own the 'please silence your phone' announcement slot that plays before any commercial pre-show begins — the single most-watched, least-expected ad slot in the entire cinema experience.",
    why: "The phone silence announcement is watched with full attention by 100% of the audience because viewers assume it is not an ad. A bank brand owning this moment creates recall that commercial pre-show cannot replicate.",
    details: "CGV and Lotte Cinema show the etiquette announcement before all pre-show advertising. This slot is not currently sold as commercial inventory — it requires a content partnership to co-produce a branded etiquette announcement. O2 UK's 'Be More Dog' execution of this format won a Cannes Lions Gold.",
    risks: ['Cinema chains may be reluctant to commercialise what audiences expect to be neutral content', "Creative must feel genuinely useful and respectful — a brand mismatch backfires severely", 'Production cost for a cinematic quality etiquette spot is higher than a standard commercial'],
    exampleUsage: "'Your phone is now off. Your money can still work.' — a 20-second branded etiquette message from K Bank, ending with the K Bank logo and a single line: 'Open a savings account. 5 minutes. Right now, while you wait.'",
    trend: 'Emerging',
    competition: 'Low',
    whyNew: "The cinema etiquette slot is one of the last truly unoccupied attention moments in mass media. No Korean bank has ever claimed it.",
    marketAdoption: 'Early Adopter',
    exampleBrands: ['O2 UK (cinema etiquette — Cannes Lions Gold)', 'Orange France (similar execution)'],
    expectedImpact: "Exceptional recall driven by the unexpectedness of the format; brand memory formed at the moment of maximum audience attentiveness.",
    base: { kpiFit: 7, novelty: 10, reach: 8, feasibility: 6 },
  },

  // ── Emerging ──────────────────────────────────────────────────────────────
  {
    name: 'Indoor Screen Golf (스크린골프) Branding',
    category: 'Emerging',
    description: "Branded scorecards, bay monitor borders, and lounge displays at GOLFZON and KAKAO VX screen golf venues — reaching 6M+ Korean players during 2–3 hour social sessions.",
    why: "Screen golf is played predominantly by 35–55 professionals — the highest-overlap demographic with wealth management, investment, and premium credit card products. Sessions are social and relaxed, ideal for longer-form brand messages.",
    details: "GOLFZON operates 10,000+ screen golf bays nationwide; KAKAO VX adds 3,000+ more. Session scorecards, bay monitor borders, and lounge waiting screens are all available for brand placement. The affluent suburban male (40–55) demographic is virtually untouched by financial brand media in this context.",
    risks: ['Bay-level branding requires physical installation across thousands of locations', 'Demographics skew male and suburban — may not match broad acquisition targets', 'Competitor financial brands may move into this space quickly once it is established'],
    exampleUsage: "A GOLFZON scorecard sponsorship across 500 premium bay locations in Gangnam, Bundang, and Gwacheon — 'Improve your handicap. Improve your portfolio.' with a QR for a wealth management consultation on every printed scorecard.",
    trend: 'Rising',
    competition: 'Low',
    whyNew: "No bank or financial brand has systematically entered screen golf as a media channel despite near-perfect demographic alignment for wealth and investment products.",
    marketAdoption: 'Early Adopter',
    exampleBrands: ['Samsung Electronics (GOLFZON equipment sponsor, not financial)'],
    expectedImpact: "Premium brand exposure in a leisure context perfectly aligned with wealth management and investment product demographics.",
    base: { kpiFit: 8, novelty: 9, reach: 7, feasibility: 7 },
  },
  {
    name: 'Coin Laundromat Screen Ads (무인세탁)',
    category: 'Emerging',
    description: "Digital screens inside unmanned coin laundromats in urban residential areas — reaching urban renters during a mandatory 40–60 minute wait.",
    why: "Coin laundromat users are predominantly urban renters aged 22–35 — the exact Gen Z and Millennial acquisition target. They are stationary for 40–60 minutes with their phone and nothing else to do. No financial brand has ever appeared here.",
    details: "Korea has 25,000+ coin laundromats, heavily concentrated in renter-dense neighbourhoods like Mapo, Seongdong, Gwanak, and Yeonsu. Digital screens are increasingly installed as operators upgrade to smart laundromat formats.",
    risks: ['Screen rollout varies by operator — digital inventory is still a minority of laundromat locations', 'Small footprint per location means a large number of locations is needed for scale', 'Demographic income is lower — better for entry-level acquisition than wealth products'],
    exampleUsage: "'While you wait, your savings could be working.' — a 15-second loop on coin laundromat screens in Sinchon, Hongdae, and Seongsu with a QR for a student savings account offering 5% APY and no minimum balance.",
    trend: 'Rising',
    competition: 'Low',
    whyNew: "Coin laundromat advertising is genuinely unexplored in Korea. The demographic match (urban renters, 22–35) and dwell time make it one of the most undervalued emerging formats available.",
    marketAdoption: 'Early Adopter',
    exampleBrands: [],
    expectedImpact: "Genuine first-mover advantage in a zero-competition environment with perfect Gen Z demographic targeting.",
    base: { kpiFit: 7, novelty: 10, reach: 6, feasibility: 8 },
  },
  {
    name: 'Hair Salon Mirror Screen Ads',
    category: 'Emerging',
    description: "Digital screens embedded in styling mirror frames at mid-to-premium hair salons — visible to clients throughout a 45–90 minute service appointment.",
    why: "Hair salon clients are stationary for 45–90 minutes with no practical way to avoid the mirror and its embedded screen. Forced-attention environments dramatically exceed passive media recall.",
    details: "Korea has 90,000+ hair salons; 10,000+ in the premium segment. Smart mirror screen networks are beginning to emerge in Korea. The client demographic in mid-premium salons skews 25–45, female-dominant, with above-average spending power.",
    risks: ['Smart mirror infrastructure is nascent in Korea — large-scale network does not yet exist', 'Salon owner buy-in requires revenue-sharing model and hardware installation', 'Forced-attention environment can generate backlash if creative is poorly received'],
    exampleUsage: "A branded content series 'Style Your Finances' on salon mirror screens in 200 premium salons in Gangnam and Hongdae — 60-second rotating content on savings tips, with a QR for a women-focused savings product offer.",
    trend: 'Rising',
    competition: 'Low',
    whyNew: "Hair salon mirror advertising is standard in the US (Salon Media Group) but does not yet exist as a structured media network in Korea — entering now means shaping the format before it commoditises.",
    marketAdoption: 'Early Adopter',
    exampleBrands: ['Allure Media (US salon screens)', 'Citi (US salon pilot)'],
    expectedImpact: "Captive female demographic touchpoint with high dwell time; strong brand recall in a beauty context aligned with lifestyle financial products.",
    base: { kpiFit: 7, novelty: 9, reach: 6, feasibility: 7 },
  },

];

// ── Discovery pool (30 market signals) ───────────────────────────────────────
// Simulates freshly launched products, new inventory, RFPs, and partnership
// announcements that the BX team should track this week.
// Fields: title, source, category, whyItMatters, baseScore (1–10)

const DISCOVERY_POOL = [

  // OOH / Digital OOH
  {
    title: 'CJ OliveNetworks Adds Financial Services Category to Elevator Screen Network',
    source: 'CJ OliveNetworks',
    category: 'OOH',
    whyItMatters: 'CJ OliveNetworks manages 80,000+ elevator lobby screens across Korea. Until now they blocked financial brand categories. The new financial services tier opens direct access to a high-dwell captive audience in residential and office buildings — without the unit-by-unit negotiation that previously made this format impractical.',
    baseScore: 8.5,
  },
  {
    title: 'Lotte World Tower Exterior LED Wrap Package Opens for H2 Booking',
    source: 'LCT Tower Media',
    category: 'OOH',
    whyItMatters: 'The LCT Tower exterior LED — the largest building-mounted screen in Seoul — is available for a 2-week brand takeover in Q3 and Q4. Demand is low outside December, making this an unusually affordable flagship moment for a bank brand in Songdo or Busan campaigns targeting HNW audiences.',
    baseScore: 8.2,
  },
  {
    title: 'Seongsu-dong Innovation Zone Smart Display Network Launches',
    source: 'Seoul Innovation Institute',
    category: 'OOH',
    whyItMatters: 'Seoul Innovation Institute is installing 40 smart digital displays across the Seongsu innovation district — targeted at 25–38 year-old professionals. The network is entering its first commercial booking cycle, with financial brands allowed from Q3. Early bookings receive a 30% rate discount.',
    baseScore: 7.8,
  },
  {
    title: 'Starfield Hanam Digital Entrance Tower Available for Brand Takeover',
    source: 'Starfield Media',
    category: 'OOH',
    whyItMatters: 'Starfield Hanam\'s 4-screen entrance tower cluster (previously booked only by Lotte and Samsung) is accepting new brand categories. 20M+ annual footfall with weekend family demographics ideal for mortgage, savings, and education fund product positioning.',
    baseScore: 7.5,
  },
  {
    title: 'Hongdae Pedestrian Zone 6-Screen Digital Cluster Opens Q3 Bookings',
    source: 'Seoul Mapo-gu Office',
    category: 'OOH',
    whyItMatters: 'Mapo-gu completed installation of a 6-screen digital OOH cluster at the Hongdae pedestrian axis. Weekend footfall exceeds 150,000. The cluster is managed directly by the district office — CPM is 40% below commercial DOOH operators, and financial brands are a new permitted category.',
    baseScore: 7.3,
  },

  // Transit / Transit Branding
  {
    title: 'Seoul Metro Opens Q3 Station Co-Naming Inventory: 12 New Stations Available',
    source: 'Seoul Metro',
    category: 'Transit Branding',
    whyItMatters: 'Seoul Metro\'s Q3 co-naming window includes 12 stations across Lines 2, 5, and 9 that have not been co-named before — including Yeouinaru (Line 5, financial district), Mapo (Line 5), and Digital Media City (Line 6). Naming rights contracts run 2–3 years. This is the largest single inventory release since the program launched.',
    baseScore: 9.2,
  },
  {
    title: 'Seoul Metro Line 5 Magok–Gimpo Airport Extension Opens 6 New Naming Rights Stations',
    source: 'Seoul Metro',
    category: 'Transit Branding',
    whyItMatters: 'The new Magok–Gimpo Airport extension stations are entering the naming rights program for the first time. Stations near Magok Tech Valley carry tech sector worker demographics (25–40, above-average income). First-round contracts will be awarded with no incumbent competition.',
    baseScore: 8.6,
  },
  {
    title: 'AREX Airport Railroad Adds Idle-Screen Ad Slots at All 10 Stations',
    source: 'AREX',
    category: 'Transit',
    whyItMatters: 'AREX connects Seoul Station to Incheon Airport in 43 minutes. The 10 stations now offer idle-screen ad inventory previously reserved for AREX self-promotion. Travelers on AREX are 100% airport-bound — the highest concentration of travel-product-receptive audience in any transit format.',
    baseScore: 8.1,
  },
  {
    title: 'Kakao Mobility Programmatic Taxi-Top LED Network Launches Nationwide',
    source: 'Kakao Mobility',
    category: 'Transit',
    whyItMatters: 'Kakao Mobility is launching a programmatic taxi-top LED network across its 180,000 vehicle fleet. GPS-triggered creative changes enable branch-proximity campaigns and daypart-based financial product messaging. This is the first programmatic OOH format in Korea with real-time location data at scale.',
    baseScore: 8.0,
  },
  {
    title: 'KTX Gyeonggang Line Interior Digital Screens Fully Upgraded to HD',
    source: 'Korail',
    category: 'Transit',
    whyItMatters: 'Korail completed a full HD screen upgrade on all KTX Gyeonggang Line interior screens. The Seoul–Gangneung route sees premium leisure travelers (ski season, Chuseok travel) and business travelers. The upgraded screens support motion creative — previously only static print was possible on this route.',
    baseScore: 7.0,
  },

  // Cinema
  {
    title: 'CGV Formally Opens Brand Integration Program for Pre-Show Etiquette Slot',
    source: 'CGV',
    category: 'Cinema',
    whyItMatters: 'CGV is for the first time officially accepting brand partnership applications for the pre-show phone etiquette announcement slot. Only one brand per content category will be accepted per season. This is the slot that O2 UK used to win Cannes Gold — and the first Korean cinema chain to commercialise it. The opportunity is time-limited to the first applicant per category.',
    baseScore: 9.5,
  },
  {
    title: 'CGV Gold Class Lounge Branding Package Available for H2 2026 Booking',
    source: 'CGV',
    category: 'Cinema',
    whyItMatters: 'CGV Gold Class lounges at Gangnam, COEX, and Yeouido are opening a premium lounge branding package: digital screen, seat headrest cards, and barista-delivered menu inserts. The Gold Class audience is 35–55, above-average income. No financial brand has held this placement.',
    baseScore: 8.1,
  },
  {
    title: 'Lotte Cinema Opens 3 New IMAX Screens at Gimpo Airport and Seongnam',
    source: 'Lotte Cinema',
    category: 'Cinema',
    whyItMatters: 'Three new Lotte Cinema IMAX screens are opening in H2 2026. Launch week packages offer full pre-show ownership at below-market rates. The airport location reaches departing travelers — unusually high travel product purchase intent in a cinema context.',
    baseScore: 7.6,
  },
  {
    title: 'Megabox Launches Pause-Screen Native Content Sponsorship Program',
    source: 'Megabox',
    category: 'Cinema',
    whyItMatters: 'Megabox is launching a pause-screen sponsorship during the 5-minute film countdown clock — a full-screen branded moment with 100% audience attention before the film starts. Megabox controls 22% of Korean cinema screens, skewing younger than CGV. H2 bookings are open with a first-mover pricing incentive.',
    baseScore: 7.8,
  },

  // Public Bidding
  {
    title: 'Seoul Smart Pole Phase 2 RFP: 500 Pole Sponsorships in Gangnam-gu Open',
    source: 'Seoul Metropolitan Government',
    category: 'Public Bidding',
    whyItMatters: 'Seoul City has issued an RFP for corporate co-sponsorship of 500 Smart Poles in Gangnam-gu as part of the Smart City infrastructure program. Sponsors receive naming acknowledgment on Seoul\'s Smart City website, digital screen real estate, and EV charging co-branding. Bid deadline is 6 weeks from announcement. This is a competitive tender — financial brands are permitted applicants.',
    baseScore: 9.1,
  },
  {
    title: 'Incheon Airport T3 Gate Charging Station Infrastructure Partnership Bid',
    source: 'Incheon Airport Corporation',
    category: 'Public Bidding',
    whyItMatters: 'Incheon Airport Corporation is seeking a corporate partner to fund and brand the gate charging stations in the new Terminal 3 (opening 2027). The partner receives exclusive branding on all T3 gate charging infrastructure from day one. This is a 5-year exclusivity contract — the most valuable airport touchpoint in Korea for the next decade.',
    baseScore: 9.0,
  },
  {
    title: 'Han River Park Kiosk Renovation Project Open for Co-Sponsorship Bids',
    source: 'Seoul Hangang Project Headquarters',
    category: 'Public Bidding',
    whyItMatters: 'Seoul Hangang is replacing 80 information kiosks across 12 Han River parks. The procurement process allows co-sponsorship bids where a corporate partner covers 30–50% of installation costs in exchange for naming acknowledgment and digital screen time. Bids due next month. This is the only publicly available route to Han River park digital screen inventory.',
    baseScore: 7.6,
  },
  {
    title: 'Seoul Metropolitan Library Digital Content Sponsorship Program Launches',
    source: 'Seoul Metropolitan Library',
    category: 'Public Bidding',
    whyItMatters: 'Seoul\'s 150 public libraries are launching a corporate sponsorship program for digital lobby screen content. Sponsors receive 2 content slots per week alongside library programming, a co-branded "Financial Wellness" content category, and logo placement. Applications are accepted on a rolling basis.',
    baseScore: 7.2,
  },
  {
    title: 'Incheon Metro Line 2 Station Co-Naming Auction Opens for 8 Stations',
    source: 'Incheon Metro',
    category: 'Public Bidding',
    whyItMatters: 'Incheon Metro is auctioning co-naming rights for 8 stations on Line 2, which connects Incheon Airport to residential and commercial areas. Songdo International Business District stations carry a particularly affluent, internationally mobile audience. First auction in 3 years — previous names expire in August.',
    baseScore: 8.0,
  },
  {
    title: 'Seoul Dulegil Trail Smart Bench Sponsorship Program Announced',
    source: 'Seoul Parks Authority',
    category: 'Public Bidding',
    whyItMatters: 'Seoul Parks Authority is installing 200 solar-powered smart benches with QR displays along the Dulegil hiking trail network. A corporate naming sponsor receives branding on all benches and QR screens for 3 years. The program targets the health-conscious 40–60 demographic — strong LTV overlap for investment and retirement products.',
    baseScore: 6.8,
  },

  // Retail Partnership
  {
    title: 'CJ Olive Young Opens Card-Linked Offer API to Financial Brand Partners',
    source: 'CJ Olive Young',
    category: 'Retail Partnership',
    whyItMatters: 'Olive Young has opened a formal B2B API for card-linked cashback and points programs. Financial brands can now integrate directly with the Olive Young loyalty system to surface benefits at checkout — without a custom development contract. This is the first time Olive Young has offered this to non-Samsung and non-Hyundai card partners. The integration window is open to 3 brands.',
    baseScore: 9.5,
  },
  {
    title: 'BGF Retail (CU) Opens Parcel Locker Screen Advertising Pilot Q3 2026',
    source: 'BGF Retail',
    category: 'Retail Partnership',
    whyItMatters: 'BGF Retail is piloting third-party advertising on CU smart parcel locker screens at 500 apartment complexes in Seoul starting Q3. Financial services are a permitted category. The pilot runs for 8 weeks with 3 brand slots available. This is the first time CU parcel locker screens have been opened to external advertisers.',
    baseScore: 8.8,
  },
  {
    title: 'E-Mart Retail Media Network v2 Launches With Financial Services Ad Category',
    source: 'E-Mart',
    category: 'Retail Partnership',
    whyItMatters: 'E-Mart is relaunching its retail media network with enhanced targeting and a new financial services ad category. Self-checkout screens, end-of-aisle displays, and app push notifications are now available as a unified package. First-party E-Mart data enables targeting by household spend tier, frequency, and product category.',
    baseScore: 8.5,
  },
  {
    title: 'IKEA Korea Announces In-Store Financial Partner Program for H2 2026',
    source: 'IKEA Korea',
    category: 'Retail Partnership',
    whyItMatters: 'IKEA Korea is formally launching an in-store financial partner program — allowing one financial brand partner per store to operate a branded financing kiosk in the checkout zone. The program covers all 6 Korean locations. IKEA is currently evaluating partner applications. This is modeled on the IKEA Ikano Bank partnership in Europe.',
    baseScore: 8.3,
  },
  {
    title: 'Homeplus Self-Checkout Screen Network Opens to Third-Party Advertisers',
    source: 'Homeplus',
    category: 'Retail Partnership',
    whyItMatters: 'Homeplus has opened its 500+ self-checkout terminal screens to third-party advertisers for the first time. Financial services, insurance, and telecom brands are accepted. The touchpoint captures 3–5 minutes of customer attention during item scanning — the running purchase total on screen creates natural adjacency for cashback card messaging.',
    baseScore: 8.0,
  },

  // Fintech / New Platform
  {
    title: 'ChargeEV Launches Ad-Supported EV Charger Screen Monetization Program',
    source: 'ChargeEV',
    category: 'EV Infrastructure',
    whyItMatters: 'ChargeEV — Korea\'s largest independent EV charging network with 50,000+ chargers — is launching a formal advertising monetization program for its charger display screens. Financial services are the highest-priority category. Advertisers receive 15–45 minutes of dwell-time exposure per charge session. This is the first EV charger ad network at scale in Korea.',
    baseScore: 9.2,
  },
  {
    title: '아파트아이 Opens B2B Advertising SDK for Financial Product Placements',
    source: '아파트아이',
    category: 'Retail Partnership',
    whyItMatters: '아파트아이 — with 3M+ registered apartment households — has launched a B2B advertising SDK that allows financial brands to place contextual offers inside the app\'s bill payment, maintenance request, and community notice flows. This is the first formal ad product from Korea\'s leading apartment management platform. SDK integration takes 4–6 weeks.',
    baseScore: 8.9,
  },
  {
    title: 'FastFive Launches Corporate Brand Sponsorship Packages for 50 Seoul Locations',
    source: 'FastFive',
    category: 'Coworking',
    whyItMatters: 'FastFive has formalised its corporate sponsorship offering: a single brand sponsor receives Wi-Fi login page branding, lounge digital screen presence, and meeting room naming rights across all 50 Seoul locations simultaneously. The financial services category is currently unoccupied. Package pricing is significantly below what a comparable mass digital campaign would cost.',
    baseScore: 7.9,
  },
  {
    title: 'GOLFZON Announces Media Partnership Program for Bay Monitor Screen Branding',
    source: 'GOLFZON',
    category: 'Coworking',
    whyItMatters: 'GOLFZON is formally launching a media partnership program offering bay monitor border branding and scorecard sponsorship across its 10,000+ Korean bays. One financial brand partner will receive category exclusivity. The 35–55 male professional demographic using GOLFZON is the highest-overlap audience for wealth management and premium card products.',
    baseScore: 8.6,
  },
  {
    title: '당근마켓 Launches B2B Marketing API for Card-Linked Local Commerce Offers',
    source: '당근마켓',
    category: 'Retail Partnership',
    whyItMatters: '당근마켓 has opened a B2B API that allows financial brands to surface card-linked cashback offers when users make payments through 당근페이. The API surfaces offers by neighborhood and merchant category. This is the first formal financial product integration channel from 당근마켓 outside its own advertising platform.',
    baseScore: 8.5,
  },

];

// ── Discovery history helpers ─────────────────────────────────────────────────
const HISTORY_PATH    = path.join(__dirname, 'data', 'history', 'discoveries.json');
const EXCLUSION_WEEKS = 8;

function loadHistory() {
  try {
    if (fs.existsSync(HISTORY_PATH)) {
      return JSON.parse(fs.readFileSync(HISTORY_PATH, 'utf-8'));
    }
  } catch { /* ignore */ }
  return { lastUpdated: null, weeks: [] };
}

function saveHistory(history) {
  fs.mkdirSync(path.dirname(HISTORY_PATH), { recursive: true });
  fs.writeFileSync(HISTORY_PATH, JSON.stringify(history, null, 2), 'utf-8');
}

// ── Generator ─────────────────────────────────────────────────────────────────
function generate(history) {
  const today    = new Date();
  const dateStr  = today.toISOString().slice(0, 10);
  const themeDef = WEEKLY_THEMES[Math.floor(Math.random() * WEEKLY_THEMES.length)];
  const count    = Math.floor(Math.random() * 6) + 10; // 10–15

  const scored = POOL.map(item => {
    const themeBoost  = themeDef.preferHigh.reduce((s, d) => s + item.base[d], 0);
    const shuffleSeed = Math.random() + themeBoost * 0.04;
    return { item, shuffleSeed };
  });
  scored.sort((a, b) => b.shuffleSeed - a.shuffleSeed);
  const selected = scored.slice(0, count).map(s => s.item);

  const opportunities = selected
    .map(item => {
      const kpiFit      = jitter(item.base.kpiFit);
      const novelty     = jitter(item.base.novelty);
      const reach       = jitter(item.base.reach);
      const feasibility = jitter(item.base.feasibility);
      const score       = computeScore({ kpiFit, novelty, reach, feasibility });
      return {
        name:           item.name,
        category:       item.category,
        description:    item.description,
        why:            item.why,
        whyNew:         item.whyNew,
        marketAdoption: item.marketAdoption,
        exampleBrands:  item.exampleBrands,
        expectedImpact: item.expectedImpact,
        kpiFit, novelty, reach, feasibility, score,
        trend:          item.trend,
        competition:    item.competition,
        details:        item.details,
        risks:          item.risks,
        exampleUsage:   item.exampleUsage,
      };
    })
    .sort((a, b) => b.score - a.score);

  // ── Discovery selection with deduplication ────────────────────────────────
  // Titles surfaced within the last EXCLUSION_WEEKS runs are blocked
  const recentWeeks   = history.weeks.slice(0, EXCLUSION_WEEKS);
  const recentTitles  = new Set(recentWeeks.flatMap(w => w.titles));
  // All titles ever surfaced (for isNew classification)
  const allHistTitles = new Set(history.weeks.flatMap(w => w.titles));
  // Previous week titles (for diff/comparison)
  const prevTitles    = new Set((history.weeks[0]?.titles) ?? []);

  const shuffle = arr => [...arr].sort(() => Math.random() - 0.5);

  // Tiered candidate pool: unseen first, then eligible (past exclusion window), then excluded as last resort
  const candidatePool = [
    ...shuffle(DISCOVERY_POOL.filter(d => !allHistTitles.has(d.title))),
    ...shuffle(DISCOVERY_POOL.filter(d => allHistTitles.has(d.title) && !recentTitles.has(d.title))),
    ...shuffle(DISCOVERY_POOL.filter(d => recentTitles.has(d.title))),
  ];

  const wantCount  = Math.floor(Math.random() * 3) + 5; // 5–7
  const discoveries = candidatePool
    .slice(0, wantCount)
    .map(d => ({
      title:            d.title,
      source:           d.source,
      category:         d.category,
      discoveryDate:    dateStr,
      whyItMatters:     d.whyItMatters,
      opportunityScore: jitter(d.baseScore),
      isNew:            !allHistTitles.has(d.title),
      isReturning:      allHistTitles.has(d.title) && !recentTitles.has(d.title),
    }))
    .sort((a, b) => b.opportunityScore - a.opportunityScore);

  // ── Weekly diff vs previous run ───────────────────────────────────────────
  const currentTitles   = new Set(discoveries.map(d => d.title));
  const newTitles       = discoveries.filter(d => !prevTitles.has(d.title)).map(d => d.title);
  const returningTitles = discoveries.filter(d => prevTitles.has(d.title)).map(d => d.title);
  const removedTitles   = [...prevTitles].filter(t => !currentTitles.has(t));

  const discoverySummary = {
    newCount:                  newTitles.length,
    returningCount:            returningTitles.length,
    removedFromLastWeekCount:  removedTitles.length,
    newTitles,
    returningTitles,
    removedFromLastWeekTitles: removedTitles,
    hasPreviousWeek:           prevTitles.size > 0,
  };

  // ── Updated history (deduplicate same-day re-runs) ────────────────────────
  const updatedHistory = {
    lastUpdated: dateStr,
    weeks: [
      { weekDate: dateStr, titles: discoveries.map(d => d.title) },
      ...history.weeks.filter(w => w.weekDate !== dateStr),
    ],
  };

  return {
    output: {
      generatedAt:      today.toISOString(),
      weekLabel:        `${today.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })} 주간`,
      weekTheme:        themeDef.theme,
      aiCommentary:     themeDef.commentary,
      scoreWeights:     WEIGHTS,
      count:            opportunities.length,
      opportunities,
      discoveries,
      discoverySummary,
    },
    dateStr,
    updatedHistory,
  };
}

function main() {
  const weeksDir = path.join(__dirname, 'data', 'weeks');
  fs.mkdirSync(weeksDir, { recursive: true });

  const history                          = loadHistory();
  const { output, dateStr, updatedHistory } = generate(history);
  const json                             = JSON.stringify(output, null, 2);

  fs.writeFileSync(path.join(weeksDir, `${dateStr}.json`), json, 'utf8');
  fs.writeFileSync(path.join(weeksDir, 'latest.json'),    json, 'utf8');
  saveHistory(updatedHistory);

  const ds = output.discoverySummary;
  console.log(`\n✓ Generated ${output.count} opportunities + ${output.discoveries.length} discoveries`);
  console.log(`  Theme      : ${output.weekTheme}`);
  console.log(`  Dated      : data/weeks/${dateStr}.json`);
  console.log(`  History    : data/history/discoveries.json  (${updatedHistory.weeks.length} week${updatedHistory.weeks.length !== 1 ? 's' : ''} stored)`);
  console.log(`\n  Discovery breakdown:`);
  console.log(`    New (never seen)  : ${ds.newCount}`);
  console.log(`    Returning (>8 wks): ${ds.returningCount}`);
  console.log(`    Removed vs last wk: ${ds.removedFromLastWeekCount}`);
  console.log(`\n  Top 3 discoveries:`);
  output.discoveries.slice(0, 3).forEach((d, i) => {
    const tag = d.isNew ? 'NEW' : d.isReturning ? 'RETURNING' : 'REPEAT';
    console.log(`    ${i + 1}. ${d.title.slice(0, 50).padEnd(50)} ${d.opportunityScore.toFixed(1)}  [${tag}]`);
  });
  console.log();
}

main();
