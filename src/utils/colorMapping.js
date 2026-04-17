const COLOR_REMAP = {
  midnight: "Midnight",
  black: "Midnight",
  onyx: "Midnight",
  noir: "Midnight",
  ebony: "Midnight",
  jet: "Midnight",
  raven: "Midnight",
  copper: "Copper",
  auburn: "Copper",
  ginger: "Copper",
  blonde: "Copper",
  gold: "Copper",
  caramel: "Copper",
  honey: "Brown",
  brunette: "Brown",
  brown: "Brown",
  chocolate: "Brown",
  espresso: "Brown",
  chestnut: "Brown",
  mocha: "Brown",
};

const capitalize = (value) => {
  if (!value) return value;
  return value
    .split(" ")
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1).toLowerCase())
    .join(" ");
};

export function normalizeColorFamily(value) {
  if (!value) return value;
  const key = String(value).trim().toLowerCase();
  return COLOR_REMAP[key] || capitalize(value);
}
