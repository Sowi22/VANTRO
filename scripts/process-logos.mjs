import sharp from "sharp";
import path from "node:path";
import fs from "node:fs";

// El proyecto vive en la misma carpeta que los archivos de logo originales.
const srcDir = path.resolve(".");
const brandDir = path.resolve("public/brand");
const appDir = path.resolve("src/app");
fs.mkdirSync(brandDir, { recursive: true });

const fullSrc = path.join(srcDir, "LOGO CON NOMBRE.png");
const iconSrc = path.join(srcDir, "LOGO SIN NOMBRE.png");

// El trim automático por color cortaba las letras (el render tiene una
// iluminación degradada que oscurece la parte inferior de cada letra).
// Se usa un recorte manual estimado visualmente sobre el lienzo 1536x1024.
await sharp(fullSrc)
  .extract({ left: 130, top: 150, width: 1536 - 130 * 2, height: 680 })
  .resize({ width: 900 })
  .png({ quality: 90 })
  .toFile(path.join(brandDir, "logo-full.png"));

// El isotipo sí es un círculo bien centrado; el trim por color funciona.
const iconTrimmed = await sharp(iconSrc).trim({ threshold: 12 }).toBuffer();
await sharp(iconTrimmed)
  .resize({ width: 512, height: 512 })
  .png({ quality: 90 })
  .toFile(path.join(brandDir, "logo-icon.png"));

await sharp(iconTrimmed).resize(512, 512).png().toFile(path.join(appDir, "icon.png"));
await sharp(iconTrimmed).resize(180, 180).png().toFile(path.join(appDir, "apple-icon.png"));

const finalFull = await sharp(path.join(brandDir, "logo-full.png")).metadata();
const finalIcon = await sharp(path.join(brandDir, "logo-icon.png")).metadata();
console.log("logo-full.png:", finalFull.width, "x", finalFull.height);
console.log("logo-icon.png:", finalIcon.width, "x", finalIcon.height);
