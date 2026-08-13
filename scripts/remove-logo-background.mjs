import sharp from "sharp";
import path from "node:path";

// Los renders originales del logo no tienen canal alfa: el fondo es negro
// sólido "horneado" en la imagen (no transparente). Esto lo convierte en
// transparencia real: como el arte (rojo/blanco) siempre es más claro que
// el fondo negro, usamos el canal más brillante de cada píxel como alfa
// (negro puro -> alfa 0; rojo/blanco -> alfa alto), con un pequeño boost
// para que el rojo del logo no quede semitransparente.
async function removeBlackBackground(inputPath, outputPath) {
  const image = sharp(inputPath).ensureAlpha();
  const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;

  for (let i = 0; i < width * height; i++) {
    const idx = i * channels;
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];
    const brightness = Math.max(r, g, b);
    data[idx + 3] = Math.min(255, Math.round(brightness * 1.35));
  }

  await sharp(data, { raw: { width, height, channels } })
    .png({ quality: 90 })
    .toFile(outputPath);
}

const brandDir = path.resolve("public/brand");
const appDir = path.resolve("src/app");

await removeBlackBackground(path.join(brandDir, "logo-full.png"), path.join(brandDir, "logo-full.png"));
await removeBlackBackground(path.join(brandDir, "logo-icon.png"), path.join(brandDir, "logo-icon.png"));
await removeBlackBackground(path.join(appDir, "icon.png"), path.join(appDir, "icon.png"));
await removeBlackBackground(path.join(appDir, "apple-icon.png"), path.join(appDir, "apple-icon.png"));

console.log("Fondos removidos: logo-full.png, logo-icon.png, icon.png, apple-icon.png");
