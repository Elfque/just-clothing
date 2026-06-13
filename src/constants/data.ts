const FABRICS = [
  {
    id: "cotton",
    label: "Cotton",
    roughness: 0.88,
    metalness: 0.0,
    sheen: 0.3,
    sheenRough: 0.8,
    clearcoat: 0.0,
    weaveTile: 4,
  },
  {
    id: "silk",
    label: "Silk",
    roughness: 0.12,
    metalness: 0.02,
    sheen: 0.95,
    sheenRough: 0.15,
    clearcoat: 0.1,
    weaveTile: 6,
  },
  {
    id: "denim",
    label: "Denim",
    roughness: 0.97,
    metalness: 0.0,
    sheen: 0.08,
    sheenRough: 0.95,
    clearcoat: 0.0,
    weaveTile: 3,
  },
  {
    id: "leather",
    label: "Leather",
    roughness: 0.38,
    metalness: 0.0,
    sheen: 0.12,
    sheenRough: 0.5,
    clearcoat: 0.3,
    weaveTile: 2,
  },
  {
    id: "wool",
    label: "Wool",
    roughness: 0.95,
    metalness: 0.0,
    sheen: 0.55,
    sheenRough: 0.9,
    clearcoat: 0.0,
    weaveTile: 5,
  },
];

// const COLORS = [
//   { id: "ivory", label: "Ivory", hex: "#F5F0E8" },
//   { id: "midnight", label: "Midnight", hex: "#1a1f2e" },
//   { id: "terracotta", label: "Terracotta", hex: "#C1603A" },
//   { id: "sage", label: "Sage", hex: "#7A9E7E" },
//   { id: "slate", label: "Slate", hex: "#5C6B8A" },
//   { id: "blush", label: "Blush", hex: "#E8B4B0" },
//   { id: "gold", label: "Gold", hex: "#C9A96E" },
//   { id: "charcoal", label: "Charcoal", hex: "#3D3D3D" },
//   { id: "white", label: "White", hex: "#FFFFFF" },
//   { id: "navy", label: "Navy", hex: "#1B2A4A" },
//   { id: "crimson", label: "Crimson", hex: "#A31621" },
//   { id: "forest", label: "Forest", hex: "#2D6A4F" },
// ];

const COLORS = [
  // Core neutrals
  { id: "ivory", label: "Ivory", hex: "#F5F0E8" },
  { id: "sand", label: "Sand", hex: "#D4C5B0" },
  { id: "taupe", label: "Taupe", hex: "#B5A892" },
  { id: "charcoal", label: "Charcoal", hex: "#3D3D3D" },
  { id: "black", label: "Black", hex: "#1A1A1A" },

  // Earth tones
  { id: "terracotta", label: "Terracotta", hex: "#C1603A" },
  { id: "sage", label: "Sage", hex: "#7A9E7E" },
  { id: "olive", label: "Olive", hex: "#6B705C" },
  { id: "forest", label: "Forest", hex: "#2D6A4F" },

  // Cool blues & slates
  { id: "slate", label: "Slate", hex: "#5C6B8A" },
  { id: "dustyBlue", label: "Dusty Blue", hex: "#6C7A89" },
  { id: "navy", label: "Navy", hex: "#1B2A4A" },
  { id: "midnight", label: "Midnight", hex: "#1a1f2e" },

  // Warm & jewel
  { id: "blush", label: "Blush", hex: "#E8B4B0" },
  { id: "gold", label: "Gold", hex: "#C9A96E" },
  { id: "crimson", label: "Crimson", hex: "#A31621" },
  { id: "burgundy", label: "Burgundy", hex: "#6E1D2D" },
  { id: "emerald", label: "Emerald", hex: "#227C5D" },
  { id: "plum", label: "Plum", hex: "#5D3A5C" },
];

const STYLES = [
  { id: "tshirt", label: "T-Shirt" },
  { id: "hoodie", label: "Hoodie" },
  { id: "jacket", label: "Jacket" },
];
const SIZES = ["XS", "S", "M", "L", "XL"];

// const PATTERNS = [
//   { id: "none", label: "None", icon: "✕" },
//   { id: "stripes_h", label: "H-Stripes", icon: "☰" },
//   { id: "stripes_v", label: "V-Stripes", icon: "⦀" },
//   { id: "stripes_d", label: "Diagonal", icon: "⟋" },
//   { id: "checks", label: "Checks", icon: "⊞" },
//   { id: "houndstooth", label: "Houndstooth", icon: "◆" },
//   { id: "polka", label: "Polka Dots", icon: "⠿" },
//   { id: "herringbone", label: "Herringbone", icon: "⋈" },
//   { id: "argyle", label: "Argyle", icon: "◇" },
//   { id: "floral", label: "Floral", icon: "✿" },
//   { id: "geometric", label: "Geometric", icon: "⬡" },
//   { id: "camo", label: "Camo", icon: "⬟" },
// ];

const PATTERNS = [
  { id: "none", label: "None", icon: "◻️" },
  // Classic (enhanced)
  { id: "stripes_h", label: "Horizontal Stripes", icon: "━" },
  { id: "stripes_v", label: "Vertical Stripes", icon: "┃" },
  { id: "stripes_d", label: "Diagonal Stripes", icon: "╱" },
  { id: "checks", label: "Checkerboard", icon: "▦" },
  { id: "houndstooth", label: "Houndstooth", icon: "◈" },
  { id: "polka", label: "Polka Dots", icon: "●" },
  { id: "herringbone", label: "Herringbone", icon: "⋮⋱" },
  { id: "argyle", label: "Argyle", icon: "⬟" },
  { id: "floral", label: "Floral", icon: "🌼" },
  { id: "geometric", label: "Geometric", icon: "⬡" },
  { id: "camo", label: "Camouflage", icon: "🌿" },
  // New premium patterns
  { id: "paisley", label: "Paisley", icon: "🌀" },
  { id: "damask", label: "Damask", icon: "🏵️" },
  { id: "tartan", label: "Tartan / Plaid", icon: "🔲" },
  { id: "chevron", label: "Chevron", icon: "⚡" },
  { id: "hexagon", label: "Hexagon", icon: "⬡" },
  { id: "quatrefoil", label: "Quatrefoil", icon: "🍀" },
  { id: "moroccan", label: "Moroccan", icon: "⭐" },
  { id: "leopard", label: "Leopard", icon: "🐆" },
  { id: "zebra", label: "Zebra", icon: "🦓" },
  { id: "wave", label: "Wave", icon: "〰️" },
];

export { PATTERNS, COLORS, FABRICS, SIZES, STYLES };
