import type { Audience, GuidanceIcon, GuidanceItem, Lang, RiskLevel } from '@/types/api';

interface GuidanceCopy {
  hydration: [string, string];
  shade: [string, string];
  workers: [string, string];
  elders: [string, string];
  children: [string, string];
  uv: [string, string];
  emergency: [string, string];
  disclaimer: string;
}

const copy: Record<Lang, GuidanceCopy> = {
  en: {
    hydration: ['Drink water regularly', 'Drink water throughout the day, even before you feel thirsty.'],
    shade: ['Take shade breaks', 'Move into shade or a cooler indoor place during the hottest hours.'],
    workers: ['Plan outdoor work safely', 'Take regular shaded breaks and reschedule strenuous work away from peak heat.'],
    elders: ['Check on older adults', 'Check that older family members and neighbors are cool, comfortable, and hydrated.'],
    children: ['Keep children cool', 'Offer water often and avoid prolonged outdoor activity in direct sun.'],
    uv: ['Protect yourself from the sun', 'Use shade, covering clothing, and other sun protection when outdoors.'],
    emergency: ['Watch for heatstroke', 'Confusion, fainting, or very hot skin can be an emergency. Call local emergency services.'],
    disclaimer: 'Saaya guidance is informational and does not replace official warnings or medical advice.',
  },
  ur: {
    hydration: ['باقاعدگی سے پانی پئیں', 'پیاس محسوس ہونے سے پہلے بھی دن بھر پانی پیتے رہیں۔'],
    shade: ['سائے میں وقفہ کریں', 'گرمی کے اوقات میں سایہ یا ٹھنڈی اندرونی جگہ پر جائیں۔'],
    workers: ['باہر کام احتیاط سے کریں', 'سائے میں وقفے لیں اور سخت کام شدید گرمی سے پہلے یا بعد میں کریں۔'],
    elders: ['بزرگوں کی خبر لیں', 'بزرگ رشتہ داروں اور پڑوسیوں کے ٹھنڈا رہنے اور پانی پینے کی خبر لیں۔'],
    children: ['بچوں کو ٹھنڈا رکھیں', 'بچوں کو بار بار پانی دیں اور تیز دھوپ میں زیادہ دیر باہر نہ رہنے دیں۔'],
    uv: ['دھوپ سے حفاظت کریں', 'باہر جاتے وقت سایہ، ڈھانپنے والے کپڑے اور دھوپ سے بچاؤ استعمال کریں۔'],
    emergency: ['ہیٹ اسٹروک کی علامات دیکھیں', 'الجھن، بے ہوشی یا بہت گرم جلد ہنگامی حالت ہو سکتی ہے۔ مقامی ایمرجنسی سروس کو کال کریں۔'],
    disclaimer: 'سایا کی رہنمائی معلوماتی ہے، سرکاری وارننگ یا طبی مشورے کا متبادل نہیں۔',
  },
  sd: {
    hydration: ['باقاعدگي سان پاڻي پيئو', 'اڃ لڳڻ کان اڳ به سڄو ڏينهن پاڻي پيئندا رهو.'],
    shade: ['ڇانوَ ۾ وقفو ڪريو', 'گرميءَ جي وقت ڇانوَ يا ٿڌي اندروني جاءِ تي وڃو.'],
    workers: ['ٻاهر ڪم احتياط سان ڪريو', 'ڇانوَ ۾ وقفا وٺو ۽ سخت ڪم تيز گرمي کان اڳ يا پوءِ ڪريو.'],
    elders: ['وڏڙن جي خبر وٺو', 'وڏن مائٽن ۽ پاڙيسرين جي ٿڌي رهڻ ۽ پاڻي پيئڻ جي خبر وٺو.'],
    children: ['ٻارن کي ٿڌو رکو', 'ٻارن کي بار بار پاڻي ڏيو ۽ تيز اُس ۾ گهڻو وقت ٻاهر نه رهڻ ڏيو.'],
    uv: ['سج کان بچاءُ ڪريو', 'ٻاهر ويندي ڇانوَ، ڍڪيندڙ ڪپڙا ۽ سج کان بچاءُ استعمال ڪريو.'],
    emergency: ['هيٽ اسٽروڪ جون نشانيون ڏسو', 'الجهن، بيهوشي يا تمام گرم چمڙي هنگامي حالت ٿي سگهي ٿي. مقامي ايمرجنسي سروس کي ڪال ڪريو.'],
    disclaimer: 'سايا جي رهنمائي معلوماتي آهي؛ سرڪاري تنبيهه يا طبي صلاح جو متبادل ناهي.',
  },
};

export function generateGuidance(level: RiskLevel, drivers: string[], lang: Lang) {
  const text = copy[lang];
  const items: GuidanceItem[] = [];
  const add = (id: string, audience: Audience, icon: GuidanceIcon, pair: [string, string]) => {
    items.push({ id, audience, icon, title: pair[0], body: pair[1] });
  };

  add('local-hydration', 'everyone', 'water', text.hydration);
  add('local-elders', 'older_adults', 'alert', text.elders);
  add('local-children', 'children', 'sun', text.children);
  if (level === 'moderate' || level === 'high' || level === 'extreme') {
    add('local-shade', 'everyone', 'shade', text.shade);
    add('local-workers', 'outdoor_workers', 'clock', text.workers);
  }
  if (drivers.includes('Strong UV')) add('local-uv', 'everyone', 'sun', text.uv);
  if (level === 'extreme') add('local-emergency', 'everyone', 'alert', text.emergency);

  return { risk_level: level, lang, items, disclaimer: text.disclaimer };
}