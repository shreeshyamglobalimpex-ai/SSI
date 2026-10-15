/**
 * Global export & delivery locations.
 *
 * Single source of truth used across the store product pages and any marketing
 * copy so the list never drifts between screens.
 */
export const EXPORT_LOCATIONS = [
  "USA",
  "UK",
  "Europe",
  "Australia",
  "Switzerland",
  "Russia",
  "China",
  "Philippines",
  "Singapore",
] as const;

export type ExportLocation = (typeof EXPORT_LOCATIONS)[number];
