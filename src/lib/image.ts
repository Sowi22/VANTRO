/**
 * imgur sirve miniaturas agregando una letra al id de la foto
 * (https://api.imgur.com/models/image): m = 320 px, l = 640 px.
 * Las fotos de la hoja llegan en tamaño original (~200 KB cada una); pedir
 * la miniatura adecuada reduce mucho lo que descarga un celular.
 * Cualquier otra URL se devuelve sin cambios.
 */
const IMGUR_RE = /^(https:\/\/i\.imgur\.com\/)([A-Za-z0-9]{7})(\.(?:jpe?g|png|webp))(\?.*)?$/i;

export type ImgurSize = "m" | "l";

export function imgurVariant(url: string, size: ImgurSize): string {
  const match = url.match(IMGUR_RE);
  if (!match) return url;
  return `${match[1]}${match[2]}${size}${match[3]}`;
}

/** `srcSet` responsivo para una foto de imgur; `undefined` si no es de imgur. */
export function imgurSrcSet(url: string): string | undefined {
  if (!IMGUR_RE.test(url)) return undefined;
  return `${imgurVariant(url, "m")} 320w, ${imgurVariant(url, "l")} 640w`;
}
