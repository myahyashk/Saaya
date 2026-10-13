import type { Lang } from '@/types/api';

export type TranslationKey =
  | 'app.tagline'
  | 'app.openDashboard'
  | 'nav.overview'
  | 'nav.weather'
  | 'nav.risk'
  | 'nav.guidance'
  | 'nav.notifications'
  | 'nav.coolingMap'
  | 'location.useMyLocation'
  | 'location.selectCity'
  | 'location.activeLocation'
  | 'location.detecting'
  | 'location.denied'
  | 'location.grant'
  | 'language.label'
  | 'language.en'
  | 'language.ur'
  | 'language.sd'
  | 'common.loading'
  | 'common.error'
  | 'common.retry'
  | 'common.empty'
  | 'common.refresh'
  | 'common.close'
  | 'common.dismiss'
  | 'common.viewAll'
  | 'common.getDirections'
  | 'common.sampleData'
  | 'common.verifyBeforeVisit'
  | 'disclaimer.short'
  | 'disclaimer.full'
  | 'disclaimer.title'
  | 'disclaimer.officialSources'
  | 'landing.problem'
  | 'landing.features'
  | 'landing.feature.weather'
  | 'landing.feature.risk'
  | 'landing.feature.guidance'
  | 'landing.feature.alerts'
  | 'landing.feature.map'
  | 'landing.howWeCalculate'
  | 'landing.languages'
  | 'landing.languagesDesc'
  | 'risk.low'
  | 'risk.moderate'
  | 'risk.high'
  | 'risk.extreme'
  | 'risk.currentLevel'
  | 'risk.heatIndex'
  | 'risk.drivers'
  | 'risk.elevatedPeriods'
  | 'risk.nextElevated'
  | 'risk.howCalculated'
  | 'risk.timeline'
  | 'overview.title'
  | 'overview.currentWeather'
  | 'overview.topGuidance'
  | 'overview.nearestCooling'
  | 'overview.noElevated'
  | 'weather.title'
  | 'weather.current'
  | 'weather.hourly'
  | 'weather.daily'
  | 'weather.temperature'
  | 'weather.feelsLike'
  | 'weather.humidity'
  | 'weather.uv'
  | 'weather.wind'
  | 'weather.condition'
  | 'weather.sunrise'
  | 'weather.sunset'
  | 'guidance.title'
  | 'guidance.everyone'
  | 'guidance.outdoorWorkers'
  | 'guidance.olderAdults'
  | 'guidance.children'
  | 'notifications.title'
  | 'notifications.markRead'
  | 'notifications.empty'
  | 'notifications.unread'
  | 'map.title'
  | 'map.search'
  | 'map.nearMe'
  | 'map.filterType'
  | 'map.filterProvince'
  | 'map.allTypes'
  | 'map.allProvinces'
  | 'map.legend'
  | 'map.coolingCenter'
  | 'map.waterPoint'
  | 'map.assistance'
  | 'map.closestPlaces'
  | 'map.noResults'
  | 'alert.title'
  | 'alert.timeWindow'
  | 'alert.topActions'
  | 'alert.viewGuidance'
  | 'alert.findCooling'
  | 'alert.dismiss'
  | 'demo.extremeMode'
  | 'footer.aboutTitle'
  | 'footer.aboutText'
  | 'footer.aboutBuild'
  | 'footer.teamTitle'
  | 'footer.teamFrontend'
  | 'footer.teamBackend'
  | 'footer.safetyTitle'
  | 'footer.safetyText'
  | 'footer.disclaimer'
  | 'footer.officialSources'
  | 'common.back'
  | 'sidebar.disclaimer';

type TranslationDict = Record<TranslationKey, string>;

const en: TranslationDict = {
  'app.tagline': 'Heatwave Safety Intelligence for Pakistan',
  'app.openDashboard': 'Open dashboard',
  'nav.overview': 'Overview',
  'nav.weather': 'Weather forecast',
  'nav.risk': 'Heat risk',
  'nav.guidance': 'Safety guidance',
  'nav.notifications': 'Notifications',
  'nav.coolingMap': 'Cooling map',
  'location.useMyLocation': 'Use my location',
  'location.selectCity': 'Select city',
  'location.activeLocation': 'Active location',
  'location.detecting': 'Detecting location…',
  'location.denied': 'Location denied — using city picker',
  'location.grant': 'Grant location',
  'language.label': 'Language',
  'language.en': 'English',
  'language.ur': 'Urdu',
  'language.sd': 'Sindhi',
  'common.loading': 'Loading…',
  'common.error': 'Something went wrong',
  'common.retry': 'Retry',
  'common.empty': 'No data available',
  'common.refresh': 'Refresh',
  'common.close': 'Close',
  'common.dismiss': 'Dismiss',
  'common.viewAll': 'View all',
  'common.getDirections': 'Get directions',
  'common.sampleData': 'Sample data',
  'common.verifyBeforeVisit': 'Verify before visiting',
  'disclaimer.short': 'Saaya is a community tool and not a substitute for official warnings or professional medical advice.',
  'disclaimer.full': 'Saaya is a community tool and not a substitute for official warnings or professional medical advice. Always follow guidance from the Pakistan Meteorological Department and NDMA. In a medical emergency, call 1122.',
  'disclaimer.title': 'Disclaimer',
  'disclaimer.officialSources': 'Official sources',
  'landing.problem': 'Extreme heat threatens outdoor workers, older adults, and vulnerable residents who may lack timely safety information or easy access to cooling and water. Saaya brings weather data, heat risk indicators, and community resources together in one place.',
  'landing.features': 'Features',
  'landing.feature.weather': 'Real-time weather and 48-hour forecasts with temperature, feels-like, humidity, and UV.',
  'landing.feature.risk': 'A clear heat risk indicator with drivers and an hourly timeline of elevated-risk periods.',
  'landing.feature.guidance': 'Practical safety guidance that adapts to the current risk level, grouped by audience.',
  'landing.feature.alerts': 'Daily multilingual alerts and a red emergency pop-up for extreme-heat danger.',
  'landing.feature.map': 'A Pakistan-wide cooling map with cooling centers, water points, and assistance locations.',
  'landing.howWeCalculate': 'How we calculate risk',
  'landing.languages': 'Available in three languages',
  'landing.languagesDesc': 'English, Urdu, and Sindhi — the entire interface flips direction for right-to-left languages.',
  'risk.low': 'Low',
  'risk.moderate': 'Moderate',
  'risk.high': 'High',
  'risk.extreme': 'Extreme',
  'risk.currentLevel': 'Current risk level',
  'risk.heatIndex': 'Heat index',
  'risk.drivers': 'Risk drivers',
  'risk.elevatedPeriods': 'Elevated-risk periods',
  'risk.nextElevated': 'Next elevated-risk period',
  'risk.howCalculated': 'How this is calculated',
  'risk.timeline': 'Hourly risk timeline',
  'overview.title': 'Overview',
  'overview.currentWeather': 'Current weather',
  'overview.topGuidance': 'Top safety tips',
  'overview.nearestCooling': 'Nearest cooling places',
  'overview.noElevated': 'No elevated-risk periods in the next 48 hours',
  'weather.title': 'Weather forecast',
  'weather.current': 'Current conditions',
  'weather.hourly': '48-hour forecast',
  'weather.daily': '7-day outlook',
  'weather.temperature': 'Temperature',
  'weather.feelsLike': 'Feels like',
  'weather.humidity': 'Humidity',
  'weather.uv': 'UV index',
  'weather.wind': 'Wind',
  'weather.condition': 'Condition',
  'weather.sunrise': 'Sunrise',
  'weather.sunset': 'Sunset',
  'guidance.title': 'Safety guidance',
  'guidance.everyone': 'Everyone',
  'guidance.outdoorWorkers': 'Outdoor workers',
  'guidance.olderAdults': 'Older adults',
  'guidance.children': 'Children',
  'notifications.title': 'Notifications',
  'notifications.markRead': 'Mark as read',
  'notifications.empty': 'No notifications yet',
  'notifications.unread': 'unread',
  'map.title': 'Cooling map',
  'map.search': 'Search places…',
  'map.nearMe': 'Near me',
  'map.filterType': 'Filter by type',
  'map.filterProvince': 'Filter by province',
  'map.allTypes': 'All types',
  'map.allProvinces': 'All provinces',
  'map.legend': 'Legend',
  'map.coolingCenter': 'Cooling center',
  'map.waterPoint': 'Water point',
  'map.assistance': 'Assistance',
  'map.closestPlaces': 'Closest places',
  'map.noResults': 'No places found',
  'alert.title': 'Extreme heat warning',
  'alert.timeWindow': 'Time window',
  'alert.topActions': 'Top actions',
  'alert.viewGuidance': 'View safety guidance',
  'alert.findCooling': 'Find cooling centers near me',
  'alert.dismiss': 'Dismiss',
  'demo.extremeMode': 'Demo: simulate extreme heat day',
  'footer.aboutTitle': 'About Saaya',
  'footer.aboutText': 'Saaya is a heatwave safety intelligence system that helps communities track conditions, heat risk, and safer actions before danger escalates.',
  'footer.aboutBuild': 'Built for OpenHack\'26, Health track, challenge CL-02',
  'footer.teamTitle': 'Team',
  'footer.teamFrontend': 'Frontend developers: Muhammad Yahya and Musawir Ali',
  'footer.teamBackend': 'Backend developer: Sagheer Ahmed',
  'footer.safetyTitle': 'Safety and official sources',
  'footer.safetyText': 'Saaya is a prototype and not a substitute for official warnings or professional medical advice',
  'footer.disclaimer': 'Saaya is a community tool — not a substitute for official warnings or medical advice.',
  'footer.officialSources': 'Official sources',
  'common.back': 'Back',
  'sidebar.disclaimer': 'Disclaimer',
};

// NOTE: Urdu translations need native-speaker review.
const ur: TranslationDict = {
  'app.tagline': 'پاکستان کے لیے ہیٹ ویو سیفٹی انٹیلیجنس',
  'app.openDashboard': 'ڈیش بورڈ کھولیں',
  'nav.overview': 'جائزہ',
  'nav.weather': 'موسم کی پیش گوئی',
  'nav.risk': 'گرمی کا خطرہ',
  'nav.guidance': 'حفاظتی رہنمائی',
  'nav.notifications': 'اطلاعات',
  'nav.coolingMap': 'کولنگ نقشہ',
  'location.useMyLocation': 'میری لوکیشن استعمال کریں',
  'location.selectCity': 'شہر منتخب کریں',
  'location.activeLocation': 'موجودہ لوکیشن',
  'location.detecting': 'لوکیشن معلوم ہو رہی ہے…',
  'location.denied': 'لوکیشن مسترد — شہر کا انتخاب استعمال کریں',
  'location.grant': 'لوکیشن دیں',
  'language.label': 'زبان',
  'language.en': 'انگلش',
  'language.ur': 'اردو',
  'language.sd': 'سندھی',
  'common.loading': 'لوڈ ہو رہا ہے…',
  'common.error': 'کچھ غلط ہو گیا',
  'common.retry': 'دوبارہ کوشش',
  'common.empty': 'کوئی ڈیٹا دستیاب نہیں',
  'common.refresh': 'تازہ کریں',
  'common.close': 'بند کریں',
  'common.dismiss': 'مسترد کریں',
  'common.viewAll': 'سب دیکھیں',
  'common.getDirections': 'راستہ حاصل کریں',
  'common.sampleData': 'نمونہ ڈیٹا',
  'common.verifyBeforeVisit': 'دہراہنے سے پہلے تصدیق کریں',
  'disclaimer.short': 'سایا ایک کمیونٹی ٹول ہے اور سرکاری وارننگز یا پیشہ ورانہ طبی مشورے کا متبادل نہیں ہے۔',
  'disclaimer.full': 'سایا ایک کمیونٹی ٹول ہے اور سرکاری وارننگز یا پیشہ ورانہ طبی مشورے کا متبادل نہیں ہے۔ ہمیشہ پاکستان میٹورولوجیکل ڈیپارٹمنٹ اور این ڈی ایم اے کی رہنمائی پر عمل کریں۔ طبی ایمرجنسی میں 1122 کال کریں۔',
  'disclaimer.title': 'ڈس کلیمر',
  'disclaimer.officialSources': 'سرکاری ذرائع',
  'landing.problem': 'انتہائی گرمی باہر کام کرنے والوں، بزرگوں، اور کمزور رہائشیوں کے لیے خطرہ ہے جن کے پاس بروقت حفاظتی معلومات یا کولنگ اور پانی تک آسانی سے رسائی نہیں ہوتی۔ سایا موسم کے ڈیٹا، گرمی کے خطرے کے اشارے، اور کمیونٹی وسائل کو ایک جگہ لاتا ہے۔',
  'landing.features': 'خصوصیات',
  'landing.feature.weather': 'ریئل ٹائم موسم اور 48 گھنٹے کی پیش گوئی — درجہ حرارت، محسوس ہونے والی گرمی، نمی، اور UV۔',
  'landing.feature.risk': 'گرمی کے خطرے کا واضح اشارہ، ڈرائیورز اور خطرے کی اونچائی کے اوقات کی گھنٹہ وار ٹائم لائن۔',
  'landing.feature.guidance': 'موجودہ خطرے کی سطح کے مطابق عملی حفاظتی رہنمائی، ناظرین کے لحاظ سے۔',
  'landing.feature.alerts': 'روزانہ کثیر الزبانی اطلاعات اور انتہائی گرمی کے لیے ریڈ ایمرجنسی پاپ اپ۔',
  'landing.feature.map': 'پاکستان بھر میں کولنگ نقشہ — کولنگ سینٹرز، واٹر پوائنٹس، اور مدد کی جگہیں۔',
  'landing.howWeCalculate': 'ہم خطرہ کیسے calculate کرتے ہیں',
  'landing.languages': 'تین زبانوں میں دستیاب',
  'landing.languagesDesc': 'انگلش، اردو، اور سندھی — پورا انٹرفیس دائیں سے بائیں زبانوں کے لیے رخ بدل دیتا ہے۔',
  'risk.low': 'کم',
  'risk.moderate': 'درمیانہ',
  'risk.high': 'زیادہ',
  'risk.extreme': 'انتہائی',
  'risk.currentLevel': 'موجودہ خطرے کی سطح',
  'risk.heatIndex': 'ہیٹ انڈیکس',
  'risk.drivers': 'خطرے کے ڈرائیورز',
  'risk.elevatedPeriods': 'خطرے کی اونچائی کے اوقات',
  'risk.nextElevated': 'اگلا خطرے کا وقت',
  'risk.howCalculated': 'یہ کیسے calculate ہوتا ہے',
  'risk.timeline': 'گھنٹہ وار خطرے کی ٹائم لائن',
  'overview.title': 'جائزہ',
  'overview.currentWeather': 'موجودہ موسم',
  'overview.topGuidance': 'بہترین حفاظتی تجاویز',
  'overview.nearestCooling': 'قریب ترین کولنگ جگہیں',
  'overview.noElevated': 'اگلے 48 گھنٹوں میں کوئی خطرے کا وقت نہیں',
  'weather.title': 'موسم کی پیش گوئی',
  'weather.current': 'موجودہ حالات',
  'weather.hourly': '48 گھنٹے کی پیش گوئی',
  'weather.daily': '7 دن کا نظارہ',
  'weather.temperature': 'درجہ حرارت',
  'weather.feelsLike': 'محسوس ہوتا ہے',
  'weather.humidity': 'نمی',
  'weather.uv': 'UV انڈیکس',
  'weather.wind': 'ہوا',
  'weather.condition': 'حالت',
  'weather.sunrise': 'سورج طلوع',
  'weather.sunset': 'سورج غروب',
  'guidance.title': 'حفاظتی رہنمائی',
  'guidance.everyone': 'سب کے لیے',
  'guidance.outdoorWorkers': 'باہر کام کرنے والے',
  'guidance.olderAdults': 'بزرگ',
  'guidance.children': 'بچے',
  'notifications.title': 'اطلاعات',
  'notifications.markRead': 'پڑھا ہوا mark کریں',
  'notifications.empty': 'ابھی کوئی اطلاعات نہیں',
  'notifications.unread': 'غیر پڑھی',
  'map.title': 'کولنگ نقشہ',
  'map.search': 'جگہیں تلاش کریں…',
  'map.nearMe': 'میرے پاس',
  'map.filterType': 'قسم کے لحاظ سے',
  'map.filterProvince': 'صوبے کے لحاظ سے',
  'map.allTypes': 'تمام اقسام',
  'map.allProvinces': 'تمام صوبے',
  'map.legend': 'لیجنڈ',
  'map.coolingCenter': 'کولنگ سینٹر',
  'map.waterPoint': 'واٹر پوائنٹ',
  'map.assistance': 'مدد',
  'map.closestPlaces': 'قریب ترین جگہیں',
  'map.noResults': 'کوئی جگہ نہیں ملی',
  'alert.title': 'انتہائی گرمی وارننگ',
  'alert.timeWindow': 'وقت کی ونڈو',
  'alert.topActions': 'بہترین اقدامات',
  'alert.viewGuidance': 'حفاظتی رہنمائی دیکھیں',
  'alert.findCooling': 'میرے پاس کولنگ سینٹر تلاش کریں',
  'alert.dismiss': 'مسترد کریں',
  'demo.extremeMode': 'ڈیمو: انتہائی گرمی کا دن simulate کریں',
  'footer.aboutTitle': 'سایا کے بارے میں',
  'footer.aboutText': 'سایا ایک ہیٹ ویو سیفٹی انٹیلیجنس سسٹم ہے جو کمیونٹیوں کو خطرے سے پہلے موسمی حالات، گرمی کے خطرے اور محفوظ اقدامات کو جاننے میں مدد دیتا ہے۔',
  'footer.aboutBuild': 'OpenHack\'26، Health ٹریک، چیلنج CL-02 کے لیے بنایا گیا',
  'footer.teamTitle': 'ٹیم',
  'footer.teamFrontend': 'فرنٹ اینڈ ڈویلپرز: محمد یحییٰ اور موسی ر علی',
  'footer.teamBackend': 'بیک اینڈ ڈویلپر: ساغر احمد',
  'footer.safetyTitle': 'حفاظت اور سرکاری ذرائع',
  'footer.safetyText': 'سایا ایک پروٹو ٹائپ ہے اور سرکاری وارننگز یا پیشہ ورانہ طبی مشورے کا متبادل نہیں ہے',
  'footer.disclaimer': 'سایا ایک کمیونٹی ٹول ہے — سرکاری وارننگز یا طبی مشورے کا متبادل نہیں۔',
  'footer.officialSources': 'سرکاری ذرائع',
  'common.back': 'واپس',
  'sidebar.disclaimer': 'ڈس کلیمر',
};

// NOTE: Sindhi translations need native-speaker review.
const sd: TranslationDict = {
  'app.tagline': 'پاڪستان لاءِ هيٽ ويو سيفتي انٽيليجنس',
  'app.openDashboard': 'ڊيش بورڊ کوليو',
  'nav.overview': 'جائزو',
  'nav.weather': 'موسم جي اڳڀائي',
  'nav.risk': 'گرمي جو خطرو',
  'nav.guidance': 'حفاظتي رهنمائي',
  'nav.notifications': 'اطلاعون',
  'nav.coolingMap': 'کولنگ نقشو',
  'location.useMyLocation': 'منهنجي لوڪيشن استعمال ڪريو',
  'location.selectCity': 'شهر چونڊيو',
  'location.activeLocation': 'موجوده لوڪيشن',
  'location.detecting': 'لوڪيشن معلوم ٿي رهي آهي…',
  'location.denied': 'لوڪيشن رد — شهر جو انتخاب استعمال ڪريو',
  'location.grant': 'لوڪيشن ڏيو',
  'language.label': 'زبان',
  'language.en': 'انگريزي',
  'language.ur': 'اردو',
  'language.sd': 'سنڌي',
  'common.loading': 'لوڊ ٿي رهيو آهي…',
  'common.error': 'ڪجهه غلط ٿيو',
  'common.retry': 'ٻيهر ڪوشش',
  'common.empty': 'ڪابه ڊيٽا دستياب ناهي',
  'common.refresh': 'تازو ڪريو',
  'common.close': 'بند ڪريو',
  'common.dismiss': 'رد ڪريو',
  'common.viewAll': 'سڀ ڏسو',
  'common.getDirections': 'رستو حاصل ڪريو',
  'common.sampleData': 'نموونو ڊيٽا',
  'common.verifyBeforeVisit': 'وڃڻ کان اڳ تصديق ڪريو',
  'disclaimer.short': 'سايا هڪ برادري وارو اوزار آهي ۽ اهو سرڪاري تنبهن يا پيشه ورانه طبي مشوري جو متبادل ناهي.',
  'disclaimer.full': 'سايا هڪ برادري وارو اوزار آهي ۽ اهو سرڪاري تنبهن يا پيشه ورانه طبي مشوري جو متبادل ناهي. هميشه پاڪستان ميٽورولوجيڪل ڊپارٽمينٽ ۽ اين ڊي ايم اي جي رهنمائي تي عمل ڪريو. طبي ايمرجنسي ۾ 1122 ڪال ڪريو.',
  'disclaimer.title': 'ڊسclaimer',
  'disclaimer.officialSources': 'سرڪاري ذريعا',
  'landing.problem': 'انتهايي گرمي ٻاهر ڪم ڪندڙن، وڏڙن، ۽ ڪمزور رهائشين لاءِ خطرو آهي جن وٽ بروقت حفاظتي معلومات يا کولنگ ۽ پاني تائين آساني سان رسائي ناهي. سايا موسم جي ڊيٽا، گرمي جي خطري جي اشارن، ۽ برادري جي وسائل کي هڪ هنڌ آڻي ٿو.',
  'landing.features': 'خاصيتون',
  'landing.feature.weather': 'ريئل ٽائم موسم ۽ 48 ڪلاڪ جي اڳڀائي — گرمي، محسوس ٿيندڙ گرمي، نمي، ۽ UV.',
  'landing.feature.risk': 'گرمي جي خطري جو واضح اشارو، ڊرائيورز ۽ خطري جي بلندي جي وقت جي ڪلاڪ وارٽائم لائن.',
  'landing.feature.guidance': 'موجوده خطري جي سطح مطابق عملي حفاظتي رهنمائي، ناظرين مطابق.',
  'landing.feature.alerts': 'روزانو گھڻ لساني اطلاعون ۽ انتهايي گرمي لاءِ ريڊ ايمرجنسي پاپ اپ.',
  'landing.feature.map': 'پاڪستان ۾ کولنگ نقشو — کولنگ سينٽر، واٽر پوائنٽ، ۽ مدد جي جڳهن سان.',
  'landing.howWeCalculate': 'اسان خطرو ڪيئن calculate ڪريون',
  'landing.languages': 'ٽن ٻولين ۾ دستياب',
  'landing.languagesDesc': 'انگريزي، اردو، ۽ سنڌي — پورو انٽرفيس ساڄي کان کاٻي ٻولين لاءِ رخ بدلائي ٿو.',
  'risk.low': 'گھٽ',
  'risk.moderate': 'وچولو',
  'risk.high': 'وڌيڪ',
  'risk.extreme': 'تمام',
  'risk.currentLevel': 'موجوده خطري جي سطح',
  'risk.heatIndex': 'هيٽ انڊيڪس',
  'risk.drivers': 'خطري جا ڊرائيورز',
  'risk.elevatedPeriods': 'خطري جي بلندي جا وقت',
  'risk.nextElevated': 'اڳيون خطري جو وقت',
  'risk.howCalculated': 'هي ڪيئن calculate ٿئي ٿو',
  'risk.timeline': 'ڪلاڪ وار خطري جي ٽائم لائن',
  'overview.title': 'جائزو',
  'overview.currentWeather': 'موجوده موسم',
  'overview.topGuidance': 'بهترين حفاظتي صلاحون',
  'overview.nearestCooling': 'ويجهي کولنگ جڳهون',
  'overview.noElevated': 'اڳين 48 ڪلاڪن ۾ ڪابه خطري جو وقت ناهي',
  'weather.title': 'موسم جي اڳڀائي',
  'weather.current': 'موجوده حالتون',
  'weather.hourly': '48 ڪلاڪ جي اڳڀائي',
  'weather.daily': '7 ڏينهن جو نظارو',
  'weather.temperature': 'گرمي',
  'weather.feelsLike': 'محسوس ٿئي ٿو',
  'weather.humidity': 'نمي',
  'weather.uv': 'UV انڊيڪس',
  'weather.wind': 'هوا',
  'weather.condition': 'حالت',
  'weather.sunrise': 'سج اڀرڻ',
  'weather.sunset': 'سج لهڻ',
  'guidance.title': 'حفاظتي رهنمائي',
  'guidance.everyone': 'سڀني لاءِ',
  'guidance.outdoorWorkers': 'ٻاهر ڪم ڪندڙ',
  'guidance.olderAdults': 'وڏڙا',
  'guidance.children': 'ٻار',
  'notifications.title': 'اطلاعون',
  'notifications.markRead': 'پڙهيل mark ڪريو',
  'notifications.empty': 'اڃا تائين ڪابه اطلاع ناهي',
  'notifications.unread': 'اڻ پڙهيل',
  'map.title': 'کولنگ نقشو',
  'map.search': 'جڳهون ڳوليو…',
  'map.nearMe': 'منهنجي ويجهو',
  'map.filterType': 'قسم مطابق',
  'map.filterProvince': 'صوبي مطابق',
  'map.allTypes': 'سڀ قسم',
  'map.allProvinces': 'سڀ صوبا',
  'map.legend': 'ليجنڊ',
  'map.coolingCenter': 'کولنگ سينٽر',
  'map.waterPoint': 'واٽر پوائنٽ',
  'map.assistance': 'مدد',
  'map.closestPlaces': 'ويجهي جڳهون',
  'map.noResults': 'ڪابه جڳهه نه ملي',
  'alert.title': 'انتهايي گرمي تنبه',
  'alert.timeWindow': 'وقت جي ونڊو',
  'alert.topActions': 'بهترين عمل',
  'alert.viewGuidance': 'حفاظتي رهنمائي ڏسو',
  'alert.findCooling': 'منهنجي ويجهو کولنگ سينٽر ڳوليو',
  'alert.dismiss': 'رد ڪريو',
  'demo.extremeMode': 'ڊيمو: انتهايي گرمي جو ڏينهن simulate ڪريو',
  'footer.aboutTitle': 'سايا بابت',
  'footer.aboutText': 'سايا هڪ هيٽ ويڦو سيڪيٽي انٽيليجنس سسٽم آهي جنهن برادريون کي موسمي حالتن، گرمي جا خطرا، ۽ محفوظ عملن بابت خطرن کان پهريان ڄاچي مدد ڪري ٿو.',
  'footer.aboutBuild': 'OpenHack\'26، Health ٽريڪ، چيلنج CL-02 لاء ٺھيو',
  'footer.teamTitle': 'ٽيم',
  'footer.teamFrontend': 'فرنٽ اينڊ ڊولپرز: محمد يحييٰ ۽ موسور علي',
  'footer.teamBackend': 'بیک اينڊ ڊولپر: ساگر احمد',
  'footer.safetyTitle': 'حفاظت ۽ سرڪاري ذريعا',
  'footer.safetyText': 'سايا هڪ پروٽوٽائپ آهي ۽ سرڪاري تنبهن يا پيشه ور طبي مشوري جو متبادل ناهي',
  'footer.disclaimer': 'سايا هڪ برادري وارو اوزار آهي — سرڪاري تنبهن يا طبي مشوري جو متبادل ناهي.',
  'footer.officialSources': 'سرڪاري ذريعا',
  'common.back': 'واپس',
  'sidebar.disclaimer': 'ڊسclaimer',
};

export const translations: Record<Lang, TranslationDict> = { en, ur, sd };
