import { useEffect, useRef, useState } from "react";
import { recolorImage } from "../../utils/recolorImage";
import "./Hat.css";

type HatData = {
	type: string;
	hue: number;
};

type HatProps = {
	petType: string;
	hat?: HatData | null;
};

export function Hat({ petType, hat }: HatProps) {
	const imgRef = useRef<HTMLImageElement>(null);
	const [recolored, setRecolored] = useState<string | null>(null);

	useEffect(() => {
		const img = imgRef.current;
		if (!img || !hat) {
			setRecolored(null);
			return;
		}

		const apply = () => setRecolored(recolorImage(img, hat.hue || 0));

		if (img.complete) apply();
		else img.addEventListener("load", apply);

		return () => img.removeEventListener("load", apply);
	}, [hat?.hue, hat?.type]);

	// No hat, don't render anything
	if (!hat) return null;
	return (
		<>
			{/* hidden original, used as canvas source */}
			<img
				className={`pet-hat ${petType || ""} ${hat.type || ""}`}
				alt="Original Hat"
				ref={imgRef}
				src={`/assets/hat_${hat.type}.png`}
				style={{ display: "none" }}
				crossOrigin="anonymous"
			/>
			{recolored && (
				<img className={`pet-hat ${petType || ""} ${hat.type || ""}`} src={recolored} alt="hat" />
			)}
		</>
	);
}
