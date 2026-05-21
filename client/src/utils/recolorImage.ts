// utils/recolorImage.ts

/**
 * Converts RGB color values to HSL.
 *
 * @param r - Red component (0–255)
 * @param g - Green component (0–255)
 * @param b - Blue component (0–255)
 * @returns An array of HSL values (h: 0–359, s: 0–1, l: 0–1)
 */
function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
	r /= 255;
	g /= 255;
	b /= 255;
	const max = Math.max(r, g, b),
		min = Math.min(r, g, b);
	let h = 0,
		s = 0;
	const l = (max + min) / 2;

	if (max !== min) {
		const d = max - min;
		s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
		switch (max) {
			case r:
				h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
				break;
			case g:
				h = ((b - r) / d + 2) / 6;
				break;
			case b:
				h = ((r - g) / d + 4) / 6;
				break;
		}
	}
	return [h * 360, s, l];
}

/**
 * Converts HSL color values to RGB.
 *
 * @param h - Hue in degrees 0–359
 * @param s - Saturation 0–1
 * @param l - Lightness 0–1
 * @returns An array of RGB values (0–255)
 */
function hslToRgb(h: number, s: number, l: number): [number, number, number] {
	h /= 360;
	const hue2rgb = (p: number, q: number, t: number) => {
		if (t < 0) t += 1;
		if (t > 1) t -= 1;
		if (t < 1 / 6) return p + (q - p) * 6 * t;
		if (t < 1 / 2) return q;
		if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
		return p;
	};

	if (s === 0) {
		const v = Math.round(l * 255);
		return [v, v, v];
	}
	const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
	const p = 2 * l - q;
	return [
		Math.round(hue2rgb(p, q, h + 1 / 3) * 255),
		Math.round(hue2rgb(p, q, h) * 255),
		Math.round(hue2rgb(p, q, h - 1 / 3) * 255),
	];
}

/**
 * Recolors a loaded HTMLImageElement to a target hue.
 * Skips near-neutral pixels (black bands, grays) to preserve hat details.
 *
 * @param img         - The source image element (must be CORS-safe or same-origin)
 * @param targetHue   - Hue in degrees 0–359 to shift colored pixels toward
 * @param satThreshold - Pixels below this saturation are left untouched (default 0.12)
 * @returns           - A data URL of the recolored image (PNG)
 */
export function recolorImage(
	img: HTMLImageElement,
	targetHue: number,
	satThreshold = 0.12
): string {
	const canvas = document.createElement("canvas");
	canvas.width = img.naturalWidth;
	canvas.height = img.naturalHeight;

	const ctx = canvas.getContext("2d")!;
	ctx.drawImage(img, 0, 0);

	const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
	const data = imageData.data;

	for (let i = 0; i < data.length; i += 4) {
		const alpha = data[i + 3];
		if (alpha < 10) continue; // skip fully transparent

		const [, s, l] = rgbToHsl(data[i], data[i + 1], data[i + 2]);
		if (s < satThreshold) continue; // skip neutrals (black bands, shadows, grays)

		const [nr, ng, nb] = hslToRgb(targetHue, s, l);
		data[i] = nr;
		data[i + 1] = ng;
		data[i + 2] = nb;
		// alpha is preserved untouched
	}

	ctx.putImageData(imageData, 0, 0);
	return canvas.toDataURL("image/png");
}
