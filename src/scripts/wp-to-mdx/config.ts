/**
 * Configuration constants and defaults for WordPress to MDX conversion
 */

export const CONVERSION_DEFAULTS = {
  // Content validation limits
  MAX_DESCRIPTION_LENGTH: 300,
  MAX_TITLE_LENGTH: 200,
  MAX_KEYWORDS: 15,
  MAX_TAG_LENGTH: 50,
  MIN_CONTENT_LENGTH: 100,
  MAX_REFERENCES: 50,

  // Network and performance settings
  IMAGE_DOWNLOAD_TIMEOUT: 30000, // 30 seconds
  MAX_RETRY_ATTEMPTS: 3,
  RETRY_DELAY_BASE: 1000, // Base delay in ms for exponential backoff
  MAX_RETRY_DELAY: 10000, // Maximum delay between retries
  CONCURRENT_BATCH_SIZE: 5, // Number of posts to process concurrently
  IMAGE_DOWNLOAD_DELAY: 100, // Delay between image downloads to avoid overwhelming server

  // Image processing settings
  DEFAULT_IMAGE_DIMENSIONS: {
    width: 800,
    height: 600,
    aspectRatio: 1.33,
  },

  // Image positioning thresholds
  VERY_WIDE_LANDSCAPE_THRESHOLD: 3.0, // 3:1 ratio - only these should be centered

  // File system settings
  BACKUP_TIMESTAMP_FORMAT: "YYYY-MM-DD-HHmmss",

  // Validation patterns
  SLUG_PATTERN: /^[a-z0-9-]+$/,
  FOLDER_PATH_PATTERN: /^\d{4}-\d{2}-\d{2}-.+$/,

  // Known authors for validation
  VALID_AUTHORS: ["kai-renner", "sandra-pfeiffer"],

  // Health-related German keywords for content analysis
  HEALTH_KEYWORDS: [
    "Gesundheit",
    "Ernährung",
    "Vitamine",
    "Mineralien",
    "Mikronährstoffe",
    "Immunsystem",
    "Darm",
    "Mikrobiom",
    "Probiotika",
    "Antioxidantien",
    "Omega-3",
    "Vitamin D",
    "Magnesium",
    "Zink",
    "Eisen",
    "B-Vitamine",
    "Homöopathie",
    "Naturheilkunde",
    "Heilpraktiker",
    "Wellness",
    "Prävention",
    "Therapie",
    "Diagnose",
    "Laborwerte",
  ],

  // Visionati AI defaults
  VISIONATI_DEFAULTS: {
    CACHE_FILE: "src/scripts/wp-to-mdx/visionati-cache.json",
    LANGUAGE: "de",
    MAX_ALT_TEXT_LENGTH: 125,
    BACKEND: "auto",
    ROLE: "Inspector",
    API_TIMEOUT: 30000,
    CREDITS_PER_IMAGE: 2,
  },

  // Visionati custom prompts for German health content
  VISIONATI_PROMPTS: {
    DEFAULT: `Analysiere dieses Bild für einen deutschen Gesundheitsblog. Erstelle:

1. ALTTEXT: Eine barrierefreie deutsche Bildbeschreibung (80-125 Zeichen) für Screenreader - präzise, informativ, ohne überflüssige Wörter wie "Bild von" oder "Foto zeigt"

2. DATEINAME: Einen SEO-optimierten deutschen Dateinamen mit Gesundheitsbegriffen (ohne Dateiendung) - verwende Bindestriche zwischen Wörtern, nur Kleinbuchstaben

Verwende relevante Fachbegriffe: Gesundheit, Ernährung, Vitamine, Mineralien, Mikronährstoffe, Immunsystem, Darm, Mikrobiom, Probiotika, Antioxidantien, Omega-3, Vitamin D, Magnesium, Zink, Eisen, B-Vitamine, Naturheilkunde, Wellness, Prävention, Therapie, Diagnose, Laborwerte.

Format: ALTTEXT: [description] @ DATEINAME: [filename]`,

    MEDICAL: `Analysiere dieses medizinische Bild für einen deutschen Gesundheitsblog mit wissenschaftlichem Fokus. Erstelle:

1. ALTTEXT: Eine fachlich präzise deutsche Bildbeschreibung (80-125 Zeichen) für Screenreader - verwende medizinische Terminologie korrekt

2. DATEINAME: Einen wissenschaftlich fundierten deutschen Dateinamen mit medizinischen Begriffen (ohne Dateiendung)

Fokus auf: Diagnose, Therapie, Laborwerte, medizinische Verfahren, Krankheitsbilder, Symptome, Behandlungsmethoden, klinische Studien.

Format: ALTTEXT: [description] @ DATEINAME: [filename]`,

    NUTRITION: `Analysiere dieses Ernährungsbild für einen deutschen Gesundheitsblog. Erstelle:

1. ALTTEXT: Eine appetitlich-informative deutsche Bildbeschreibung (80-125 Zeichen) für Screenreader

2. DATEINAME: Einen ernährungsfokussierten deutschen Dateinamen (ohne Dateiendung)

Fokus auf: Ernährung, Lebensmittel, Vitamine, Mineralien, Mikronährstoffe, Omega-3, Vitamin D, B-Vitamine, gesunde Rezepte, Nährstoffgehalt, Superfoods.

Format: ALTTEXT: [description] @ DATEINAME: [filename]`,

    WELLNESS: `Analysiere dieses Wellness-Bild für einen deutschen Gesundheitsblog. Erstelle:

1. ALTTEXT: Eine entspannend-motivierende deutsche Bildbeschreibung (80-125 Zeichen) für Screenreader

2. DATEINAME: Einen wellness-orientierten deutschen Dateinamen (ohne Dateiendung)

Fokus auf: Wellness, Entspannung, Stressabbau, Meditation, Yoga, Achtsamkeit, Work-Life-Balance, mentale Gesundheit, Prävention.

Format: ALTTEXT: [description] @ DATEINAME: [filename]`,

    SCIENTIFIC: `Analysiere dieses wissenschaftliche Bild für einen deutschen Gesundheitsblog mit Forschungsfokus. Erstelle:

1. ALTTEXT: Eine wissenschaftlich präzise deutsche Bildbeschreibung (80-125 Zeichen) für Screenreader

2. DATEINAME: Einen forschungsbasierten deutschen Dateinamen (ohne Dateiendung)

Fokus auf: Studien, Forschung, Mikrobiom, Probiotika, Antioxidantien, biochemische Prozesse, evidenzbasierte Medizin, klinische Forschung.

Format: ALTTEXT: [description] @ DATEINAME: [filename]`,
  },

  // Content sentiment keywords
  KONTRA_KEYWORDS: [
    "gefahr",
    "risiko",
    "problem",
    "schaden",
    "warnung",
    "achtung",
    "vermeiden",
    "stoppen",
    "nachteil",
    "negativ",
    "schlecht",
  ],

  PRO_KEYWORDS: [
    "vorteil",
    "nutzen",
    "gesund",
    "positiv",
    "fördern",
    "stärken",
    "verbessern",
    "helfen",
    "unterstützen",
    "empfehlen",
    "gut",
  ],

  FRAGE_KEYWORDS: [
    "frage",
    "warum",
    "wie",
    "was",
    "wann",
    "wo",
    "unsicher",
    "vielleicht",
    "möglich",
    "könnte",
    "eventuell",
  ],
} as const;

/**
 * Default category mapping for WordPress to Astro conversion
 */
export const DEFAULT_CATEGORY_MAPPING = {
  // German WordPress categories to Astro categories
  ernährung: ["Ernährung"],
  "ernährung & immunsystem": ["Ernährung", "Immunsystem"],
  immunsystem: ["Immunsystem"],
  gesundheit: ["Immunsystem"],
  lifestyle: ["Lifestyle & Psyche"],
  psyche: ["Lifestyle & Psyche"],
  "lifestyle & psyche": ["Lifestyle & Psyche"],
  mikronährstoffe: ["Mikronährstoffe"],
  vitamine: ["Mikronährstoffe"],
  mineralien: ["Mikronährstoffe"],
  organsysteme: ["Organsysteme"],
  wissenschaftliches: ["Wissenschaftliches"],
  studien: ["Wissenschaftliches"],
  wissenswertes: ["Wissenswertes"],
  tipps: ["Wissenswertes"],
  lesenswertes: ["Lesenswertes"],
  bücher: ["Lesenswertes"],
  buchempfehlung: ["Lesenswertes"],

  // Fallback for unmapped categories
  allgemein: ["Wissenswertes"],
  uncategorized: ["Wissenswertes"],
} as const;

/**
 * Default author mapping for WordPress to Astro conversion
 */
export const DEFAULT_AUTHOR_MAPPING = {
  KRenner: "kai-renner",
  Kai: "kai-renner",
  kai: "kai-renner",
  "kai renner": "kai-renner",
  Sandra: "sandra-pfeiffer",
  sandra: "sandra-pfeiffer",
  "sandra pfeiffer": "sandra-pfeiffer",
  admin: "kai-renner", // default fallback
} as const;

/**
 * Dangerous HTML elements and attributes to sanitize
 */
export const SECURITY_CONFIG = {
  DANGEROUS_ELEMENTS: [
    "script",
    "iframe",
    "embed",
    "object",
    "applet",
    "form",
    "input",
    "textarea",
    "button",
    "select",
    "option",
  ],

  DANGEROUS_ATTRIBUTES: [
    "onclick",
    "onload",
    "onerror",
    "onmouseover",
    "onmouseout",
    "onfocus",
    "onblur",
    "onchange",
    "onsubmit",
    "onkeydown",
    "onkeyup",
    "onkeypress",
  ],

  ALLOWED_FILENAME_CHARS: /[<>:"/\\|?*]/g,
} as const;
