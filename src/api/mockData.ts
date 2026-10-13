import type {
  WeatherResponse,
  RiskResponse,
  GuidanceResponse,
  NotificationsResponse,
  ResourcesResponse,
  CitiesRiskResponse,
  MethodologyResponse,
  LocationsResponse,
  HealthResponse,
  Lang,
  ResourceType,
} from '@/types/api';

const now = new Date('2026-06-12T06:00:00+05:00');

function isoHoursFrom(base: Date, offsetHours: number): string {
  const d = new Date(base.getTime() + offsetHours * 3600000);
  return d.toISOString().replace('Z', '+05:00');
}

function dateFrom(base: Date, offsetDays: number): string {
  const d = new Date(base.getTime() + offsetDays * 86400000);
  return d.toISOString().slice(0, 10);
}

// ---------- Locations ----------

export const mockLocations: LocationsResponse = {
  items: [
    { id: 'khairpur', name: 'Khairpur Mirs', province: 'Sindh', lat: 27.5295, lon: 68.7592, default: true },
    { id: 'karachi', name: 'Karachi', province: 'Sindh', lat: 24.8607, lon: 67.0011 },
    { id: 'lahore', name: 'Lahore', province: 'Punjab', lat: 31.5204, lon: 74.3587 },
    { id: 'islamabad', name: 'Islamabad', province: 'Islamabad', lat: 33.6844, lon: 73.0479 },
    { id: 'multan', name: 'Multan', province: 'Punjab', lat: 30.1575, lon: 71.5249 },
    { id: 'quetta', name: 'Quetta', province: 'Balochistan', lat: 30.1798, lon: 66.9750 },
    { id: 'peshawar', name: 'Peshawar', province: 'KPK', lat: 34.0151, lon: 71.5249 },
    { id: 'sukkur', name: 'Sukkur', province: 'Sindh', lat: 27.7052, lon: 68.8465 },
    { id: 'hyderabad', name: 'Hyderabad', province: 'Sindh', lat: 25.3964, lon: 68.3775 },
  ],
};

// ---------- Weather ----------

function buildWeather(extreme: boolean): WeatherResponse {
  const baseTemp = extreme ? 45 : 39;
  const baseFeels = extreme ? 52 : 43;
  const baseHumidity = extreme ? 55 : 35;
  const baseUV = extreme ? 11 : 8;

  const hourly = Array.from({ length: 48 }, (_, i) => {
    const hourOfDay = (6 + i) % 24;
    const dayFactor = Math.sin(((hourOfDay - 6) / 12) * Math.PI);
    const tempBonus = extreme ? 4 : 2;
    return {
      time: isoHoursFrom(now, i),
      temp_c: Math.round((baseTemp + dayFactor * tempBonus) * 10) / 10,
      feels_like_c: Math.round((baseFeels + dayFactor * (tempBonus + 2)) * 10) / 10,
      humidity: Math.round(baseHumidity - dayFactor * 10 + (i % 3)),
      uv_index: Math.round(Math.max(0, dayFactor * baseUV) * 10) / 10,
    };
  });

  const daily = Array.from({ length: 7 }, (_, i) => ({
    date: dateFrom(now, i),
    temp_max_c: extreme ? 47 + (i % 3) : 41 + (i % 3),
    temp_min_c: extreme ? 32 : 28,
    uv_index_max: extreme ? 11 : 9,
    sunrise: isoHoursFrom(new Date(now.toISOString().slice(0, 10) + 'T05:30:00+05:00'), i * 24),
    sunset: isoHoursFrom(new Date(now.toISOString().slice(0, 10) + 'T19:15:00+05:00'), i * 24),
  }));

  return {
    location: { name: 'Khairpur Mirs', lat: 27.5295, lon: 68.7592, timezone: 'Asia/Karachi' },
    generated_at: now.toISOString().replace('Z', '+05:00'),
    current: {
      time: now.toISOString().replace('Z', '+05:00'),
      temp_c: extreme ? 44.8 : 38.5,
      feels_like_c: extreme ? 51.2 : 42.1,
      humidity: extreme ? 52 : 34,
      wind_kph: extreme ? 8 : 14,
      uv_index: extreme ? 10.5 : 7.2,
      condition: extreme ? 'Clear' : 'Partly cloudy',
      weather_code: extreme ? 0 : 2,
    },
    hourly,
    daily,
  };
}

// ---------- Risk ----------

function buildRisk(extreme: boolean, lang: Lang): RiskResponse {
  const hourly = Array.from({ length: 48 }, (_, i) => {
    const hourOfDay = (6 + i) % 24;
    const dayFactor = Math.sin(((hourOfDay - 6) / 12) * Math.PI);
    const hi = extreme ? 52 + dayFactor * 8 : 43 + dayFactor * 5;
    let level: 'low' | 'moderate' | 'high' | 'extreme' = 'low';
    if (hi >= 54) level = 'extreme';
    else if (hi >= 41) level = 'high';
    else if (hi >= 32) level = 'moderate';
    return {
      time: isoHoursFrom(now, i),
      heat_index_c: Math.round(hi * 10) / 10,
      risk_level: level,
    };
  });

  const elevated_periods = extreme
    ? [
        {
          start: isoHoursFrom(now, 5),
          end: isoHoursFrom(now, 14),
          peak_heat_index_c: 59.5,
          risk_level: 'extreme' as const,
        },
        {
          start: isoHoursFrom(now, 28),
          end: isoHoursFrom(now, 34),
          peak_heat_index_c: 55.2,
          risk_level: 'extreme' as const,
        },
      ]
    : [
        {
          start: isoHoursFrom(now, 6),
          end: isoHoursFrom(now, 11),
          peak_heat_index_c: 47.3,
          risk_level: 'high' as const,
        },
      ];

  const labels: Record<string, Record<Lang, string>> = {
    low: { en: 'Low', ur: 'کم', sd: 'گھٽ' },
    moderate: { en: 'Moderate', ur: 'درمیانہ', sd: 'وچولا' },
    high: { en: 'High', ur: 'زیادہ', sd: 'وڌيڪ' },
    extreme: { en: 'Extreme', ur: 'انتہائی', sd: 'تمام' },
  };

  const currentLevel = extreme ? 'extreme' : 'high';
  const driversEn = extreme
    ? ['Very high temperature', 'High humidity', 'Strong UV', 'Low wind']
    : ['High temperature', 'Strong UV'];

  return {
    location: { name: 'Khairpur Mirs', lat: 27.5295, lon: 68.7592 },
    generated_at: now.toISOString().replace('Z', '+05:00'),
    current: {
      heat_index_c: extreme ? 51.2 : 42.1,
      risk_level: currentLevel,
      label: labels[currentLevel][lang],
      drivers: driversEn,
    },
    hourly,
    elevated_periods,
  };
}

// ---------- Guidance ----------

function buildGuidance(extreme: boolean, lang: Lang): GuidanceResponse {
  const level = extreme ? 'extreme' : 'high';
  const t = guidanceTranslations[lang];
  const items = (extreme ? t.extreme : t.high) as {
    id: string;
    audience: 'everyone' | 'outdoor_workers' | 'older_adults' | 'children';
    icon: 'water' | 'shade' | 'clock' | 'clothing' | 'sun' | 'alert';
    title: string;
    body: string;
  }[];
  return {
    risk_level: level,
    lang,
    items,
    disclaimer: t.disclaimer,
  };
}

// ---------- Notifications ----------

function buildNotifications(extreme: boolean, lang: Lang): NotificationsResponse {
  const t = notifTranslations[lang];
  const items = [
    {
      id: 'daily-2026-06-12-khairpur',
      type: 'daily' as const,
      severity: 'info' as const,
      title: t.dailyTitle,
      body: t.dailyBody,
      created_at: isoHoursFrom(now, -2),
    },
  ];

  const active_alert = extreme
    ? {
        id: 'alert-extreme-2026-06-12-khairpur',
        type: 'alert' as const,
        severity: 'danger' as const,
        title: t.alertTitle,
        body: t.alertBody,
        created_at: now.toISOString().replace('Z', '+05:00'),
        window: { start: isoHoursFrom(now, 5), end: isoHoursFrom(now, 14) },
        actions: t.alertActions,
      }
    : null;

  return { items, active_alert };
}

// ---------- Resources ----------

function buildResources(): ResourceItem[] {
  return [
    { id: 'r1', name: 'Civil Hospital Cooling Center', type: 'cooling_center', lat: 27.531, lon: 68.758, address: 'Hospital Road', city: 'Khairpur Mirs', province: 'Sindh', hours: '24/7', contact: '0243-555123', notes: 'AC hall with water', verified: true, distance_km: 0.3 },
    { id: 'r2', name: 'Public Water Point - Market', type: 'water_point', lat: 27.527, lon: 68.762, address: 'Main Bazaar', city: 'Khairpur Mirs', province: 'Sindh', hours: '7:00-20:00', contact: 'N/A', notes: 'Filtered drinking water', verified: true, distance_km: 0.5 },
    { id: 'r3', name: 'Community Hall Assistance', type: 'assistance', lat: 27.534, lon: 68.755, address: 'College Road', city: 'Khairpur Mirs', province: 'Sindh', hours: '8:00-18:00', contact: '0243-555456', notes: 'Elderly support available', verified: false, distance_km: 0.8 },
    { id: 'r4', name: 'Jinnah Stadium Cooling Center', type: 'cooling_center', lat: 24.861, lon: 67.001, address: 'M.A. Jinnah Road', city: 'Karachi', province: 'Sindh', hours: '9:00-21:00', contact: '021-555789', notes: 'Large capacity', verified: true },
    { id: 'r5', name: 'Karachi Water Point - Clifton', type: 'water_point', lat: 24.815, lon: 67.026, address: 'Clifton Beach', city: 'Karachi', province: 'Sindh', hours: '6:00-22:00', contact: 'N/A', notes: 'Public taps', verified: false },
    { id: 'r6', name: 'Edhi Foundation Assistance', type: 'assistance', lat: 24.858, lon: 67.005, address: 'Mitter Road', city: 'Karachi', province: 'Sindh', hours: '24/7', contact: '021-555111', notes: 'Heatstroke response team', verified: true },
    { id: 'r7', name: 'Lahore Cooling Center - Town Hall', type: 'cooling_center', lat: 31.520, lon: 74.359, address: 'Town Hall, Mall Road', city: 'Lahore', province: 'Punjab', hours: '8:00-20:00', contact: '042-555222', notes: 'Misting fans', verified: true },
    { id: 'r8', name: 'Lahore Water Point - Data Darbar', type: 'water_point', lat: 31.565, lon: 74.341, address: 'Data Darbar', city: 'Lahore', province: 'Punjab', hours: '24/7', contact: 'N/A', notes: 'Chilled water', verified: true },
    { id: 'r9', name: 'Islamabad Cooling Center - F-9 Park', type: 'cooling_center', lat: 33.694, lon: 73.050, address: 'Fatima Jinnah Park', city: 'Islamabad', province: 'Islamabad', hours: '7:00-19:00', contact: '051-555333', notes: 'Shaded tents', verified: true },
    { id: 'r10', name: 'Multan Cooling Center - Nishtar Hospital', type: 'cooling_center', lat: 30.159, lon: 71.525, address: 'Nishtar Road', city: 'Multan', province: 'Punjab', hours: '24/7', contact: '061-555444', notes: 'Heatstroke ward', verified: true },
    { id: 'r11', name: 'Quetta Water Point - Liaqat Bazaar', type: 'water_point', lat: 30.181, lon: 67.010, address: 'Liaqat Bazaar', city: 'Quetta', province: 'Balochistan', hours: '7:00-19:00', contact: 'N/A', notes: 'Public water', verified: false },
    { id: 'r12', name: 'Peshawar Assistance - LRH', type: 'assistance', lat: 34.017, lon: 71.530, address: 'Lady Reading Hospital', city: 'Peshawar', province: 'KPK', hours: '24/7', contact: '091-555555', notes: 'Emergency heat support', verified: true },
    { id: 'r13', name: 'Sukkur Cooling Center - Stadium', type: 'cooling_center', lat: 27.706, lon: 68.847, address: 'Stadium Road', city: 'Sukkur', province: 'Sindh', hours: '8:00-20:00', contact: '071-555666', notes: 'AC hall', verified: false },
    { id: 'r14', name: 'Hyderabad Water Point - Market', type: 'water_point', lat: 25.396, lon: 68.378, address: 'Resham Gali', city: 'Hyderabad', province: 'Sindh', hours: '6:00-21:00', contact: 'N/A', notes: 'Cold water', verified: true },
  ];
}

// ---------- City Risk ----------

function buildCityRisk(): CitiesRiskResponse {
  return {
    items: [
      { id: 'khairpur', name: 'Khairpur Mirs', lat: 27.5295, lon: 68.7592, risk_level: 'high', heat_index_c: 43.2 },
      { id: 'karachi', name: 'Karachi', lat: 24.8607, lon: 67.0011, risk_level: 'moderate', heat_index_c: 38.5 },
      { id: 'lahore', name: 'Lahore', lat: 31.5204, lon: 74.3587, risk_level: 'moderate', heat_index_c: 36.8 },
      { id: 'islamabad', name: 'Islamabad', lat: 33.6844, lon: 73.0479, risk_level: 'low', heat_index_c: 29.4 },
      { id: 'multan', name: 'Multan', lat: 30.1575, lon: 71.5249, risk_level: 'high', heat_index_c: 44.1 },
      { id: 'quetta', name: 'Quetta', lat: 30.1798, lon: 66.975, risk_level: 'low', heat_index_c: 27.2 },
      { id: 'peshawar', name: 'Peshawar', lat: 34.0151, lon: 71.5249, risk_level: 'moderate', heat_index_c: 35.6 },
      { id: 'sukkur', name: 'Sukkur', lat: 27.7052, lon: 68.8465, risk_level: 'high', heat_index_c: 42.8 },
      { id: 'hyderabad', name: 'Hyderabad', lat: 25.3964, lon: 68.3775, risk_level: 'moderate', heat_index_c: 37.3 },
    ],
  };
}

// ---------- Methodology ----------

function buildMethodology(lang: Lang): MethodologyResponse {
  const t = methodologyTranslations[lang];
  return {
    title: t.title,
    summary: t.summary,
    formula: t.formula,
    thresholds: [
      { level: 'low', range: '< 32°C' },
      { level: 'moderate', range: '32–40°C' },
      { level: 'high', range: '41–54°C' },
      { level: 'extreme', range: '> 54°C' },
    ],
    sources: [
      { name: 'Pakistan Meteorological Department', url: 'https://www.pmd.gov.pk' },
      { name: 'National Disaster Management Authority', url: 'https://ndma.gov.pk' },
      { name: 'WHO Heat and Health', url: 'https://www.who.int/health-topics/heat' },
    ],
    disclaimer: t.disclaimer,
  };
}

// ---------- Translation content for mock data ----------

interface GuidanceT {
  disclaimer: string;
  high: { id: string; audience: 'everyone' | 'outdoor_workers' | 'older_adults' | 'children'; icon: 'water' | 'shade' | 'clock' | 'clothing' | 'sun' | 'alert'; title: string; body: string }[];
  extreme: { id: string; audience: 'everyone' | 'outdoor_workers' | 'older_adults' | 'children'; icon: 'water' | 'shade' | 'clock' | 'clothing' | 'sun' | 'alert'; title: string; body: string }[];
}

const guidanceTranslations: Record<Lang, GuidanceT> = {
  en: {
    disclaimer: 'Saaya is a community tool and not a substitute for official warnings or professional medical advice.',
    high: [
      { id: 'hydrate', audience: 'everyone', icon: 'water', title: 'Hydrate frequently', body: 'Drink water every 20 minutes, even if you do not feel thirsty. Avoid sugary and caffeinated drinks.' },
      { id: 'shade-breaks', audience: 'outdoor_workers', icon: 'shade', title: 'Take shade breaks', body: 'Rest in shade for 15 minutes every hour. Schedule heavy tasks before 11 AM or after 4 PM.' },
      { id: 'check-on-elders', audience: 'older_adults', icon: 'alert', title: 'Check on neighbors', body: 'Elderly neighbors may not feel thirsty. Call or visit them twice during the day.' },
      { id: 'indoor-play', audience: 'children', icon: 'sun', title: 'Keep children indoors', body: 'Keep children indoors between 11 AM and 4 PM. Ensure they drink water regularly.' },
      { id: 'loose-clothing', audience: 'everyone', icon: 'clothing', title: 'Wear loose clothing', body: 'Wear light-colored, loose cotton clothing and a wide-brimmed hat outdoors.' },
    ],
    extreme: [
      { id: 'hydrate', audience: 'everyone', icon: 'water', title: 'Hydrate immediately', body: 'Drink water every 15 minutes. This is extreme heat — dehydration can happen fast.' },
      { id: 'stay-indoors', audience: 'everyone', icon: 'shade', title: 'Stay indoors', body: 'Do not go outside between 11 AM and 5 PM. Keep windows and curtains closed during the day.' },
      { id: 'stop-outdoor-work', audience: 'outdoor_workers', icon: 'clock', title: 'Stop outdoor work', body: 'All outdoor physical work should pause during extreme heat. Resume only after 5 PM with water breaks.' },
      { id: 'cool-elders', audience: 'older_adults', icon: 'alert', title: 'Move elders to cooling', body: 'Take elderly family members to the nearest cooling center. Watch for confusion or dizziness.' },
      { id: 'children-cool', audience: 'children', icon: 'water', title: 'Cool children down', body: 'Give children cool baths or wet towels. Never leave a child in a parked vehicle.' },
      { id: 'emergency', audience: 'everyone', icon: 'alert', title: 'Know heatstroke signs', body: 'Call 1122 if someone has high body temperature, confusion, or stops sweating. This is a medical emergency.' },
    ],
  },
  ur: {
    // NOTE: Urdu translations need native-speaker review.
    disclaimer: 'سایا ایک کمیونٹی ٹول ہے اور یہ سرکاری وارننگز یا پیشہ ورانہ طبی مشورے کا متبادل نہیں ہے۔',
    high: [
      { id: 'hydrate', audience: 'everyone', icon: 'water', title: 'بارہ پانی پیئیں', body: 'ہر 20 منٹ میں پانی پیئیں، حتیٰ کہ اگر آپ پیاسا نہیں ہیں۔ میٹھے اور کافی والے مشروبات سے بچیں۔' },
      { id: 'shade-breaks', audience: 'outdoor_workers', icon: 'shade', title: 'سایہ میں آرام کریں', body: 'ہر گھنٹے 15 منٹ سایہ میں آرام کریں۔ بھاری کام صبح 11 بجے سے پہلے یا شام 4 بجے کے بعد کریں۔' },
      { id: 'check-on-elders', audience: 'older_adults', icon: 'alert', title: 'پڑوسیوں کا خیال رکھیں', body: 'بزرگ پڑوسی پیاسا نہیں محسوس کر سکتے۔ دن میں دو بار انہیں کال یا ملاقات کریں۔' },
      { id: 'indoor-play', audience: 'children', icon: 'sun', title: 'بچوں کو اندر رکھیں', body: 'بچوں کو صبح 11 بجے سے شام 4 بجے کے درمیان اندر رکھیں۔ باقاعدگی سے پانی پلائیں۔' },
      { id: 'loose-clothing', audience: 'everyone', icon: 'clothing', title: 'ڈھیلی لباس پہنیں', body: 'ہلکے رنگ کی ڈھیلی سوتی لباس اور چوڑی چھجے والی ٹوپی پہنیں۔' },
    ],
    extreme: [
      { id: 'hydrate', audience: 'everyone', icon: 'water', title: 'فوراً پانی پیئیں', body: 'ہر 15 منٹ میں پانی پیئیں۔ یہ انتہائی گرمی ہے — نمکاسی جلدی ہو سکتی ہے۔' },
      { id: 'stay-indoors', audience: 'everyone', icon: 'shade', title: 'گھر میں رہیں', body: 'صبح 11 بجے سے شام 5 بجے کے درمیان باہر نہ جائیں۔ دن میں کھڑکیاں اور پردے بند رکھیں۔' },
      { id: 'stop-outdoor-work', audience: 'outdoor_workers', icon: 'clock', title: 'باہر کا کام بند کریں', body: 'انتہائی گرمی میں تمام باہر کا جسمانی کام روک دیں۔ صرف شام 5 بجے کے بعد پانی کے ساتھ دوبارہ شروع کریں۔' },
      { id: 'cool-elders', audience: 'older_adults', icon: 'alert', title: 'بزرگوں کو ٹھنڈی جگہ لے جائیں', body: 'بزرگ خاندان کے افراد کو قریب ترین کولنگ سینٹر لے جائیں۔ الجھن یا چکر کے لیے ہوشیار رہیں۔' },
      { id: 'children-cool', audience: 'children', icon: 'water', title: 'بچوں کو ٹھنڈا کریں', body: 'بچوں کو ٹھنڈے غسل یا گیلی تولیے دیں۔ بچے کو کبھی گاڑی میں نہ چھوڑیں۔' },
      { id: 'emergency', audience: 'everyone', icon: 'alert', title: 'لو لگنے کی علامات جانیں', body: 'اگر کسی کو تیز بخار، الجھن، یا پسینہ بند ہو جائے تو 1122 کال کریں۔ یہ طبی ایمرجنسی ہے۔' },
    ],
  },
  sd: {
    // NOTE: Sindhi translations need native-speaker review.
    disclaimer: 'سايا هڪ برادري وارو اوزار آهي ۽ اهو سرڪاري تنبهن يا پيشه ورانه طبي مشوري جو متبادل ناهي.',
    high: [
      { id: 'hydrate', audience: 'everyone', icon: 'water', title: 'بار بار پيٽي پيئو', body: 'هر 20 منٽن ۾ پاڻي پيئو، انڪري جيڪڏهن توهان کي اڃ نه لڳي. مٺي ۽ ڪيفين واري مشروبات کان پاسو ڪريو.' },
      { id: 'shade-breaks', audience: 'outdoor_workers', icon: 'shade', title: 'اڇي ۾ آرام ڪريو', body: 'هر ڪلاڪ ۾ 15 منٽ اڇي ۾ آرام ڪريو. ڳري ڪم صبح 11 کان اڳ يا شام 4 کان پوءِ ڪريو.' },
      { id: 'check-on-elders', audience: 'older_adults', icon: 'alert', title: 'پاڙيسرين جو خيال رکو', body: 'وڏڙا پاڙيسري اڃ محسوس نه ڪري سگهن. ڏينهن ۾ ٻه ڀيرا کين ڪال يا ملاقات ڪريو.' },
      { id: 'indoor-play', audience: 'children', icon: 'sun', title: 'ٻارن کي اندر رکو', body: 'ٻارن کي صبح 11 کان شام 4 جي وچ ۾ اندر رکو. باقاعده پاڻي پيئو.' },
      { id: 'loose-clothing', audience: 'everyone', icon: 'clothing', title: 'ڇڻي لباس پهرين', body: 'هلڪي رنگ جي ڇڻي ڪپهه جي لباس ۽ ويڪري ڇڻي ٽوپي پهرين.' },
    ],
    extreme: [
      { id: 'hydrate', audience: 'everyone', icon: 'water', title: 'فوري پاڻي پيئو', body: 'هر 15 منٽن ۾ پاڻي پيئو. هي انتهايي گرمي آهي — پاڻي جي کوٽ جلدي ٿي سگهي ٿي.' },
      { id: 'stay-indoors', audience: 'everyone', icon: 'shade', title: 'گهر ۾ رهو', body: 'صبح 11 کان شام 5 جي وچ ۾ ٻاهر نه وڃو. ڏينهن ۾ دروزي ۽ پردا بند رکو.' },
      { id: 'stop-outdoor-work', audience: 'outdoor_workers', icon: 'clock', title: 'ٻاهري ڪم بند ڪريو', body: 'انتهايي گرمي ۾ سڀ ٻاهري جسماني ڪم بند ڪريو. صرف شام 5 کان پوءِ پاڻي سان ٻيهر شروع ڪريو.' },
      { id: 'cool-elders', audience: 'older_adults', icon: 'alert', title: 'وڏڙن کي ٿڌي هنڌ وٺو وڃو', body: 'وڏڙن خاندان جي ماڻهن کي ويجهي کولنگ سينٽر وٺو وڃو. الجھن يا چڪر لاءِ خبردار رهو.' },
      { id: 'children-cool', audience: 'children', icon: 'water', title: 'ٻارن کي ٿڌو ڪريو', body: 'ٻارن کي ٿڌو وهنج يا آلي towel ڏيو. ٻار کي ڪڏهن به گاڏي ۾ نه ڇڏيو.' },
      { id: 'emergency', audience: 'everyone', icon: 'alert', title: 'لو لڳڻ جون نشانيون ڄاڻو', body: 'جيڪڏهن ڪنهن کي تيز بخار، الجھن، يا پساري بند ٿي وڃي ته 1122 ڪال ڪريو. هي طبي ايمرجنسي آهي.' },
    ],
  },
};

interface NotifT {
  dailyTitle: string;
  dailyBody: string;
  alertTitle: string;
  alertBody: string;
  alertActions: string[];
}

const notifTranslations: Record<Lang, NotifT> = {
  en: {
    dailyTitle: 'Daily heat update — Khairpur Mirs',
    dailyBody: 'Today: high risk from 11:00 to 16:00. Heat index up to 47°C. Stay hydrated and avoid direct sun.',
    alertTitle: 'Extreme heat warning',
    alertBody: 'Extreme heat expected. Heat index may exceed 54°C. Take immediate precautions.',
    alertActions: ['Move to a cooling center now', 'Drink water every 15 minutes', 'Check on elderly family members'],
  },
  ur: {
    dailyTitle: 'روزانہ گرمی اپڈیٹ — خیرپور میرس',
    dailyBody: 'آج: صبح 11 سے شام 4 تک زیادہ خطرہ۔ ہیٹ انڈیکس 47°C تک۔ پانی پیتے رہیں اور سیدھی دھوپ سے بچیں۔',
    alertTitle: 'انتہائی گرمی وارننگ',
    alertBody: 'انتہائی گرمی متوقع ہے۔ ہیٹ انڈیکس 54°C سے زیادہ ہو سکتا ہے۔ فوراً احتیاط کریں۔',
    alertActions: ['فوراً کولنگ سینٹر جائیں', 'ہر 15 منٹ میں پانی پیئیں', 'بزرگ خاندان کا خیال رکھیں'],
  },
  sd: {
    dailyTitle: 'روزانو گرمي اپڊيٽ — خيرپور ميرس',
    dailyBody: 'اڄ: صبح 11 کان شام 4 تائين وڌيڪ خطره. هيٽ انڊيڪس 47°C تائين. پاڻي پيئندا رهو ۽ سڌي ڌوپ کان بچو.',
    alertTitle: 'انتهايي گرمي تنبه',
    alertBody: 'انتهايي گرمي متوقع آهي. هيٽ انڊيڪس 54°C کان وڌيڪ ٿي سگهي ٿو. فوري احتياط ڪريو.',
    alertActions: ['فوري کولنگ سينٽر وڃو', 'هر 15 منٽن ۾ پاڻي پيئو', 'وڏڙن خاندان جو خيال رکو'],
  },
};

interface MethodologyT {
  title: string;
  summary: string;
  formula: string;
  disclaimer: string;
}

const methodologyTranslations: Record<Lang, MethodologyT> = {
  en: {
    title: 'How we calculate heat risk',
    summary: 'Saaya uses the Heat Index, which combines air temperature and relative humidity to estimate how hot it feels to the human body. We map the heat index to four risk levels and highlight periods of elevated risk.',
    formula: 'Heat Index = f(temperature_c, relative_humidity). We use the NOAA Steadman heat index approximation.',
    disclaimer: 'This indicator is a community tool and not a substitute for official warnings or professional medical advice.',
  },
  ur: {
    title: 'ہم گرمی کا خطرہ کیسے calculate کرتے ہیں',
    summary: 'سایا ہیٹ انڈیکس استعمال کرتا ہے، جو ہوا کے درجہ حرارت اور رطوبت کو ملانے سے calculate کرتا ہے کہ انسان کو کتنی گرمی محسوس ہوتی ہے۔ ہم ہیٹ انڈیکس کو چار خطرے کی سطحوں میں تقسیم کرتے ہیں۔',
    formula: 'ہیٹ انڈیکس = f(درجہ حرارت، رطوبت)۔ ہم NOAA Steadman طریقہ استعمال کرتے ہیں۔',
    disclaimer: 'یہ اشارہ ایک کمیونٹی ٹول ہے اور سرکاری وارننگز یا طبی مشورے کا متبادل نہیں ہے۔',
  },
  sd: {
    title: 'اسان گرمي جو خطرو ڪيئن calculate ڪريون',
    summary: 'سايا هيٽ انڊيڪس استعمال ڪري ٿو، جيڪو هوا جي گرمي ۽ نمي کي ملائي calculate ڪري ٿو ته انسان کي ڪيتري گرمي محسوس ٿيندي آهي. اسان هيٽ انڊيڪس کي چار خطري جي سطحن ۾ ورهايو ٿا.',
    formula: 'هيٽ انڊيڪس = f(گرمي, نمي). اسان NOAA Steadman طريقو استعمال ڪريون ٿا.',
    disclaimer: 'هي اشارو هڪ برادري وارو اوزار آهي ۽ سرڪاري تنبهن يا طبي مشوري جو متبادل ناهي.',
  },
};

// ---------- Exported mock dispatchers ----------

export const mockData = {
  health: (): HealthResponse => ({ status: 'ok', demo_mode: true, time: now.toISOString().replace('Z', '+05:00') }),
  locations: () => mockLocations,
  weather: (extreme: boolean) => buildWeather(extreme),
  risk: (extreme: boolean, lang: Lang) => buildRisk(extreme, lang),
  guidance: (extreme: boolean, lang: Lang) => buildGuidance(extreme, lang),
  notifications: (extreme: boolean, lang: Lang) => buildNotifications(extreme, lang),
  resources: () => ({ count: buildResources().length, items: buildResources() }),
  cities: () => buildCityRisk(),
  methodology: (lang: Lang) => buildMethodology(lang),
};

// Re-export for use in api layer when filtering
export { buildResources };

// Need the ResourceItem type for buildResources return
import type { ResourceItem } from '@/types/api';
