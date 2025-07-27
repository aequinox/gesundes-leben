import satori from "satori";

import { SITE } from "@/config";

import { loadGoogleFonts } from "../loadGoogleFont";

import {
  OG_COLORS,
  OG_IMAGE_DIMENSIONS,
  OG_LAYOUT,
  OG_TYPOGRAPHY,
} from "./constants";

export default async () => {
  return satori(
    {
      type: "div",
      props: {
        style: {
          background: OG_COLORS.site.background,
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        },
        children: [
          {
            type: "div",
            props: {
              style: {
                position: "absolute",
                top: "-1px",
                right: "-1px",
                border: `${OG_LAYOUT.borderWidth} solid ${OG_COLORS.site.border}`,
                background: OG_COLORS.site.shadowBackground,
                opacity: OG_LAYOUT.opacity.shadowLayer,
                borderRadius: OG_LAYOUT.borderRadius,
                display: "flex",
                justifyContent: "center",
                margin: OG_LAYOUT.margin.shadow,
                width: "88%",
                height: "80%",
              },
            },
          },
          {
            type: "div",
            props: {
              style: {
                border: `${OG_LAYOUT.borderWidth} solid ${OG_COLORS.site.border}`,
                background: OG_COLORS.site.background,
                borderRadius: OG_LAYOUT.borderRadius,
                display: "flex",
                justifyContent: "center",
                margin: OG_LAYOUT.margin.outer,
                width: "88%",
                height: "80%",
              },
              children: {
                type: "div",
                props: {
                  style: {
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    margin: OG_LAYOUT.margin.inner,
                    width: "90%",
                    height: "90%",
                  },
                  children: [
                    {
                      type: "div",
                      props: {
                        style: {
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "center",
                          alignItems: "center",
                          height: "90%",
                          maxHeight: "90%",
                          overflow: "hidden",
                          textAlign: "center",
                        },
                        children: [
                          {
                            type: "p",
                            props: {
                              style: {
                                fontSize: OG_TYPOGRAPHY.sizes.title.site,
                                fontWeight: OG_TYPOGRAPHY.weights.bold,
                              },
                              children: SITE.title,
                            },
                          },
                          {
                            type: "p",
                            props: {
                              style: { fontSize: OG_TYPOGRAPHY.sizes.subtitle },
                              children: SITE.desc,
                            },
                          },
                        ],
                      },
                    },
                    {
                      type: "div",
                      props: {
                        style: {
                          display: "flex",
                          justifyContent: "flex-end",
                          width: "100%",
                          marginBottom: "8px",
                          fontSize: OG_TYPOGRAPHY.sizes.subtitle,
                        },
                        children: {
                          type: "span",
                          props: {
                            style: {
                              overflow: "hidden",
                              fontWeight: OG_TYPOGRAPHY.weights.bold,
                            },
                            children: new URL(SITE.website).hostname,
                          },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
        ],
      },
    },
    {
      width: OG_IMAGE_DIMENSIONS.width,
      height: OG_IMAGE_DIMENSIONS.height,
      embedFont: true,
      fonts: await loadGoogleFonts(SITE.title + SITE.desc + SITE.website),
    }
  );
};
