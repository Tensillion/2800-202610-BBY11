import { useState } from "react";
import "./Pet.css";
import { HeartExplosion } from "./HeartExplosion";

export default function Pet({ imageUrl }: { imageUrl: string }) {
	const [explosions, setExplosions] = useState<{ id: number; x: number; y: number }[]>([]);
	const [cooldown, setCooldown] = useState(false);
	const [nextId, setNextId] = useState(0);

	function clickEffect(e: React.MouseEvent<HTMLImageElement>) {
		if (cooldown) return;

		setCooldown(true);
		setTimeout(() => setCooldown(false), 500);

		const rect = e.currentTarget.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const y = e.clientY - rect.top;

		const id = nextId;
		setNextId(id + 1);

		setExplosions(prev => [...prev, { id, x, y }]);

		// remove after animation
		setTimeout(() => {
			setExplosions(prev => prev.filter(ex => ex.id !== id));
		}, 1500);
	}

	return (
		<div style={{ position: "relative", display: "inline-block" }}>
			<img src={imageUrl} id="pet-image" onClick={clickEffect} alt="Pet" />

			{explosions.map(ex => (
				<HeartExplosion key={ex.id} x={ex.x} y={ex.y} />
			))}
		</div>
	);
}
