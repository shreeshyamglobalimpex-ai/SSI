import type { Brand, Company } from "@/types/company";

export const company: Company = {
  name: "Shree Shyam International",
  legalStatus: "Partnership",
  businessType: "Trader - Retailer",
  additionalBusiness: ["Retail Business Export", "Wholesale Business Import"],
  ceo: "Kaustubh Borkar",
  registeredAddress:
    "Plot No. 95, Vikas Society, Manish Nagar, Nagpur - 440015, Maharashtra, India",
  employees: "Up to 10 people",
  gstRegistrationDate: "06 October 2022",
  turnover: "₹0–40 Lakh",
  gstNumber: "27AEUFS7697P1ZE",
  iec: "AEUFS7697P",
  mission:
    "To improve global healthcare accessibility by exporting a wide range of generic and branded medicines, exceeding customer expectations and building lasting partnerships.",
  vision:
    "To set new standards of excellence in pharmaceutical export through product quality, customer service and global reach.",
};

const brandNames = [
  "Cipla",
  "Centurion Remedies",
  "Evolve Biolab",
  "Sunrise Remedies",
  "Healing Pharma",
  "American Remedies",
  "Hab Pharma",
  "Signature Pharma",
  "Kacchela",
  "Alkem Laboratories",
  "Aurobindo Pharma Ltd",
  "Divis Laboratories Ltd",
  "Lupin Limited",
  "Abbott",
  "GlaxoSmithKline",
  "Sun Pharmaceutical Industries",
  "Zydus Lifesciences Ltd",
  "Alembic Pharmaceuticals",
  "Emcure",
  "AbbVie",
  "Abiogen Pharma",
  "ACG Group",
  "Adare Pharmaceuticals",
  "Cadila Pharmaceuticals",
  "Eli Lilly and Company",
  "Glenmark Pharmaceuticals",
  "Intas",
  "Merck",
  "Piramal Enterprises Limited",
] as const;

const INDIA_MART_BASE_URL =
  "https://www.indiamart.com/shree-shyam-international-nagpur/search.html";

export const brands: Brand[] = brandNames
  .map((name) => ({
    name,
    storeLink: `${INDIA_MART_BASE_URL}?ss=${encodeURIComponent(name)}&src=man`,
  }))
  .sort((a, b) => a.name.localeCompare(b.name));

export const groupedBrands = brands.reduce<Record<string, Brand[]>>(
  (groups, brand) => {
    const letter = brand.name.charAt(0).toUpperCase();

    if (!groups[letter]) {
      groups[letter] = [];
    }

    groups[letter].push(brand);

    return groups;
  },
  {}
);

export type MarketRegion =
  | "Americas"
  | "Europe"
  | "Middle East"
  | "Asia & Africa";

export interface Market {
  name: string;
  code: string;
  flag: string;
  region: MarketRegion;
}

export const markets: Market[] = [
  // ─────────────────────────────────────────────
  // AMERICAS
  // ─────────────────────────────────────────────
  {
    name: "United States of America",
    code: "US",
    flag: "🇺🇸",
    region: "Americas",
  },
  {
    name: "Canada",
    code: "CA",
    flag: "🇨🇦",
    region: "Americas",
  },
  {
    name: "Mexico",
    code: "MX",
    flag: "🇲🇽",
    region: "Americas",
  },
  {
    name: "Puerto Rico",
    code: "PR",
    flag: "🇵🇷",
    region: "Americas",
  },
  {
    name: "Colombia",
    code: "CO",
    flag: "🇨🇴",
    region: "Americas",
  },
  {
    name: "Chile",
    code: "CL",
    flag: "🇨🇱",
    region: "Americas",
  },
  {
    name: "Brazil",
    code: "BR",
    flag: "🇧🇷",
    region: "Americas",
  },
  {
    name: "Jamaica",
    code: "JM",
    flag: "🇯🇲",
    region: "Americas",
  },

  // ─────────────────────────────────────────────
  // EUROPE
  // ─────────────────────────────────────────────
  {
    name: "United Kingdom",
    code: "GB",
    flag: "🇬🇧",
    region: "Europe",
  },
  {
    name: "Switzerland",
    code: "CH",
    flag: "🇨🇭",
    region: "Europe",
  },
  {
    name: "France",
    code: "FR",
    flag: "🇫🇷",
    region: "Europe",
  },
  {
    name: "Poland",
    code: "PL",
    flag: "🇵🇱",
    region: "Europe",
  },
  {
    name: "Germany",
    code: "DE",
    flag: "🇩🇪",
    region: "Europe",
  },
  {
    name: "Italy",
    code: "IT",
    flag: "🇮🇹",
    region: "Europe",
  },
  {
    name: "Spain",
    code: "ES",
    flag: "🇪🇸",
    region: "Europe",
  },
  {
    name: "Portugal",
    code: "PT",
    flag: "🇵🇹",
    region: "Europe",
  },
  {
    name: "Belgium",
    code: "BE",
    flag: "🇧🇪",
    region: "Europe",
  },
  {
    name: "Greece",
    code: "GR",
    flag: "🇬🇷",
    region: "Europe",
  },
  {
    name: "The Netherlands",
    code: "NL",
    flag: "🇳🇱",
    region: "Europe",
  },
  {
    name: "Sweden",
    code: "SE",
    flag: "🇸🇪",
    region: "Europe",
  },
  {
    name: "Norway",
    code: "NO",
    flag: "🇳🇴",
    region: "Europe",
  },
  {
    name: "Ireland",
    code: "IE",
    flag: "🇮🇪",
    region: "Europe",
  },
  {
    name: "Romania",
    code: "RO",
    flag: "🇷🇴",
    region: "Europe",
  },
  {
    name: "Bulgaria",
    code: "BG",
    flag: "🇧🇬",
    region: "Europe",
  },
  {
    name: "Slovakia",
    code: "SK",
    flag: "🇸🇰",
    region: "Europe",
  },
  {
    name: "North Macedonia",
    code: "MK",
    flag: "🇲🇰",
    region: "Europe",
  },

  // ─────────────────────────────────────────────
  // MIDDLE EAST
  // ─────────────────────────────────────────────
  {
    name: "Saudi Arabia",
    code: "SA",
    flag: "🇸🇦",
    region: "Middle East",
  },
  {
    name: "United Arab Emirates",
    code: "AE",
    flag: "🇦🇪",
    region: "Middle East",
  },
  {
    name: "Qatar",
    code: "QA",
    flag: "🇶🇦",
    region: "Middle East",
  },
  {
    name: "Kuwait",
    code: "KW",
    flag: "🇰🇼",
    region: "Middle East",
  },
  {
    name: "Oman",
    code: "OM",
    flag: "🇴🇲",
    region: "Middle East",
  },
  {
    name: "Bahrain",
    code: "BH",
    flag: "🇧🇭",
    region: "Middle East",
  },
  {
    name: "Yemen",
    code: "YE",
    flag: "🇾🇪",
    region: "Middle East",
  },
  {
    name: "Jordan",
    code: "JO",
    flag: "🇯🇴",
    region: "Middle East",
  },
  {
    name: "Iraq",
    code: "IQ",
    flag: "🇮🇶",
    region: "Middle East",
  },
  {
    name: "Israel",
    code: "IL",
    flag: "🇮🇱",
    region: "Middle East",
  },
  {
    name: "Lebanon",
    code: "LB",
    flag: "🇱🇧",
    region: "Middle East",
  },

  // ─────────────────────────────────────────────
  // ASIA & AFRICA
  // ─────────────────────────────────────────────
  {
    name: "India",
    code: "IN",
    flag: "🇮🇳",
    region: "Asia & Africa",
  },
  {
    name: "Egypt",
    code: "EG",
    flag: "🇪🇬",
    region: "Asia & Africa",
  },
  {
    name: "Malaysia",
    code: "MY",
    flag: "🇲🇾",
    region: "Asia & Africa",
  },
  {
    name: "Thailand",
    code: "TH",
    flag: "🇹🇭",
    region: "Asia & Africa",
  },
  {
    name: "Japan",
    code: "JP",
    flag: "🇯🇵",
    region: "Asia & Africa",
  },
  {
    name: "Russia",
    code: "RU",
    flag: "🇷🇺",
    region: "Asia & Africa",
  },
  {
    name: "Singapore",
    code: "SG",
    flag: "🇸🇬",
    region: "Asia & Africa",
  },
  {
    name: "Hong Kong",
    code: "HK",
    flag: "🇭🇰",
    region: "Asia & Africa",
  },
  {
    name: "Australia",
    code: "AU",
    flag: "🇦🇺",
    region: "Asia & Africa",
  },
  {
    name: "China",
    code: "CN",
    flag: "🇨🇳",
    region: "Asia & Africa",
  },
  {
    name: "South Korea",
    code: "KR",
    flag: "🇰🇷",
    region: "Asia & Africa",
  },
  {
    name: "United States Minor Outlying Islands",
    code: "UM",
    flag: "🇺🇲",
    region: "Asia & Africa",
  },
  {
    name: "Democratic Republic of the Congo",
    code: "CD",
    flag: "🇨🇩",
    region: "Asia & Africa",
  },
  {
    name: "Vietnam",
    code: "VN",
    flag: "🇻🇳",
    region: "Asia & Africa",
  },
  {
    name: "Algeria",
    code: "DZ",
    flag: "🇩🇿",
    region: "Asia & Africa",
  },
  {
    name: "Mauritius",
    code: "MU",
    flag: "🇲🇺",
    region: "Asia & Africa",
  },
  {
    name: "Turkey",
    code: "TR",
    flag: "🇹🇷",
    region: "Asia & Africa",
  },
  {
    name: "Cameroon",
    code: "CM",
    flag: "🇨🇲",
    region: "Asia & Africa",
  },
  {
    name: "Philippines",
    code: "PH",
    flag: "🇵🇭",
    region: "Asia & Africa",
  },
  {
    name: "New Zealand",
    code: "NZ",
    flag: "🇳🇿",
    region: "Asia & Africa",
  },
  {
    name: "Kenya",
    code: "KE",
    flag: "🇰🇪",
    region: "Asia & Africa",
  },
];