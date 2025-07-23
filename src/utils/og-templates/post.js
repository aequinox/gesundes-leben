// import { html } from "satori-html";
import satori from "satori";

import { SITE } from "@/config";

import { defaultLang } from "../../i18n/ui";
import { useTranslations } from "../../i18n/utils";
import { getAuthorDisplayName } from "../authors";
import { loadGoogleFonts } from "../loadGoogleFont";
import { logger } from "../logger";

import {
  OG_COLORS,
  OG_EFFECTS,
  OG_IMAGE_DIMENSIONS,
  OG_LAYOUT,
  OG_TYPOGRAPHY,
} from "./constants";

export default async post => {
  const title = post.data.title;
  const author = await getAuthorDisplayName(post.data.author);
  logger.log("Generating OG image for post:", title, "by", author);

  // Set up translations (use default language for OG images)
  const t = useTranslations(defaultLang);
  const authorLabel = t("author.name");

  // Determine if post is pro, contra, or fragezeiten
  const postType = "group" in post.data ? post.data.group : "";

  // Get type-specific colors or default to accent
  const typeColorSet = OG_COLORS.types[postType] || {
    primary: OG_COLORS.light.accent,
    secondary: "#f0f4ff",
    gradient: `linear-gradient(135deg, ${OG_COLORS.light.accent} 0%, #2b4bb2 100%)`,
    text: "#ffffff",
  };

  // Determine the display text based on the color (more reliable than using the postType directly)
  let displayText = "ARTIKEL";
  if (typeColorSet.primary === OG_COLORS.types.pro.primary) {
    displayText = "PRO";
  } else if (typeColorSet.primary === OG_COLORS.types.kontra.primary) {
    displayText = "KONTRA";
  } else if (typeColorSet.primary === OG_COLORS.types.fragezeiten.primary) {
    displayText = "FRAGEZEITEN";
  }

  // Prepare category labels
  const categories = (
    "categories" in post.data ? post.data.categories || [] : []
  ).slice(0, 3);

  // Prepare all text content for font loading
  const allText = [
    post.data.title,
    author,
    SITE.title,
    displayText,
    authorLabel,
    ...categories,
  ].join(" ");

  return satori(
    {
      type: "div",
      props: {
        style: {
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: OG_TYPOGRAPHY.fontFamily,
          position: "relative",
          overflow: "hidden",
          background: OG_COLORS.light.backgroundGradient,
        },
        children: [
          // Background decorative elements
          {
            type: "div",
            props: {
              style: {
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: `radial-gradient(circle at 70% 30%, ${typeColorSet.secondary}80 0%, transparent 50%)`,
                opacity: 0.6,
              },
            },
          },
          {
            type: "div",
            props: {
              style: {
                position: "absolute",
                top: "-10%",
                right: "-10%",
                width: "300px",
                height: "300px",
                borderRadius: "50%",
                background: typeColorSet.gradient,
                opacity: 0.2,
                filter: OG_EFFECTS.blur.decorative,
              },
            },
          },
          {
            type: "div",
            props: {
              style: {
                position: "absolute",
                bottom: "-15%",
                left: "-15%",
                width: "400px",
                height: "400px",
                borderRadius: "50%",
                background: typeColorSet.gradient,
                opacity: 0.1,
                filter: OG_EFFECTS.blur.decorativeLight,
              },
            },
          },
          // Main content card
          {
            type: "div",
            props: {
              style: {
                position: "relative",
                background: OG_COLORS.light.glassBackground,
                backdropFilter: OG_EFFECTS.blur.backdrop,
                borderRadius: OG_LAYOUT.borderRadius,
                boxShadow: OG_COLORS.light.glassShadow,
                border: `1px solid ${OG_COLORS.light.border}`,
                // border: `1px solid ${typeColorSet.primary}`,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                padding: OG_LAYOUT.padding.card,
                width: "90%",
                height: "80%",
                overflow: "hidden",
                zIndex: 10,
              },
              children: [
                // Top accent bar
                // {
                //   type: "div",
                //   props: {
                //     style: {
                //       position: "absolute",
                //       top: 0,
                //       left: 0,
                //       width: "100%",
                //       height: "4px",
                //       background: typeColorSet.gradient,
                //       borderRadius: "24px 24px 0 0",
                //     },
                //   },
                // },
                // Header section with badges
                {
                  type: "div",
                  props: {
                    style: {
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: "32px",
                      flexWrap: "wrap",
                      gap: "16px",
                    },
                    children: [
                      // Categories badges
                      {
                        type: "div",
                        props: {
                          style: {
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "8px",
                            flex: "1",
                          },
                          children: categories.map(category => ({
                            type: "span",
                            props: {
                              style: {
                                background: typeColorSet.secondary,
                                color: typeColorSet.primary,
                                padding: OG_LAYOUT.padding.badge,
                                borderRadius: OG_LAYOUT.borderRadius,
                                fontSize: OG_TYPOGRAPHY.sizes.category,
                                fontWeight: "600",
                                border: `1px solid ${typeColorSet.primary}20`,
                              },
                              children: category,
                            },
                          })),
                        },
                      },
                      // Article type badge
                      {
                        type: "div",
                        props: {
                          style: {
                            background: typeColorSet.gradient,
                            color: typeColorSet.text,
                            padding: OG_LAYOUT.padding.largeBadge,
                            borderRadius: OG_LAYOUT.borderRadius,
                            fontSize: OG_TYPOGRAPHY.sizes.badge,
                            fontWeight: "bold",
                            boxShadow: OG_LAYOUT.shadows.card,
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                          },
                          children: displayText,
                        },
                      },
                    ],
                  },
                },
                // Title section
                {
                  type: "div",
                  props: {
                    style: {
                      display: "flex",
                      flexDirection: "column",
                      gap: "20px",
                      marginBottom: "auto",
                      position: "relative",
                    },
                    children: [
                      // Decorative accent line
                      {
                        type: "div",
                        props: {
                          style: {
                            width: "60px",
                            height: "4px",
                            background: typeColorSet.gradient,
                            borderRadius: "2px",
                            marginBottom: "16px",
                          },
                        },
                      },
                      // Main title
                      {
                        type: "h1",
                        props: {
                          style: {
                            fontSize: OG_TYPOGRAPHY.sizes.title.post,
                            fontWeight: 800,
                            color: OG_COLORS.light.text,
                            lineHeight: 1.1,
                            letterSpacing: "-0.02em",
                            maxWidth: "95%",
                            margin: 0,
                          },
                          children: title,
                        },
                      },
                    ],
                  },
                },
                // Footer section
                {
                  type: "div",
                  props: {
                    style: {
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      width: "100%",
                      borderTop: `2px solid ${OG_COLORS.light.border}`,
                      paddingTop: "24px",
                      marginTop: "24px",
                    },
                    children: [
                      // Author section
                      {
                        type: "div",
                        props: {
                          style: {
                            display: "flex",
                            alignItems: "center",
                            gap: "16px",
                          },
                          children: [
                            // Author avatar
                            {
                              type: "div",
                              props: {
                                style: {
                                  width: "56px",
                                  height: "56px",
                                  borderRadius: "50%",
                                  background: typeColorSet.gradient,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  color: "#ffffff",
                                  fontSize: 24,
                                  fontWeight: "bold",
                                  boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
                                },
                                children: author.charAt(0).toUpperCase(),
                              },
                            },
                            // Author name
                            {
                              type: "div",
                              props: {
                                style: {
                                  display: "flex",
                                  flexDirection: "column",
                                  gap: "2px",
                                },
                                children: [
                                  {
                                    type: "span",
                                    props: {
                                      style: {
                                        fontSize:
                                          OG_TYPOGRAPHY.sizes.authorLabel,
                                        color: OG_COLORS.light.textSecondary,
                                        fontWeight: "500",
                                        // textTransform: "uppercase",
                                        letterSpacing: "0.5px",
                                      },
                                      children: authorLabel,
                                    },
                                  },
                                  {
                                    type: "span",
                                    props: {
                                      style: {
                                        fontSize: OG_TYPOGRAPHY.sizes.author,
                                        fontWeight: "600",
                                        color: OG_COLORS.light.text,
                                      },
                                      children: author,
                                    },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                      // Site branding
                      {
                        type: "div",
                        props: {
                          style: {
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                            background: "rgba(255, 255, 255, 0.9)",
                            padding: OG_LAYOUT.padding.branding,
                            borderRadius: OG_LAYOUT.borderRadius,
                            boxShadow: OG_LAYOUT.shadows.branding,
                            border: `1px solid ${OG_COLORS.light.border}`,
                          },
                          children: [
                            {
                              type: "span",
                              props: {
                                style: {
                                  fontSize: OG_TYPOGRAPHY.sizes.branding,
                                  fontWeight: "700",
                                  color: typeColorSet.primary,
                                },
                                children: SITE.title,
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
    {
      width: OG_IMAGE_DIMENSIONS.width,
      height: OG_IMAGE_DIMENSIONS.height,
      embedFont: true,
      fonts: await loadGoogleFonts(allText),
    }
  );
};
