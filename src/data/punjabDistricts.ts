export interface PunjabDistrictZone {
  no: number;
  urdu: string;
  en: string;
  zone?: string;
  category: 'central' | 'district' | 'committee' | 'wing';
}

/**
 * Official List of 55 Districts, Zones, and Bodies of Jamaat Islahul Muslimeen Punjab
 * Transcribed verbatim from the official institutional registry (فہرست اضلاع و زونز)
 */
export const JIM_PUNJAB_DISTRICTS_ZONES: PunjabDistrictZone[] = [
  { no: 0, urdu: 'سرپرست اعلیٰ', en: 'Sarparast-e-Aala', category: 'central' },
  { no: 1, urdu: 'جماعت اصلاح المسلمین پاکستان مرکزی باڈی', en: 'JIM Pakistan Central Body', category: 'central' },
  { no: 2, urdu: 'جماعت اصلاح المسلمین پاکستان صوبہ پنجاب', en: 'JIM Pakistan Province Punjab', category: 'central' },
  { no: 3, urdu: 'اسلام آباد', en: 'Islamabad', category: 'district' },
  { no: 4, urdu: 'اوکاڑہ', en: 'Okara', category: 'district' },
  { no: 5, urdu: 'اٹک', en: 'Attock', category: 'district' },
  { no: 6, urdu: 'بہاولپور', en: 'Bahawalpur', category: 'district' },
  { no: 7, urdu: 'بہاولنگر زون 1', en: 'Bahawalnagar Zone 1', zone: 'Zone 1', category: 'district' },
  { no: 8, urdu: 'بہاولنگر زون 2', en: 'Bahawalnagar Zone 2', zone: 'Zone 2', category: 'district' },
  { no: 9, urdu: 'پاکپتن', en: 'Pakpattan', category: 'district' },
  { no: 10, urdu: 'ٹوبہ ٹیک سنگھ', en: 'Toba Tek Singh', category: 'district' },
  { no: 11, urdu: 'جہلم', en: 'Jhelum', category: 'district' },
  { no: 12, urdu: 'جھنگ', en: 'Jhang', category: 'district' },
  { no: 13, urdu: 'چنیوٹ', en: 'Chiniot', category: 'district' },
  { no: 14, urdu: 'چکوال', en: 'Chakwal', category: 'district' },
  { no: 15, urdu: 'خوشاب', en: 'Khushab', category: 'district' },
  { no: 16, urdu: 'خانیوال', en: 'Khanewal', category: 'district' },
  { no: 17, urdu: 'راولپنڈی زون 1', en: 'Rawalpindi Zone 1', zone: 'Zone 1', category: 'district' },
  { no: 18, urdu: 'راولپنڈی زون 2', en: 'Rawalpindi Zone 2', zone: 'Zone 2', category: 'district' },
  { no: 19, urdu: 'رحیم یار خان زون 1', en: 'Rahim Yar Khan Zone 1', zone: 'Zone 1', category: 'district' },
  { no: 20, urdu: 'رحیم یار خان زون 2', en: 'Rahim Yar Khan Zone 2', zone: 'Zone 2', category: 'district' },
  { no: 21, urdu: 'رحیم یار خان زون 3', en: 'Rahim Yar Khan Zone 3', zone: 'Zone 3', category: 'district' },
  { no: 22, urdu: 'راجن پور', en: 'Rajanpur', category: 'district' },
  { no: 23, urdu: 'ساہیوال زون 1', en: 'Sahiwal Zone 1', zone: 'Zone 1', category: 'district' },
  { no: 24, urdu: 'ساہیوال زون 2', en: 'Sahiwal Zone 2', zone: 'Zone 2', category: 'district' },
  { no: 25, urdu: 'سرگودھا', en: 'Sargodha', category: 'district' },
  { no: 26, urdu: 'سیالکوٹ زون 1', en: 'Sialkot Zone 1', zone: 'Zone 1', category: 'district' },
  { no: 27, urdu: 'سیالکوٹ زون 2', en: 'Sialkot Zone 2', zone: 'Zone 2', category: 'district' },
  { no: 28, urdu: 'شیخوپورہ', en: 'Sheikhupura', category: 'district' },
  { no: 29, urdu: 'فیصل آباد زون 1', en: 'Faisalabad Zone 1', zone: 'Zone 1', category: 'district' },
  { no: 30, urdu: 'فیصل آباد زون 2', en: 'Faisalabad Zone 2', zone: 'Zone 2', category: 'district' },
  { no: 31, urdu: 'فیصل آباد زون 3', en: 'Faisalabad Zone 3', zone: 'Zone 3', category: 'district' },
  { no: 32, urdu: 'کوٹ ادو', en: 'Kot Addu', category: 'district' },
  { no: 33, urdu: 'قصور', en: 'Kasur', category: 'district' },
  { no: 34, urdu: 'گجرات زون 1', en: 'Gujarat Zone 1', zone: 'Zone 1', category: 'district' },
  { no: 35, urdu: 'گجرات زون 2', en: 'Gujarat Zone 2', zone: 'Zone 2', category: 'district' },
  { no: 36, urdu: 'گوجرانوالہ زون 1', en: 'Gujranwala Zone 1', zone: 'Zone 1', category: 'district' },
  { no: 37, urdu: 'گوجرانوالہ زون 2', en: 'Gujranwala Zone 2', zone: 'Zone 2', category: 'district' },
  { no: 38, urdu: 'لاہور زون 1', en: 'Lahore Zone 1', zone: 'Zone 1', category: 'district' },
  { no: 39, urdu: 'لاہور زون 2', en: 'Lahore Zone 2', zone: 'Zone 2', category: 'district' },
  { no: 40, urdu: 'لیہ', en: 'Layyah', category: 'district' },
  { no: 41, urdu: 'لودھراں', en: 'Lodhran', category: 'district' },
  { no: 42, urdu: 'مظفر گڑھ', en: 'Muzaffargarh', category: 'district' },
  { no: 43, urdu: 'ملتان', en: 'Multan', category: 'district' },
  { no: 44, urdu: 'منڈی بہاؤالدین', en: 'Mandi Bahauddin', category: 'district' },
  { no: 45, urdu: 'میانوالی', en: 'Mianwali', category: 'district' },
  { no: 46, urdu: 'مری', en: 'Murree', category: 'district' },
  { no: 47, urdu: 'نارووال زون 1', en: 'Narowal Zone 1', zone: 'Zone 1', category: 'district' },
  { no: 48, urdu: 'نارووال زون 2', en: 'Narowal Zone 2', zone: 'Zone 2', category: 'district' },
  { no: 49, urdu: 'ننکانہ', en: 'Nankana Sahib', category: 'district' },
  { no: 50, urdu: 'وہاڑی', en: 'Vehari', category: 'district' },
  { no: 51, urdu: 'صوبائی مصالحتی کمیٹی', en: 'Subai Masalhati Committee', category: 'committee' },
  { no: 52, urdu: 'جمعیت علمائے طاہریہ', en: 'Jamiat Ulema-e-Tahiriya', category: 'wing' },
  { no: 53, urdu: 'روحانی طلبہ جماعت پاکستان', en: 'Ruhani Tulba Jamaat Pakistan', category: 'wing' },
  { no: 54, urdu: 'خلفائے اکرام', en: 'Khulafa-e-Kiram', category: 'wing' },
];

/**
 * Generate official SheetTab objects for all 55 Punjab districts & zones
 */
export function generateOfficialPunjabSheets(projectId = 'jim-punjab-2026', projectName = 'JIM Punjab Official Districts & Zones 2026'): any[] {
  return JIM_PUNJAB_DISTRICTS_ZONES.map((item, index) => {
    // Generate clean slug ID like 'sheet-lahore-zone-1', 'sheet-multan', etc.
    const slug = item.en
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    const tabId = `sheet-${slug}`;

    return {
      id: tabId,
      name: `${item.en} (${item.urdu})`,
      nameUrdu: item.urdu,
      cityName: item.en,
      projectId: projectId,
      projectName: projectName,
      projectYear: '2026',
      typeFilter: 'all',
      color: item.category === 'central' ? '#b45309' : item.category === 'wing' ? '#047857' : '#0284c7',
      isCustom: true,
      periodType: 'template',
      sortOrder: index,
    };
  });
}
