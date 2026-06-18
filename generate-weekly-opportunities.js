#!/usr/bin/env node
// generate-weekly-opportunities.js
// Simulates LLM-generated media opportunity output for the bank marketing radar.
// Usage: node generate-weekly-opportunities.js
// Output: data/weeks/YYYY-MM-DD.json  +  data/weeks/latest.json

'use strict';

const fs   = require('fs');
const path = require('path');

// ── Score weights ─────────────────────────────────────────────────────────────
const WEIGHTS = { kpiFit: 0.30, novelty: 0.20, reach: 0.30, feasibility: 0.20 };

function computeScore({ kpiFit, novelty, reach, feasibility }) {
  const raw = kpiFit * WEIGHTS.kpiFit
            + novelty * WEIGHTS.novelty
            + reach * WEIGHTS.reach
            + feasibility * WEIGHTS.feasibility;
  return Math.round(raw * 10) / 10;
}

// Apply ±0.4 jitter then clamp to [1, 10] with 1 decimal
function jitter(base) {
  const val = base + (Math.random() * 0.8 - 0.4);
  return Math.round(Math.min(10, Math.max(1, val)) * 10) / 10;
}

// ── Weekly themes (simulates LLM focus selection) ────────────────────────────
const WEEKLY_THEMES = [
  {
    theme: 'Gen Z Acquisition Focus',
    commentary: "This week's selection prioritizes high-novelty, digital-native channels with strong under-28 audience reach, reflecting a Q2 goal to grow the youth banking segment through experiential and contextual formats.",
  },
  {
    theme: 'High-Net-Worth Targeting',
    commentary: "Channels this week skew toward premium environments — airports, cinemas, and luxury retail — optimized for wealth management and private banking product exposure to the 35–55 HNW demographic.",
  },
  {
    theme: 'Mass Awareness Push',
    commentary: "Focus is on high-reach transit and OOH formats, maximizing impression volume for a broad brand awareness objective ahead of a seasonal product campaign launch.",
  },
  {
    theme: 'Experiential & Brand Love',
    commentary: "The selection leans into experiential and partnership channels that create direct audience interaction — ideal for brand perception campaigns targeting Millennials who prefer authentic, lifestyle-first storytelling.",
  },
  {
    theme: 'Cost Efficiency Sprint',
    commentary: "Channels selected this week optimize feasibility and cost-efficiency, suitable for a lean media budget while maintaining category presence through high-ROI owned and low-competition formats.",
  },
  {
    theme: 'Digital-Physical Convergence',
    commentary: "The mix blends programmatic OOH with physical touchpoints to create connected cross-channel journeys — from awareness (billboard) through consideration (ATM) to conversion (app-triggered offer).",
  },
];

// ── Opportunity pool (35 items) ───────────────────────────────────────────────
// Each item carries full display content + base scores for the 4 KPI dimensions.
// The generator samples 10–15 items per week, applies light jitter, then ranks by score.

const POOL = [
  // ── Transit ──────────────────────────────────────────────────────────────
  {
    name: 'Subway Screen Door Ads',
    category: 'Transit',
    description: 'Digital and static ads on platform screen doors across Seoul Metro Lines 1–9, reaching millions of daily commuters at eye level on every platform.',
    why: 'Extremely high frequency touchpoint — commuters average 8+ exposures per week, ideal for product recall and QR-driven app download campaigns.',
    details: 'Seoul Metro carries 6–7 million daily passengers. Digital inventory on Lines 2, 5, and 9 supports motion creative and dayparting. Campaigns covering 50–200 stations deliver 3–12 million weekly impressions with measurable uplift in branch foot traffic.',
    risks: ['Category saturation — competing banks hold significant share of voice on key lines', 'Static formats on Lines 1, 3, 4 limit creative dynamism', '4–6 week advance booking required; reactive slots are rarely available'],
    exampleUsage: 'A 4-week burst on Line 2 (Gangnam → Hongdae → Sinchon) with animated door creatives highlighting a new savings rate, QR code opening the app directly to the product page.',
    trend: 'Stable',
    competition: 'High',
    base: { kpiFit: 9, novelty: 3, reach: 9, feasibility: 8 },
  },
  {
    name: 'Station Naming Rights',
    category: 'Transit Branding',
    description: "Co-naming rights for a subway station — the bank's brand appended to signage, PA announcements, Kakao Map, and Naver Map.",
    why: 'Station names are announced 40–60 times per hour, creating persistent top-of-mind awareness near a branch or HQ with no competing creative.',
    details: "Seoul Metro's co-naming program lets brands buy secondary naming rights to any available station across all announcement and navigation touchpoints. Contracts run 1–3 years. Proximity to a flagship branch amplifies local halo significantly.",
    risks: ['Desirable station inventory is finite and competitive at renewal', 'Negative incidents in the catchment area create unwanted brand association', 'Geographic focus limits impact for nationwide campaigns'],
    exampleUsage: "Secure 'Seolleung · K Bank Station' for 2 years, anchoring mortgage and wealth management awareness in Gangnam's highest-income corridor.",
    trend: 'Rising',
    competition: 'Low',
    base: { kpiFit: 8, novelty: 7, reach: 8, feasibility: 7 },
  },
  {
    name: 'Bus Exterior Ads',
    category: 'Transit',
    description: 'Full-wrap or partial vinyl advertising on city buses operating across Seoul and major metropolitan areas.',
    why: 'Mobile billboard with broad geographic coverage — reaches residential neighborhoods and secondary corridors at a lower CPM than subway or cinema.',
    details: 'Full-wrap campaigns across 30–100 buses generate 1–5 million daily impressions depending on route selection. Creative changes require physical reprinting, making this format best for sustained 4–12 week campaigns.',
    risks: ['No digital or daypart targeting — same creative runs around the clock', 'Impact quality drops at speed; recall is lower than static placements', 'Summer heat and weather degrade vinyl quality over long campaigns'],
    exampleUsage: 'A 6-week wrap on 40 buses along Yeouido financial district corridors (routes 145, 360, 461) timed to a spring IRP/pension product campaign.',
    trend: 'Stable',
    competition: 'Medium',
    base: { kpiFit: 6, novelty: 3, reach: 7, feasibility: 9 },
  },
  {
    name: 'Taxi Top Digital Ads',
    category: 'Transit',
    description: 'GPS-connected LED displays on taxi rooftops, dynamically updated with location- and time-based creative.',
    why: 'Location-triggered messaging near branches and business districts. Growing programmatic inventory enables A/B testing and hour-level scheduling without reprint costs.',
    details: 'Kakao Mobility and T-map fleets operate 250,000+ taxis nationwide. GPS triggers allow creative to switch within 300m of a branch to a local offer. Platforms like MOBI support impression-level tracking.',
    risks: ['Verified viewability is difficult — pedestrian vs. vehicle audience not reliably segmented', 'Dynamic targeting requires API integration with fleet management systems', 'Premium city-center inventory has high CPM with limited daily supply'],
    exampleUsage: "Geo-trigger a 'Nearest Branch Open Now' creative when taxis pass within 300m of any K Bank location, switching to a digital account-opening offer in the evenings.",
    trend: 'Rising',
    competition: 'Low',
    base: { kpiFit: 7, novelty: 7, reach: 7, feasibility: 7 },
  },
  {
    name: 'Airport Terminal Ads',
    category: 'Transit',
    description: 'Large-format and digital placements at Incheon and Gimpo airports — check-in halls, departure lounges, duty-free corridors, and baggage claim.',
    why: "Captures high-net-worth travelers and frequent business flyers — the ideal audience for premium banking cards, overseas remittance, and travel insurance products.",
    details: 'Incheon Airport handles 67M+ annual passengers. Departure lounge placements have 60–120 minute pre-board dwell time. Digital displays support real-time updates and route-aware messaging. Gimpo targets Korea domestic business travelers.',
    risks: ['International travel volumes still below 2019 peak in some corridors', 'Premium inventory dominated by major financial brands year-round', 'High context noise from duty-free retail and competing travel advertisers'],
    exampleUsage: "Departure hall placements at Incheon Terminal 1 targeting travelers to Southeast Asia and Japan — travel insurance and foreign currency combo offer, activated during Chuseok and summer peak seasons.",
    trend: 'Stable',
    competition: 'High',
    base: { kpiFit: 8, novelty: 5, reach: 7, feasibility: 7 },
  },
  {
    name: 'KTX Train Interior Ads',
    category: 'Transit',
    description: 'Seat-back tray table ads and overhead panel branding on KTX high-speed rail connecting Seoul to major regional cities.',
    why: '1–3 hour captive dwell time with a business traveler-heavy audience above average household income — well suited for detailed product storytelling.',
    details: "Korail's KTX carries 40M+ passengers annually on Seoul–Busan, Seoul–Gwangju, and Seoul–Gangneung routes. Tray table and panel formats sit directly in the passenger's field of view with minimal competing stimuli. Packages can be segmented by route.",
    risks: ['Static print only — no digital, motion, or interactive inventory currently available', 'Reach is narrow compared to metro or DOOH volumes', 'Schedule disruptions reduce delivery without compensation'],
    exampleUsage: 'A tray table insert on Seoul–Busan weekday AM business services promoting an SME loan product with a QR code to a 5-minute pre-approval flow.',
    trend: 'Stable',
    competition: 'Low',
    base: { kpiFit: 7, novelty: 4, reach: 6, feasibility: 8 },
  },
  {
    name: 'T-money Card Insert Ads',
    category: 'Transit',
    description: 'Branded paper inserts included in new T-money transit card packaging sold at convenience stores and transit offices nationwide.',
    why: 'Reaches a mass-market audience at the moment they are setting up a new payment card — high receptivity to financial product cross-sell messages.',
    details: 'T-money cards sell ~8 million units annually. The card package insert sits in a low-competition, single-brand context inside the packaging. Format supports QR codes and coupon codes for direct response tracking.',
    risks: ['Static print format with limited creative richness', 'Purchase occasion is infrequent per user — single exposure window', 'Declining as mobile T-money (NFC phone tap) replaces physical cards'],
    exampleUsage: 'A package insert offering ₩5,000 cashback on the first debit card transaction for new accounts opened via QR within 30 days of T-money card activation.',
    trend: 'Declining',
    competition: 'Low',
    base: { kpiFit: 7, novelty: 5, reach: 8, feasibility: 8 },
  },

  // ── Cinema ───────────────────────────────────────────────────────────────
  {
    name: 'CGV Cinema Pre-show Ads',
    category: 'Cinema',
    description: 'Full-motion video ads shown in the 5–10 minute pre-show window before screenings at CGV, Korea\'s largest cinema chain with 130+ locations.',
    why: "Premium captive audience in a dark, phone-free environment with genuine attention — ideal for brand storytelling and product launches targeting affluent 25–45 year-olds.",
    details: 'CGV controls 48% of Korean cinema screens. With 180M annual industry admissions, cinema delivers a rare combination of high attention quality and creative latitude — 60-second spots and surround-sound audio unavailable in other OOH formats.',
    risks: ['High CPM vs. digital — best for brand-building, not performance campaigns', 'Cinema admissions remain ~15% below pre-pandemic 2019 levels in some regions', '4–6 week lead time limits tactical use'],
    exampleUsage: 'A 60-second emotional brand film during the Chuseok blockbuster window across CGV IMAX in Gangnam, COEX, and Yeongdeungpo — QR end-card driving to a home loan calculator.',
    trend: 'Stable',
    competition: 'Medium',
    base: { kpiFit: 7, novelty: 4, reach: 7, feasibility: 8 },
  },
  {
    name: 'Lotte Cinema Digital Lobby Screen',
    category: 'Cinema',
    description: 'Full-motion digital signage in Lotte Cinema lobbies during high-footfall periods — evenings and weekends at 110+ locations nationwide.',
    why: "Lotte Cinema reaches a distinct audience skew vs. CGV — more suburban and family-oriented. Lobby screens run 5–10 minutes before auditorium entry, with low ad clutter.",
    details: "Lotte Cinema is Korea's second-largest chain with 30% market share. Lobby digital screens offer motion creative in a brand-safe environment. Premium placement in flagship locations (Lotte World Mall, Konkuk) commands highest CPM.",
    risks: ['Slightly lower urban-professional demographic concentration than CGV', 'Lobby screens compete with refreshment counter noise and conversation', 'Admissions dependent on blockbuster release calendar — off-peak weeks underperform'],
    exampleUsage: 'A 15-second animated brand spot on Lotte Cinema lobby screens in family-heavy suburban locations (Nowon, Songpa, Incheon) promoting a family savings account bundle during school holiday weeks.',
    trend: 'Stable',
    competition: 'Low',
    base: { kpiFit: 7, novelty: 5, reach: 7, feasibility: 8 },
  },

  // ── OOH / Billboard ──────────────────────────────────────────────────────
  {
    name: 'Digital Billboard (DOOH)',
    category: 'Digital OOH',
    description: 'Programmatic full-motion ads on large-format LED screens in premium urban locations — Gangnam, Hongdae, Times Square Yeongdeungpo, COEX.',
    why: "Audience data enables dayparting and contextual creative. Strong brand impact with motion content in high-footfall areas. Programmatic buying allows flexible pacing.",
    details: 'Premium DOOH inventory is increasingly programmatic with real-time audience indexing from mobile panels. LED screens support 4K motion creative. Kakao Mobility and Lotte Members data can be layered for audience precision. Q4 slots must be booked 8–12 weeks in advance.',
    risks: ['Premium locations command ₩5–15M per 2-week burst per screen', 'Creative quality demands are unforgiving at large scale', 'Q4 inventory is heavily contested'],
    exampleUsage: 'A 2-week burst at the Gangnam Station intersection and Times Square during a fall product launch — 10-second animated spot with QR overlay, dayparted to office hours (9am–7pm) for wealth management targeting.',
    trend: 'Rising',
    competition: 'High',
    base: { kpiFit: 8, novelty: 6, reach: 9, feasibility: 7 },
  },
  {
    name: 'Elevator Lobby Screens',
    category: 'OOH',
    description: 'Digital screen ads in elevator lobbies of high-rise office buildings and residential apartment complexes across Seoul and major cities.',
    why: 'Captive audience with 30–90 second dwell time and no phone distractions — prime demographic for wealth management, mortgage, and savings product messaging.',
    details: 'Networks like Seoul Ads and CJ OliveNetworks manage screens in 10,000+ buildings. Dwell time substantially exceeds street-level OOH. Residential building inventory can be segmented by apartment price tier.',
    risks: ['Premium residential and commercial inventory is limited and expensive', 'Screens in older buildings may have low resolution or inconsistent maintenance', 'Impression delivery across fragmented networks is difficult to audit independently'],
    exampleUsage: 'A 6-week campaign in elevator lobbies of ₩1.5B+ apartment complexes in Mapo, Yongsan, and Seongdong-gu with a wealth management message — timed to real estate transaction peak season (March–April).',
    trend: 'Rising',
    competition: 'Medium',
    base: { kpiFit: 7, novelty: 5, reach: 7, feasibility: 7 },
  },
  {
    name: 'University Campus Digital Kiosks',
    category: 'OOH',
    description: 'Branded digital kiosks and poster frames on campuses of top Korean universities including SKY, KAIST, and Sogang.',
    why: 'First-mover opportunity to establish banking relationships before students enter the workforce — high long-term lifetime value at the lowest CPM of their banking life.',
    details: "Korea's top 20 universities enroll 500,000+ students concentrated in Seoul. Campus media includes digital kiosks, dormitory displays, and sponsored events. KAIST and engineering campuses offer access to future tech-sector high earners.",
    risks: ['Students generate minimal immediate product revenue — ROI horizon 5–10 years', 'FSC regulations restrict financial product advertising targeting under-21s', 'Campus rights are fragmented — must negotiate with each institution separately'],
    exampleUsage: 'A semester-long program at KAIST, Yonsei, and Korea University combining digital kiosk placements, a student financial wellness workshop, and a first-account bonus offer.',
    trend: 'Rising',
    competition: 'High',
    base: { kpiFit: 7, novelty: 5, reach: 7, feasibility: 7 },
  },
  {
    name: 'Gas Station Pump Screen Ads',
    category: 'OOH',
    description: 'Short-form video ads on digital screens mounted at GS Caltex and SK Energy pump terminals, running while the customer waits during refueling.',
    why: "Captive 3–5 minute dwell time with zero competing content. Drivers waiting at the pump are in a low-stimulation environment with demonstrated recall rates above street-level OOH.",
    details: 'Korea has 11,000+ gas stations. Major networks (GS Caltex, SK Shieldon) are rolling out digital pump screens at forecourts. The audience skews 30–55 male, car-owning suburban — well-aligned with car loan and insurance products.',
    risks: ['Digital screen rollout still expanding — not yet national coverage', 'Outdoor environment (heat, glare) can affect display quality and attention', 'Format is new in Korea — benchmark data is limited'],
    exampleUsage: 'A 4-week campaign on GS Caltex pump screens in Bundang, Ilsan, and Pangyo suburbs promoting a car loan with a pre-approval QR code — targeting suburban commuters with vehicle ownership.',
    trend: 'Rising',
    competition: 'Low',
    base: { kpiFit: 7, novelty: 7, reach: 7, feasibility: 7 },
  },
  {
    name: 'Parking Garage Exit Screens',
    category: 'OOH',
    description: 'Captive digital displays at parking exit barriers in major shopping mall and office building car parks across Seoul.',
    why: 'Drivers at the exit barrier are stationary for 20–40 seconds with their gaze directed at the barrier screen — uncommonly high attention for an OOH format.',
    details: 'IFC Seoul, COEX, and major Lotte Mall complexes have digitized exit barriers with ad screens. The audience is self-selected spenders — shoppers exiting malls are in a post-purchase mindset receptive to financial product messaging.',
    risks: ['Inventory concentrated in premium locations, limiting broad reach', 'Dwell time varies — busy periods reduce it to under 10 seconds', 'Creative must be extremely concise due to very short viewing window'],
    exampleUsage: 'A cashback credit card offer displayed at COEX and Times Square parking exits, with a 6-digit code redeemable in the app — tracking direct response from parking exit exposure.',
    trend: 'Rising',
    competition: 'Low',
    base: { kpiFit: 6, novelty: 8, reach: 6, feasibility: 7 },
  },

  // ── Experiential ─────────────────────────────────────────────────────────
  {
    name: 'Pop-up Store Activation',
    category: 'Experiential',
    description: 'Temporary branded spaces in high-footfall lifestyle destinations — Seongsu-dong, Hongdae, COEX, Starfield Hanam — for immersive product and service experiences.',
    why: 'Generates 3–10× earned media multiplier through organic social sharing. Lets customers try financial products in a low-pressure, lifestyle-first environment — especially effective with Gen Z and Millennials.',
    details: 'Well-executed activations draw 5,000–30,000 visitors over 2–4 weeks. Integration with app sign-up flows drives measurable acquisition within the experience itself. Seongsu-dong is the current premium location for brand activations among the 25–35 demographic.',
    risks: ['All-in cost (design, build, staff, rent) ranges ₩2억–₩8억 for a flagship activation', 'Outdoor formats are weather-dependent; indoor mall spaces carry premium rental rates', 'Staff quality is critical — poor on-site execution damages the brand more than no activation'],
    exampleUsage: "A 3-week 'Money Lab' pop-up in Seongsu-dong with interactive financial health stations, a branded café, and a digital savings goal wall — with on-site app account opening and a photo zone generating Instagram content.",
    trend: 'Rising',
    competition: 'Medium',
    base: { kpiFit: 8, novelty: 9, reach: 7, feasibility: 6 },
  },
  {
    name: 'Brand Café Collaboration',
    category: 'Experiential',
    description: 'Co-branded café activation inside a trendy independent café or existing chain (Beanbrothers, Fritz, Zapangi) for 4–8 weeks.',
    why: 'Café culture is the natural habitat of the target 25–38 demographic. Branded cups, coasters, and wi-fi landing pages create high-frequency repeat touchpoints in a premium context.',
    details: 'Co-branding agreements provide branded merchandise, in-store digital displays, and staff-delivered banking product information in a non-transactional environment. Average café customer visits 3× per week — frequency rivals subscription media.',
    risks: ['Café brand selection is critical — wrong café association undermines campaign positioning', 'Limited geographic reach per activation vs. broadcast formats', 'Quality control of branded merchandise and staff knowledge requires active management'],
    exampleUsage: 'A 6-week co-brand with Fritz Coffee (Mapo flagship) — branded cups, K Bank savings QR on receipts, and a limited-edition loyalty stamp card for new account holders.',
    trend: 'Rising',
    competition: 'Low',
    base: { kpiFit: 7, novelty: 8, reach: 6, feasibility: 7 },
  },
  {
    name: 'Office Lobby Brand Activation',
    category: 'Experiential',
    description: 'Staffed brand activation kiosk in the lobby of a premium office building — Parc.1, GFC, ASEM — targeting working professionals during peak commute hours.',
    why: "Reaches high-income office workers in a professional mindset at the moment they enter or exit their workplace — high receptivity to investment, savings, and premium card products.",
    details: 'Grade A office buildings in Yeouido, Gangnam, and the CBD host 50,000–150,000 workers daily. A staffed kiosk with product demonstrations and an incentivized sign-up offer can convert 1–3% of daily passers. Management approval and ROI tracking are relatively straightforward.',
    risks: ['Building management approval can be slow or restrictive depending on existing tenant agreements', 'Staff-intensive format requires trained financial product consultants', 'Activation limited to business hours only — excludes evening and weekend footfall'],
    exampleUsage: 'A 2-week staffed kiosk in Parc.1 Tower lobby (Yeouido) during morning rush hours (8–10am) offering instant IRP account opening with a ₩30,000 gift card incentive for qualifying income levels.',
    trend: 'Stable',
    competition: 'Low',
    base: { kpiFit: 8, novelty: 6, reach: 6, feasibility: 7 },
  },

  // ── Retail / Financial Touchpoint ─────────────────────────────────────────
  {
    name: 'ATM Screen Ads',
    category: 'Financial Touchpoint',
    description: 'Dynamic product and service ads on ATM idle screens across banking networks, convenience stores, and shopping malls.',
    why: 'Audience is in a financial mindset with undivided attention. Zero competing content during the transaction window. Bank-owned ATMs represent a zero-cost owned channel for CRM-personalized messaging.',
    details: 'Korea has ~90,000 ATMs across bank and third-party networks. Idle screen ads appear during 20–40 second transaction gaps. Personalized CRM messaging on owned ATMs — showing the logged-in customer their best eligible product upgrade — has 3–5× higher engagement vs. generic creative.',
    risks: ['ATM usage is in structural decline as mobile banking adoption accelerates', 'Display size limitations (800×600px typical) constrain creative sophistication', 'ATM downtime reduces effective inventory without prior notice'],
    exampleUsage: "Deploy personalized idle-screen creatives on all bank-owned ATMs: logged-in customers see their best eligible upgrade (e.g., 'You qualify for Gold Card — tap to apply') based on transaction history and real-time credit standing.",
    trend: 'Stable',
    competition: 'Low',
    base: { kpiFit: 9, novelty: 4, reach: 7, feasibility: 9 },
  },
  {
    name: 'Convenience Store Receipt Ads',
    category: 'Retail',
    description: 'Branded promotional messages on the reverse of customer receipts at CU, GS25, 7-Eleven, and Emart24 across 55,000+ locations.',
    why: 'Proximity marketing at the moment of transaction — consumers read receipts while in a spending mindset, well-suited for card benefit promotions and sign-up offers.',
    details: 'Unit costs are extremely low, making this format accessible for long-run campaigns. QR codes on receipts can track direct response and attribution to specific store segments. High coverage density in residential areas.',
    risks: ['Consumer attention to receipt backs is declining as digital (app) receipts grow', 'Print format limits creative to text and basic graphics only', "Association with a convenience store receipt may undermine premium brand positioning"],
    exampleUsage: 'A 12-week receipt campaign at CU and GS25 promoting a cashback credit card — QR code linking to an instant card application with a ₩3,000 sign-up reward for mobile payment setup.',
    trend: 'Declining',
    competition: 'Low',
    base: { kpiFit: 6, novelty: 3, reach: 7, feasibility: 9 },
  },
  {
    name: 'E-Mart Digital Shelf Screens',
    category: 'Retail',
    description: 'In-aisle digital screens at E-Mart hypermarkets displaying financial product ads in the electronics, travel, and premium grocery sections.',
    why: 'Reaches household decision-makers during a considered purchase occasion — high income, family-oriented shoppers who are primary targets for mortgage and savings products.',
    details: 'E-Mart operates 160+ hypermarkets nationwide. Digital shelf screens in premium product aisles attract shoppers who are spending ₩50,000–₩200,000 per visit — a proxy for higher household income. Financial product cross-sell in a retail context is still novel.',
    risks: ['Retail media network still maturing — measurement and targeting are less sophisticated than digital', 'Creative must compete with product packaging and in-store noise', 'Premium aisle placement limited to 2–3 screens per store'],
    exampleUsage: 'A monthly savings account offer displayed in the electronics and premium food aisles, with a QR code and a ₩20,000 sign-up bonus for new accounts opened in-store via app.',
    trend: 'Rising',
    competition: 'Low',
    base: { kpiFit: 7, novelty: 7, reach: 8, feasibility: 7 },
  },
  {
    name: 'Olive Young In-store Display',
    category: 'Retail',
    description: 'Digital display ads and counter cards in Olive Young beauty and health retail stores, one of the highest-footfall retail formats among Korean 20s–30s.',
    why: "Olive Young's core demographic (women 20–35) are a prime acquisition target for mobile banking, savings, and credit card products — currently underserved by traditional banking media.",
    details: 'Olive Young operates 1,300+ stores with 90M+ annual footfall heavily concentrated in 20–35 year-old women. In-store media options include digital screen ads, counter displays, and shopping bag inserts. The brand environment is premium, accessible, and lifestyle-aligned.',
    risks: ['Financial services product category may feel out of context in a beauty retail environment', 'Counter display clutter is high — requires standout creative to gain attention', 'Demographics skew female-heavy, which may not match all product targets'],
    exampleUsage: 'Counter display and digital screen campaign at Olive Young Hongdae and Sinchon stores promoting a women-focused savings product — featuring a QR code and a cosmetics loyalty point cross-benefit partnership.',
    trend: 'Rising',
    competition: 'Low',
    base: { kpiFit: 7, novelty: 8, reach: 7, feasibility: 7 },
  },
  {
    name: 'Vending Machine Wrap Ads',
    category: 'Retail',
    description: 'Full-body vinyl wrap advertising on beverage and coffee vending machines in office buildings, hospitals, schools, and transit hubs.',
    why: 'Vending machines in office buildings and hospitals attract daily repeat visits — providing consistent frequency exposure in controlled, dwell-time-rich micro-environments.',
    details: "Korea has over 1.3 million vending machines, with significant concentration in office buildings and transit locations. Vinyl wraps are low-cost and can include QR codes. CU and GS25's smart vending networks are adding digital screens, enabling motion creative.",
    risks: ['Reach per unit is low — requires large machine count for meaningful impressions', 'Vinyl quality and placement can be inconsistent across machine operators', 'Format is declining in prestige — may not reflect premium bank brand positioning'],
    exampleUsage: 'A 3-month vinyl wrap across 500 vending machines in Yeouido and Gangnam office buildings promoting an employee benefits banking package — QR code linking to a corporate HR partnership inquiry form.',
    trend: 'Stable',
    competition: 'Low',
    base: { kpiFit: 5, novelty: 6, reach: 6, feasibility: 9 },
  },

  // ── Sponsorship ───────────────────────────────────────────────────────────
  {
    name: 'Sports Stadium Perimeter Ads',
    category: 'Sponsorship',
    description: 'LED perimeter boards, kit sponsorship, and naming rights at KBO baseball, K-League football, or professional esports venues.',
    why: 'Live broadcast multiplies reach beyond stadium attendance. KBO viewership skews 30–55 male — strong overlap with loan, investment, and credit card products.',
    details: 'KBO draws 8–10M stadium attendances annually with 10M+ TV viewers. LED perimeter boards appear in every broadcast frame, generating 600–900 GRP equivalents per season. Broadcast clip amplification through Naver Sports and YouTube highlight reels extends reach further.',
    risks: ['Season-long commitments (6+ months) with limited mid-contract exit options', 'Brand visibility depends on team screen time and broadcast production choices', 'Player or team controversies can generate negative brand association'],
    exampleUsage: 'Front-of-jersey sponsorship for an LCK esports team for the Spring Split, with LED placement at the LoL Park arena — targeting the 18–28 male gamer demographic for a digital-first bank account.',
    trend: 'Stable',
    competition: 'High',
    base: { kpiFit: 7, novelty: 4, reach: 8, feasibility: 7 },
  },
  {
    name: 'LCK Esports Scoreboard Overlay',
    category: 'Sponsorship',
    description: 'Branded scoreboard overlay and pre-game sponsor slot on the League of Legends Champions Korea (LCK) broadcast, reaching Korea\'s largest esports audience.',
    why: 'LCK is the world\'s most-watched regional esports league. Scoreboard overlays appear in every broadcast frame throughout the match — delivering sustained brand presence to a digitally native 18–28 demographic.',
    details: "LCK Spring and Summer Splits each run for 10+ weeks with 5–8M average weekly viewers across official streams and VOD. Scoreboard logo placement appears for 60+ minutes per match. Riot Games enforces strict brand safety standards, ensuring premium placement context.",
    risks: ['Audience skews heavily male (85%+) — unsuitable for broad demographic campaigns', 'Esports viewership counts are harder to verify than broadcast TV GRP', 'Brand association tied to team/player performance and controversy risk'],
    exampleUsage: 'Scoreboard overlay sponsorship for a full LCK Split (10 weeks) featuring a digital youth banking account — with in-stream QR code activations and a limited esports-themed debit card design for new sign-ups.',
    trend: 'Rising',
    competition: 'Medium',
    base: { kpiFit: 5, novelty: 9, reach: 7, feasibility: 6 },
  },
  {
    name: 'Seoul Marathon Title Sponsorship',
    category: 'Sponsorship',
    description: "Title or presenting sponsorship of the Seoul International Marathon (DongA Marathon) — Korea's largest annual road race with 35,000+ participants and mass media coverage.",
    why: 'Marathon sponsorship reaches a health-conscious, financially stable 30–50 demographic through participant engagement, mass media, and sustained pre-event brand building over 3–4 months.',
    details: 'The Seoul Marathon draws 35,000 runners and 200,000+ spectators. Presenting sponsors receive title naming rights, race bibs, finish-line branding, and broadcast logo placement across KBS, Naver Sports, and YouTube. Pre-race activations across major Han River parks extend reach over the training season.',
    risks: ['Weather-dependent event — poor race day conditions affect spectator reach', 'Title sponsorship cost is significant (est. ₩5억–₩20억 annually)', 'Competitor brands in banking may dominate adjacent race categories'],
    exampleUsage: "Presenting sponsor title for 2 years — branded 'K Bank Seoul Marathon' — with a runner-exclusive savings product featuring a 0.5% bonus rate for participants who link their race registration to a bank account.",
    trend: 'Stable',
    competition: 'Medium',
    base: { kpiFit: 7, novelty: 6, reach: 7, feasibility: 6 },
  },

  // ── Digital / Platform ────────────────────────────────────────────────────
  {
    name: 'Naver Finance Native Content',
    category: 'Digital',
    description: 'Native sponsored articles and product placements in Naver\'s finance section and Money&Interest tab, reaching high-intent financial research audiences.',
    why: "Naver Finance is Korea's #1 financial information destination. Users in this context are actively researching products — demonstrating the highest purchase intent of any digital touchpoint.",
    details: 'Naver Finance attracts 15M+ monthly unique visitors. Native content placements blend editorial and sponsored content in the same feed, achieving 3–5× higher engagement rates than standard display ads. Integration with Naver Pay enables direct conversion.',
    risks: ['Editorial independence rules require disclosure — "sponsored" labels reduce some click rates', 'Naver algorithm changes can reduce content reach without notice', 'Content quality requirements are high — low-quality articles harm brand perception'],
    exampleUsage: 'A 12-week native content series "Smart Money Habits" in the Naver Money tab — branded articles on savings strategies, each with a CTA linking to the bank\'s product comparison tool.',
    trend: 'Rising',
    competition: 'High',
    base: { kpiFit: 9, novelty: 5, reach: 9, feasibility: 7 },
  },
  {
    name: 'KakaoTalk Channel Plus',
    category: 'Digital',
    description: 'Branded KakaoTalk business channel with sponsored message delivery and push notifications to subscribers across Korea\'s dominant messaging platform.',
    why: "KakaoTalk has 47M active users in Korea — near-total market penetration. Channel Plus offers sponsored reach to subscribers and lookalike audiences with native message format and Kakao Pay integration.",
    details: 'Channel Plus messages appear in the same interface as personal messages, achieving open rates of 40–70% vs. 20% for email. Kakao Pay linkage enables seamless product application flow from notification to completion in under 3 minutes.',
    risks: ['Subscriber growth requires organic opt-in — paid reach is limited without an existing base', 'Message frequency must be carefully managed to avoid block/unsubscribe', 'Kakao algorithm prioritizes personal messages; channel messages can be deprioritized'],
    exampleUsage: 'A targeted Channel Plus message to subscribers aged 28–45 in Gangnam and Mapo offering a limited-time savings rate of 5.2% APY — with a one-tap Kakao Pay-linked account opening flow.',
    trend: 'Stable',
    competition: 'High',
    base: { kpiFit: 8, novelty: 5, reach: 10, feasibility: 7 },
  },
  {
    name: 'Coupang Rocket Finance Display',
    category: 'Digital',
    description: 'Display and native ad placements in the Coupang shopping app, targeting 20M+ daily active users at the point of financial consideration.',
    why: 'Coupang users are active card and payment product users. The platform\'s rich purchase data enables precise targeting of high-spend, credit-card-eligible users at the moment of a transaction decision.',
    details: "Coupang's retail media network (CoupangAds) offers first-party data targeting based on purchase history, frequency, and category behavior. Financial product placements in the checkout flow and post-purchase confirmation screens have high contextual relevance.",
    risks: ['Financial product advertising in a shopping context may generate low purchase intent', "Coupang's retail media network pricing is not yet competitive vs. established digital platforms", 'Ad visibility competes with product listings in a high-density visual environment'],
    exampleUsage: 'A Coupang Ads campaign targeting users who have made 3+ electronics purchases in the past month — featuring a branded card with 3% cashback on electronics, displayed at the post-purchase confirmation screen.',
    trend: 'Rising',
    competition: 'Medium',
    base: { kpiFit: 7, novelty: 7, reach: 9, feasibility: 6 },
  },
  {
    name: 'CarrotMarket (당근마켓) Local Ads',
    category: 'Digital',
    description: 'Hyper-local display ads in the CarrotMarket second-hand marketplace app, targeted by neighborhood and user transaction behavior.',
    why: "CarrotMarket's 22M MAU are engaged in community commerce — financial trust and local proximity are central to the user mindset, making it uniquely receptive to local banking offers.",
    details: 'CarrotMarket allows geo-targeting at the dong (neighborhood) level, enabling branch-proximity campaigns with extreme geographic precision. Users are active sellers and buyers in a community trust context — a strong fit for savings account and credit product messaging.',
    risks: ['User income skews below-average vs. other platforms — LTV per customer may be lower', 'Ad creative must feel hyper-local to avoid rejection from the community-first audience', 'Format is new — benchmark ROI data for financial products is limited'],
    exampleUsage: 'A hyper-local campaign targeting users within 1km of each K Bank branch, offering a ₩10,000 neighborhood commerce bonus for new account holders who make their first Coupang or CarrotMarket payment with a K Bank card.',
    trend: 'Rising',
    competition: 'Low',
    base: { kpiFit: 7, novelty: 8, reach: 8, feasibility: 7 },
  },
  {
    name: 'Smart TV Home Screen Ads',
    category: 'Digital',
    description: 'Branded placements on the home screen of Samsung and LG smart TVs during the 20–30 second app launch loading period.',
    why: "Smart TV home screens reach households in a relaxed, high-attention viewing environment. Samsung's First Screen ad reaches 12M+ Korean smart TV households with zero competing creative during the boot/launch window.",
    details: "Samsung Ads Korea and LG Ad Solutions offer programmatic home screen and pre-roll inventory across their OTT-connected TV networks. Audience segmentation by household income tier (inferred from content consumption patterns) and time-of-day is available.",
    risks: ['Audience measurement is device-level, not person-level — household targeting is imprecise', 'Creative must be self-explanatory in under 5 seconds before users reach content', 'Smart TV platform fees and data licensing can make CPM higher than mobile'],
    exampleUsage: 'A Samsung First Screen placement during prime-time weekday evenings (8–11pm) targeting households in Gangnam-gu and Seocho-gu with a wealth management product — 6-second animated brand spot with a QR on the final frame.',
    trend: 'Rising',
    competition: 'Medium',
    base: { kpiFit: 7, novelty: 7, reach: 8, feasibility: 7 },
  },
  {
    name: 'Kakao Webtoon Brand Integration',
    category: 'Digital',
    description: 'Branded content integration inside top-performing Kakao Webtoon series — product placement panels, sponsored episodes, and interstitial financial tip content.',
    why: 'Kakao Webtoon reaches 8M+ daily readers in deeply engaged, long-session reading contexts. Financial literacy content blends naturally into slice-of-life and romance genres popular with 20–35 year-olds.',
    details: 'Webtoon readers average 25+ minutes per session. Branded episodes and product placement panels can be negotiated directly with popular creator studios. Webtoon-native financial literacy content ("How the main character manages her savings") performs significantly better than standard display ads.',
    risks: ['Creative production requires collaboration with original creator — quality control is limited', 'Brand placement must feel organic to the story — forced integrations receive negative reader backlash', 'Top-series placements carry long waitlists — 3–6 month lead time required'],
    exampleUsage: 'A 6-episode sponsored financial wellness mini-series on a top-5 Kakao Webtoon, following a character through savings goals and first investment — with in-strip QR codes linking to a youth savings account.',
    trend: 'Rising',
    competition: 'Low',
    base: { kpiFit: 6, novelty: 9, reach: 8, feasibility: 6 },
  },
  {
    name: 'Melon Music App Pre-roll',
    category: 'Digital',
    description: 'Audio and video pre-roll ads before music streams on Melon, Korea\'s largest music streaming platform with 28M registered users.',
    why: 'Free-tier Melon users (70% of base) are served non-skippable 15–30 second audio ads. High reach among 20–35 year-olds who are the primary target for digital banking products.',
    details: "Melon's free tier delivers non-skippable audio and interstitial video ads. Audience data includes music genre preferences and listening time-of-day, enabling mood-based contextual targeting (e.g., Monday morning → motivational savings message). CPM is significantly lower than video platforms.",
    risks: ['Audio-only format limits brand story complexity and visual identity communication', 'Ad-supported listening is declining as premium subscriptions grow', 'High ad frequency on free tier can generate negative brand associations if overused'],
    exampleUsage: 'A Monday morning audio spot on Melon targeting commuters aged 22–35 — a 20-second motivational savings message ending with a voice CTA and a push notification for a savings account interest bonus.',
    trend: 'Stable',
    competition: 'Medium',
    base: { kpiFit: 6, novelty: 6, reach: 8, feasibility: 8 },
  },

  // ── Emerging ─────────────────────────────────────────────────────────────
  {
    name: 'Weather App Contextual Ads',
    category: 'Emerging',
    description: 'Contextual banner and interstitial ads in Korea\'s top weather apps (KMA, Weather.com Korea, AccuWeather) triggered by specific weather conditions.',
    why: 'Weather apps have 90%+ daily open rates in Korea. Contextual triggers (rainy day → home insurance, cold snap → heating cost loan) create genuine relevance impossible in other formats.',
    details: 'Korea\'s official weather app (KMA) has 30M+ downloads. Condition-based triggering enables creative rules: rain → "protect what matters" (insurance/savings), heat → "plan your finances for summer" (travel loan). CPM is low due to still-emerging ad ecosystem.',
    risks: ['Creative management requires maintaining multiple conditional ad sets', 'Weather app monetization is still maturing — inventory quality and standards vary', 'Frequency capping is critical — daily-use apps risk overexposure'],
    exampleUsage: 'A triggered campaign: when temp drops below 5°C, show a "Warm Up Your Savings" heating cost loan offer; when rain is forecast, show a "Be Prepared" emergency fund savings account ad — both with one-tap app sign-up.',
    trend: 'Rising',
    competition: 'Low',
    base: { kpiFit: 6, novelty: 9, reach: 8, feasibility: 7 },
  },
  {
    name: 'Electric Scooter (Kickgoing) Branding',
    category: 'Emerging',
    description: 'Branded decals, helmet wraps, and app splash screens on Kickgoing and Deer electric scooter rental platforms operating in Korean cities.',
    why: 'Electric scooter riders are urban 20–35 year-olds — a core digital banking acquisition demographic. Brand touchpoints span the rental app, helmet, and scooter body across high-footfall city areas.',
    details: "Korea's micro-mobility market (Kickgoing, Deer, Lime Korea) serves 5M+ ride sessions per month. App branding (splash screens, QR codes on scooter dashboards) reaches users in a mobile-first, outdoor context. The format's novelty drives higher memorability than conventional OOH.",
    risks: ['Micro-mobility regulatory environment is still evolving — market instability risk', 'Brand association with unsafe riding behavior could generate negative PR', 'Reach per city is concentrated — limited national scale without major fleet expansion'],
    exampleUsage: 'A 3-month Kickgoing app sponsorship in Hongdae, Seongsu, and Gangnam — branded splash screen offering ₩5,000 free ride credit for new K Bank account openings, tracked by unique referral code.',
    trend: 'Rising',
    competition: 'Low',
    base: { kpiFit: 5, novelty: 9, reach: 6, feasibility: 7 },
  },
  {
    name: 'Naver Map Nearby Branch Spotlight',
    category: 'Digital',
    description: 'Paid "Spotlight" placement on Naver Map search results when users search for banks, ATMs, or financial services near their current location.',
    why: 'Users searching "은행 near me" on Naver Map have the highest branch-visit intent of any digital format. Spotlight placement ensures the bank appears first in proximity search results.',
    details: "Naver Map handles 50M+ monthly search sessions. Local business spotlight placements appear above organic results with enhanced visuals, current wait times, and product promotions. Integration with Naver Pay allows immediate account interest pre-approval from the map listing.",
    risks: ['Competition for financial category spots is high — CPCs can be expensive', 'Effectiveness is dependent on branch network density — limited branches in a region reduce ROI', 'Algorithm changes to Naver Map local ranking can affect placement without notice'],
    exampleUsage: 'A branch spotlight campaign running every weekday 8am–7pm — appearing first in results for users searching "은행", "ATM", or "대출" within 500m of any K Bank branch, featuring current promotional savings rate.',
    trend: 'Rising',
    competition: 'Medium',
    base: { kpiFit: 8, novelty: 7, reach: 8, feasibility: 8 },
  },
];

// ── Weekly theme pool ─────────────────────────────────────────────────────────
const WEEKLY_THEMES_WITH_WEIGHTS = [
  {
    theme: 'Gen Z Acquisition Focus',
    commentary: "This week's selection prioritizes high-novelty, digital-native channels with strong under-28 audience reach, reflecting a Q2 goal to grow the youth banking segment through experiential and contextual formats.",
    preferHigh: ['novelty', 'reach'],
  },
  {
    theme: 'High-Net-Worth Targeting',
    commentary: "Channels this week skew toward premium environments — airports, cinemas, and luxury retail — optimized for wealth management and private banking product exposure to the 35–55 HNW demographic.",
    preferHigh: ['kpiFit', 'feasibility'],
  },
  {
    theme: 'Mass Awareness Push',
    commentary: "Focus is on high-reach transit and OOH formats, maximizing impression volume for a broad brand awareness objective ahead of a seasonal product campaign launch.",
    preferHigh: ['reach'],
  },
  {
    theme: 'Experiential & Brand Love',
    commentary: "The selection leans into experiential and partnership channels that create direct audience interaction — ideal for brand perception campaigns targeting Millennials who prefer authentic, lifestyle-first storytelling.",
    preferHigh: ['novelty'],
  },
  {
    theme: 'Cost Efficiency Sprint',
    commentary: "Channels selected this week optimize feasibility and cost-efficiency, suitable for a lean media budget while maintaining category presence through high-ROI owned and low-competition formats.",
    preferHigh: ['feasibility', 'kpiFit'],
  },
  {
    theme: 'Digital-Physical Convergence',
    commentary: "The mix blends programmatic OOH with physical touchpoints to create connected cross-channel journeys — from awareness (billboard) through consideration (ATM) to conversion (app-triggered offer).",
    preferHigh: ['kpiFit', 'reach'],
  },
];

// ── Generator ─────────────────────────────────────────────────────────────────
function generate() {
  const today    = new Date();
  const dateStr  = today.toISOString().slice(0, 10);
  const weekThemeDef = WEEKLY_THEMES_WITH_WEIGHTS[Math.floor(Math.random() * WEEKLY_THEMES_WITH_WEIGHTS.length)];
  const count    = Math.floor(Math.random() * 6) + 10; // 10–15

  // Shuffle pool and take `count` items; weight toward theme preference
  const scored = POOL.map(item => {
    const themeBoost = weekThemeDef.preferHigh.reduce((sum, dim) => sum + item.base[dim], 0);
    const shuffleSeed = Math.random() + themeBoost * 0.03;
    return { item, shuffleSeed };
  });
  scored.sort((a, b) => b.shuffleSeed - a.shuffleSeed);
  const selected = scored.slice(0, count).map(s => s.item);

  // Build output opportunities with jittered scores
  const opportunities = selected
    .map(item => {
      const kpiFit      = jitter(item.base.kpiFit);
      const novelty     = jitter(item.base.novelty);
      const reach       = jitter(item.base.reach);
      const feasibility = jitter(item.base.feasibility);
      const score       = computeScore({ kpiFit, novelty, reach, feasibility });

      return {
        name:         item.name,
        category:     item.category,
        description:  item.description,
        why:          item.why,
        kpiFit,
        novelty,
        reach,
        feasibility,
        score,
        trend:        item.trend,
        competition:  item.competition,
        details:      item.details,
        risks:        item.risks,
        exampleUsage: item.exampleUsage,
      };
    })
    .sort((a, b) => b.score - a.score);  // ranked highest first

  const output = {
    generatedAt:  today.toISOString(),
    weekLabel:    `Week of ${today.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`,
    weekTheme:    weekThemeDef.theme,
    aiCommentary: weekThemeDef.commentary,
    scoreWeights: WEIGHTS,
    count:        opportunities.length,
    opportunities,
  };

  return { output, dateStr };
}

// ── Write files ───────────────────────────────────────────────────────────────
function main() {
  const weeksDir = path.join(__dirname, 'data', 'weeks');
  fs.mkdirSync(weeksDir, { recursive: true });

  const { output, dateStr } = generate();

  const datedPath  = path.join(weeksDir, `${dateStr}.json`);
  const latestPath = path.join(weeksDir, 'latest.json');
  const json       = JSON.stringify(output, null, 2);

  fs.writeFileSync(datedPath,  json, 'utf8');
  fs.writeFileSync(latestPath, json, 'utf8');

  console.log(`\n✓ Generated ${output.count} opportunities`);
  console.log(`  Theme      : ${output.weekTheme}`);
  console.log(`  Dated file : data/weeks/${dateStr}.json`);
  console.log(`  Latest     : data/weeks/latest.json`);
  console.log(`\n  Top 3 by score:`);
  output.opportunities.slice(0, 3).forEach((o, i) => {
    console.log(`    ${i + 1}. ${o.name.padEnd(35)} ${o.score.toFixed(1)}`);
  });
  console.log();
}

main();
