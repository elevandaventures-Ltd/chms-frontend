/**
 * church-branding.ts — Day 47/50: church branding + general settings,
 * denomination-driven ministry seeding, and custom member-profile fields.
 */

export type ChurchBranding = {
  logoUrl: string;
  accentColor: string;
  welcomeMessage: string;
};

export const defaultBranding: ChurchBranding = {
  logoUrl: '',
  accentColor: '#b25131',
  welcomeMessage: 'Welcome to Elevanda Chapel — we\'re glad you\'re here.',
};

export type ChurchGeneral = {
  denomination: string;
  timezone: string;
  currency: string;
  language: string;
};

export const defaultGeneral: ChurchGeneral = {
  denomination: 'pentecostal',
  timezone: 'Africa/Accra',
  currency: 'GHS',
  language: 'en',
};

export const DENOMINATIONS: { value: string; label: string }[] = [
  { value: 'catholic', label: 'Catholic' },
  { value: 'protestant', label: 'Protestant' },
  { value: 'evangelical', label: 'Evangelical' },
  { value: 'pentecostal', label: 'Pentecostal' },
  { value: 'anglican', label: 'Anglican' },
  { value: 'methodist', label: 'Methodist' },
  { value: 'baptist', label: 'Baptist' },
  { value: 'presbyterian', label: 'Presbyterian' },
  { value: 'orthodox', label: 'Orthodox' },
  { value: 'adventist', label: 'Adventist' },
  { value: 'charismatic', label: 'Charismatic' },
  { value: 'non_denominational', label: 'Non-denominational' },
  { value: 'other', label: 'Other' },
];

export const CURRENCIES = ['GHS', 'NGN', 'KES', 'ZAR', 'USD', 'EUR', 'GBP'];
export const LANGUAGES = [{ value: 'en', label: 'English' }, { value: 'fr', label: 'French' }, { value: 'sw', label: 'Swahili' }, { value: 'pt', label: 'Portuguese' }];

/** Default ministry set seeded per denomination when it's (re)selected — Day 50 review. */
export const DENOMINATION_DEFAULT_MINISTRIES: Record<string, string[]> = {
  catholic: ['Choir', 'Ushering', 'Sunday School', 'Hospitality', 'Prayer'],
  protestant: ['Worship', 'Prayer', 'Youth', 'Sunday School', 'Evangelism'],
  evangelical: ['Evangelism', 'Youth', 'Worship', 'Discipleship', 'Prayer'],
  pentecostal: ['Worship', 'Prayer', 'Intercession', 'Evangelism', 'Youth', "Men's Ministry", "Women's Ministry"],
  anglican: ['Choir', 'Ushering', 'Sunday School', 'Hospitality'],
  methodist: ['Choir', 'Youth', "Women's Ministry", 'Stewardship'],
  baptist: ['Worship', 'Discipleship', 'Youth', 'Evangelism', 'Sunday School'],
  presbyterian: ['Choir', 'Sunday School', 'Stewardship', 'Hospitality'],
  orthodox: ['Choir', 'Ushering', 'Hospitality'],
  adventist: ['Sunday School', 'Health Ministry', 'Youth', 'Stewardship'],
  charismatic: ['Worship', 'Intercession', 'Prayer', 'Media', 'Youth'],
  non_denominational: ['Worship', 'Youth', 'Children', 'Hospitality', 'Media'],
  other: ['Worship', 'Ushering', 'Hospitality'],
};

// ── Custom fields (Day 49) ────────────────────────────────────────────────────

export type CustomFieldType = 'text' | 'number' | 'date' | 'dropdown' | 'boolean';

export type ChurchCustomField = {
  id: string;
  label: string;
  type: CustomFieldType;
  options?: string[]; // dropdown only
  required: boolean;
  sortOrder: number;
};

export const defaultCustomFields: ChurchCustomField[] = [
  { id: 'cf-baptism-date', label: 'Baptism Date', type: 'date', required: false, sortOrder: 0 },
  { id: 'cf-cell-group', label: 'Cell Group', type: 'dropdown', options: ['North Cell', 'South Cell', 'East Cell', 'West Cell'], required: false, sortOrder: 1 },
];
