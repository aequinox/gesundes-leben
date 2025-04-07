import satori from "satori";
import type { CollectionEntry } from "astro:content";
import { SITE } from "@/config";
import loadGoogleFonts, { type FontOptions } from "@/utils/loadGoogleFont";
import { authorService } from "@/services/content/AuthorService";

// Enhanced color palette with modern design principles
const COLORS = {
  light: {
    background: "#ffffff",
    text: "#1a1a1a",
    textSecondary: "#555555",
    accent: "#3b5bdb",
    card: "#ffffff",
    cardMuted: "#f5f5f5",
    border: "#e5e7eb",
    shadow: "rgba(0, 0, 0, 0.08)",
  },
  dark: {
    background: "#1c1b22",
    text: "#f2f2f2",
    textSecondary: "#b0b0b0",
    accent: "#ffa94d",
    card: "#2d2b37",
    cardMuted: "#3d3a4a",
    border: "#4d4a5a",
    shadow: "rgba(0, 0, 0, 0.2)",
  },
  // Type-specific colors with enhanced contrast
  types: {
    pro: {
      primary: "#4c9a52",
      secondary: "#e6f4e6",
      text: "#ffffff",
    },
    kontra: {
      primary: "#d24545",
      secondary: "#fbe7e7",
      text: "#ffffff",
    },
    fragezeiten: {
      primary: "#e6b422",
      secondary: "#fef7e6",
      text: "#ffffff",
    },
  },
};

export default async (post: CollectionEntry<"blog">) => {
  const authorEntry = await authorService.getAuthorEntry(post.data.author);
  const authorName = authorEntry?.data?.name || SITE.author;

  // Determine if post is pro, contra, or fragezeiten
  const postType = post.data.group || "";

  // Get type-specific colors or default to accent
  const typeColorSet = COLORS.types[postType as keyof typeof COLORS.types] || {
    primary: COLORS.light.accent,
    secondary: "#f0f4ff",
    text: "#ffffff",
  };

  // Prepare category labels
  const categories = (post.data.categories || []).slice(0, 3);

  // Prepare all text content for font loading
  const allText = [
    post.data.title,
    authorName,
    SITE.title,
    postType,
    ...categories,
  ].join(" ");

  return satori(
    <div
      style={{
        background: COLORS.light.background,
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Montserrat",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Modern background with subtle pattern */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `linear-gradient(135deg, ${COLORS.light.background} 0%, ${COLORS.light.cardMuted} 100%)`,
          opacity: 0.7,
        }}
      />

      {/* Decorative elements - subtle geometric shapes */}
      <div
        style={{
          position: "absolute",
          top: "-10%",
          right: "-5%",
          width: "300px",
          height: "300px",
          borderRadius: "50%",
          background: typeColorSet.secondary,
          opacity: 0.15,
        }}
      />

      <div
        style={{
          position: "absolute",
          bottom: "-15%",
          left: "-10%",
          width: "400px",
          height: "400px",
          borderRadius: "50%",
          background: typeColorSet.secondary,
          opacity: 0.1,
        }}
      />

      {/* Main content card with enhanced glass effect */}
      <div
        style={{
          position: "relative",
          background: `rgba(255, 255, 255, 0.92)`,
          backdropFilter: "blur(12px)",
          borderRadius: "24px",
          boxShadow: `0 8px 32px ${COLORS.light.shadow}`,
          border: `1px solid ${COLORS.light.border}`,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "48px",
          width: "88%",
          height: "76%",
          overflow: "hidden",
          zIndex: 10,
        }}
      >
        {/* Top section with post type indicator */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "24px",
          }}
        >
          {/* Left side accent bar */}
          <div
            style={{
              width: "80px",
              height: "6px",
              background: typeColorSet.primary,
              borderRadius: "3px",
            }}
          />

          {/* Post type badge - with icon and text */}
          {postType && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                background: typeColorSet.primary,
                color: typeColorSet.text,
                padding: "8px 16px",
                borderRadius: "20px",
                fontSize: 16,
                fontWeight: "bold",
                boxShadow: `0 2px 8px ${COLORS.light.shadow}`,
              }}
            >
              {/* Circle icon */}
              <div
                style={{
                  width: "12px",
                  height: "12px",
                  borderRadius: "50%",
                  background: "#ffffff",
                  marginRight: "8px",
                }}
              />
              {/* Use ASCII text for the type to ensure rendering */}
              {postType.toUpperCase()}
            </div>
          )}
        </div>

        {/* Title section */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "28px",
            marginBottom: "auto",
          }}
        >
          <h1
            style={{
              fontSize: 68,
              fontWeight: "bold",
              color: COLORS.light.text,
              lineHeight: 1.15,
              letterSpacing: "-0.02em",
            }}
          >
            {post.data.title}
          </h1>

          {/* Categories/tags with enhanced styling */}
          {categories.length > 0 && (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "10px",
              }}
            >
              {categories.map((category: string) => (
                <span
                  style={{
                    background: typeColorSet.secondary,
                    color: typeColorSet.primary,
                    padding: "6px 14px",
                    borderRadius: "8px",
                    fontSize: 16,
                    fontWeight: "medium",
                    boxShadow: `0 2px 4px ${COLORS.light.shadow}`,
                  }}
                >
                  {category}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Footer with enhanced styling */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
            borderTop: `1px solid ${COLORS.light.border}`,
            paddingTop: "24px",
            marginTop: "24px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
            }}
          >
            {/* Author avatar with enhanced styling */}
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                background: typeColorSet.primary,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff",
                fontSize: 20,
                fontWeight: "bold",
                boxShadow: `0 2px 8px ${COLORS.light.shadow}`,
                border: "2px solid white",
              }}
            >
              {authorName.charAt(0).toUpperCase()}
            </div>

            {/* Author name */}
            <span
              style={{
                fontSize: 20,
                fontWeight: "medium",
                color: COLORS.light.text,
              }}
            >
              {authorName}
            </span>
          </div>

          {/* Site name with enhanced styling */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span
              style={{
                fontSize: 20,
                fontWeight: "bold",
                color: typeColorSet.primary,
              }}
            >
              {SITE.title}
            </span>

            {/* Small decorative element */}
            <div
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: typeColorSet.primary,
              }}
            />
          </div>
        </div>
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
      embedFont: true,
      fonts: (await loadGoogleFonts(allText, [
        {
          name: "Montserrat",
          font: "Montserrat",
          weight: 400,
          style: "normal",
        },
        {
          name: "Montserrat",
          font: "Montserrat:wght@500",
          weight: 500,
          style: "normal",
        },
        {
          name: "Montserrat",
          font: "Montserrat:wght@700",
          weight: 700,
          style: "normal",
        },
      ])) as FontOptions[],
    }
  );
};
