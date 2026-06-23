/**
 * Canonical ministry list — shared by the member form and bulk-assign modal so
 * the options stay in sync across the app.
 */
export const MINISTRIES = [
  'Worship', 'Prayer', 'Youth', 'Evangelism', 'Children', 'Admin',
  'Finance', "Men's Ministry", "Women's Ministry", 'Ushering', 'Hospitality',
  'Choir', 'Media', 'Tech', 'Sunday School', 'Intercession', 'Stewardship',
  'Leadership', 'Discipleship',
] as const;

export type Ministry = (typeof MINISTRIES)[number];
