export const STYLE_OPTIONS = [
  { id: "painterly", label: "Painterly" },
  { id: "oil", label: "Oil Painting" },
  { id: "realism", label: "Realism" },
  { id: "watercolor", label: "Watercolor" },
  { id: "renaissance", label: "Renaissance" },
  { id: "anime", label: "Anime" },
  { id: "inkSketch", label: "Ink Sketch" },
  { id: "artNouveau", label: "Art Nouveau" },
  { id: "impressionist", label: "Impressionist" },
  { id: "gothic", label: "Gothic" },
];

export const STYLE_PROMPTS = {
  painterly: "painterly digital illustration, dramatic single-source lighting, muted literary color palette, textured canvas background",
  oil: "classical oil painting, visible brushstrokes and impasto texture, rich varnished color, Old Master studio lighting",
  realism: "photorealistic fine-art portrait painting, precise detail, natural soft lighting, neutral studio backdrop",
  watercolor: "loose watercolor painting, soft bleeding pigment edges, light paper texture, delicate transparent washes",
  renaissance: "Renaissance-era portrait painting, egg tempera and oil glazing technique, formal three-quarter pose, ornate period clothing, gilded soft background",
  anime: "anime and manga style illustration, clean cel-shaded linework, expressive eyes, flat vibrant color palette",
  inkSketch: "monochrome ink pen-and-wash sketch, crosshatched shading, loose expressive linework, aged paper texture",
  artNouveau: "Art Nouveau illustration, flowing ornamental linework, flat decorative color fields, floral motif border, styled after Alphonse Mucha",
  impressionist: "Impressionist oil painting, visible short brushstrokes, soft natural light, atmospheric color over hard detail",
  gothic: "gothic romantic oil painting, deep chiaroscuro shadow, candlelit atmosphere, moody desaturated palette",
};

export const DEFAULT_STYLE = "painterly";
