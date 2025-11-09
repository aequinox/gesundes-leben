import { Resvg } from "@resvg/resvg-js";

import postOgImage from "./og-templates/post";
import siteOgImage from "./og-templates/site";
import type { Post } from "./types";

function svgBufferToPngBuffer(svg: string): Uint8Array {
  const resvg = new Resvg(svg);
  const pngData = resvg.render();
  return pngData.asPng();
}

export async function generateOgImageForPost(post: Post): Promise<Uint8Array> {
  const svg = await postOgImage(post);
  return svgBufferToPngBuffer(svg);
}

export async function generateOgImageForSite(): Promise<Uint8Array> {
  const svg = await siteOgImage();
  return svgBufferToPngBuffer(svg);
}
