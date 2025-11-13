/**
 * Content Series Configuration
 * Defines all content series and their associated posts
 */

export interface SeriesInfo {
  title: string;
  description: string;
  posts: string[];
}

export const CONTENT_SERIES = {
  "antivirale-strategien": {
    title: "Antivirale Strategien",
    description:
      "Umfassende Serie über natürliche und medizinische antivirale Ansätze",
    posts: [
      "2022-09-16-antivirale-strategien-teil-1",
      "2022-09-23-antivirale-strategien-teil-2",
    ],
  },
  mikronaehrstoffraeuber: {
    title: "Mikronährstoffräuber",
    description:
      "Serie über Faktoren, die wichtige Nährstoffe im Körper reduzieren",
    posts: [
      "2022-03-11-mikronaehrstoffraeuber-die-pille",
      "2022-07-02-mikronaehrstoffraeuber-medikamente",
      "2023-01-30-vitaminraeuber-antibiotika",
    ],
  },
  lesenswert: {
    title: "Lesenswert - Buchempfehlungen",
    description: "Kuratierte Sammlung wertvoller Gesundheitsbücher",
    posts: [
      "2022-04-02-lesenswert-cancer-and-the-new-biology-of-water",
      "2022-05-14-lesenswert-warum-es-so-schwierig-ist-sich-zu-aendern",
      "2022-08-02-lesenswert-wir-fressen-uns-zu-tode",
      "2022-11-16-lesenswert-eselsweisheit-augentraining",
      "2023-09-25-lesenswert-systemischer-ratgeber",
      "2023-11-17-lesenswert-einfach-lieben",
      "2024-01-16-lesenswert-der-kleine-eheretter",
      "2024-04-19-lesenswert-die-1-methode-minimale-veraenderung-maximale-wirkung",
      "2024-08-30-lesenswert-wuerde",
      "2025-01-24-lesenswert-das-bleibt-in-der-familie",
    ],
  },
  "top-listen": {
    title: "Top-Listen für Gesundheit",
    description: "Praktische Listen mit den besten Gesundheitstipps",
    posts: [
      "2023-08-01-top-5-darm-und-immunsystemstaerkung",
      "2023-08-14-top-lebensmittel-fuers-immunsystems",
      "2024-05-05-top-5-untersuchungen-und-laborwerte-fuer-deinen-gesundheits-tuev",
      "2025-05-06-top-entzuendungshemmende-lebensmittel",
    ],
  },
} as const;

export type SeriesId = keyof typeof CONTENT_SERIES;
