// import { html } from "satori-html";
import { defaultLang } from "../../i18n/ui";
import { useTranslations } from "../../i18n/utils";
import { getAuthorDisplayName } from "../authors";
import { loadGoogleFonts } from "../loadGoogleFont";
import { logger } from "../logger";
import type { Post } from "../types";
import { SITE } from "@/config";
import satori from "satori";

const COLORS = {
  light: {
    background: "#ffffff",
    backgroundGradient: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
    text: "#1a1a1a",
    textSecondary: "#555555",
    accent: "#3b5bdb",
    card: "#ffffff",
    cardMuted: "#f5f5f5",
    border: "#e5e7eb",
    shadow: "rgba(0, 0, 0, 0.08)",
    glassShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
    glassBackground: "rgba(255, 255, 255, 0.95)",
  },
  dark: {
    background: "#1c1b22",
    backgroundGradient: "linear-gradient(135deg, #1c1b22 0%, #2d2b37 100%)",
    text: "#f2f2f2",
    textSecondary: "#b0b0b0",
    accent: "#ffa94d",
    card: "#2d2b37",
    cardMuted: "#3d3a4a",
    border: "#4d4a5a",
    shadow: "rgba(0, 0, 0, 0.2)",
  },
  // Type-specific colors with enhanced vibrance for 2025 design trends
  types: {
    pro: {
      primary: "#4CAF50",
      secondary: "#E8F5E9",
      gradient: "linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)",
      text: "#ffffff",
    },
    kontra: {
      primary: "#F44336",
      secondary: "#FFEBEE",
      gradient: "linear-gradient(135deg, #F44336 0%, #C62828 100%)",
      text: "#ffffff",
    },
    fragezeiten: {
      primary: "#FFC107",
      secondary: "#FFF8E1",
      gradient: "linear-gradient(135deg, #FFC107 0%, #FFA000 100%)",
      text: "#ffffff",
    },
  },
};

export default async (post: Post) => {
  const title = post.data.title;
  const author = await getAuthorDisplayName(post.data.author as string);
  logger.log(`Generating OG image for post: ${title} by ${author}`);

  // Set up translations (use default language for OG images)
  const t = useTranslations(defaultLang);
  const authorLabel = t("author.name");

  // Determine if post is pro, contra, or fragezeiten
  const postType = "group" in post.data ? post.data.group : "";

  // Get type-specific colors or default to accent
  const typeColorSet = COLORS.types[postType as keyof typeof COLORS.types] || {
    primary: COLORS.light.accent,
    secondary: "#f0f4ff",
    gradient: `linear-gradient(135deg, ${COLORS.light.accent} 0%, #2b4bb2 100%)`,
    text: "#ffffff",
  };

  // Determine the display text based on the color (more reliable than using the postType directly)
  let displayText = "ARTIKEL";
  if (typeColorSet.primary === COLORS.types.pro.primary) {
    displayText = "PRO";
  } else if (typeColorSet.primary === COLORS.types.kontra.primary) {
    displayText = "KONTRA";
  } else if (typeColorSet.primary === COLORS.types.fragezeiten.primary) {
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
          fontFamily: "Poppins",
          position: "relative",
          overflow: "hidden",
          background: COLORS.light.backgroundGradient,
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
                filter: "blur(15px)",
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
                filter: "blur(5px)",
              },
            },
          },
          // Main content card
          {
            type: "div",
            props: {
              style: {
                position: "relative",
                background: COLORS.light.glassBackground,
                backdropFilter: "blur(20px)",
                borderRadius: "5px",
                boxShadow: COLORS.light.glassShadow,
                border: `1px solid ${COLORS.light.border}`,
                // border: `1px solid ${typeColorSet.primary}`,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                padding: "48px",
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
                                padding: "8px 16px",
                                borderRadius: "5px",
                                fontSize: 14,
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
                            padding: "12px 24px",
                            borderRadius: "5px",
                            fontSize: 16,
                            fontWeight: "bold",
                            boxShadow: "0 4px 15px rgba(0, 0, 0, 0.15)",
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
                            fontSize: 52,
                            fontWeight: 800,
                            color: COLORS.light.text,
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
                      borderTop: `2px solid ${COLORS.light.border}`,
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
                                        fontSize: 12,
                                        color: COLORS.light.textSecondary,
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
                                        fontSize: 18,
                                        fontWeight: "600",
                                        color: COLORS.light.text,
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
                            padding: "12px 24px",
                            borderRadius: "5px",
                            boxShadow: "0 2px 10px rgba(0, 0, 0, 0.08)",
                            border: `1px solid ${COLORS.light.border}`,
                          },
                          children: [
                            {
                              type: "span",
                              props: {
                                style: {
                                  fontSize: 20,
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
      width: 1200,
      height: 630,
      embedFont: true,
      fonts: await loadGoogleFonts(allText),
    }
  );
};
