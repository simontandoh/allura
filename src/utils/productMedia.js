import { PRESET_PRODUCT_IMAGES } from "../constants/productImages.js";
import { normalizeColorFamily } from "./colorMapping.js";

const lookup = PRESET_PRODUCT_IMAGES.reduce((acc, media) => {
  acc[media.id] = media.url;
  return acc;
}, {});

const KEYWORD_IMAGE_MAP = [
  { key: "onyx", matches: ["black", "onyx", "noir", "ebony", "midnight", "jet", "raven"] },
  { key: "ember", matches: ["copper", "auburn", "ember", "ginger", "blonde", "gold"] },
  { key: "honey", matches: ["brown", "brunette", "honey", "espresso", "chocolate", "mocha"] },
];

export function inferImageKey(product = {}) {
  const normalizedFamily = normalizeColorFamily(product.colorFamily);
  const haystack = `${product.name || ""} ${normalizedFamily || product.colorFamily || ""} ${
    product.collectionName || ""
  }`.toLowerCase();
  const matched = KEYWORD_IMAGE_MAP.find(({ matches }) =>
    matches.some((token) => haystack.includes(token))
  );
  return matched?.key || null;
}

export function resolveProductImage(product, index = 0) {
  if (!product) return PRESET_PRODUCT_IMAGES[0].url;

  if (product.imageKey && lookup[product.imageKey]) {
    return lookup[product.imageKey];
  }

  const inferred = inferImageKey(product);
  if (inferred && lookup[inferred]) {
    return lookup[inferred];
  }

  if (product.image) return product.image;
  if (Array.isArray(product.images) && product.images[0]) return product.images[0];

  return PRESET_PRODUCT_IMAGES[index % PRESET_PRODUCT_IMAGES.length].url;
}

export function getStockStatus(stock) {
  const qty = Number(stock) || 0;
  if (qty <= 0) return "Out of stock";
  if (qty < 10) return "Low stock";
  return "In stock";
}
