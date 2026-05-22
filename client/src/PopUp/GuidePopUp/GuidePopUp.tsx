import { useState } from "react";
import "./GuidePopUp.css";

/**
 * This is a moving component that will have
 * a state and different text on each state.
 * this will guide the user through the app and show them how to use it.
 * It will parse the given JSON file and display the text accordingly.
 *
 * @returns a guide pop-up component that can show the user around the screens and explain how to use the app.
 *
 * @author Tyson Nguyen
 */
export default function GuidePopUp(props: {
	steps: { x: string | number; y: string | number; title: string; message: string }[];
}) {
	const storageKey =
		"popup-dismissed?" + props.steps[0]?.title + props.steps[0]?.message.substring(0, 10);

	const [index, setIndex] = useState(0);

	const [isOpen, setIsOpen] = useState(() => {
		if (typeof window === "undefined") return true;
		return sessionStorage.getItem(storageKey) !== "true";
	});

	const handleNext = () => {
		if (index < props.steps.length - 1) {
			setIndex(index + 1);
		} else {
			setIsOpen(false);
			sessionStorage.setItem(storageKey, "true");
		}
	};

	if (!isOpen) return null;

	const { x, y, title, message } = props.steps[index];

	return (
		<div
			className="guide-popup"
			style={{
				left: x,
				top: y,
			}}
		>
			<div className="guide-popup-content">
				<p className="guide-popup-title">{title}</p>
				<p>{message}</p>
				<button onClick={handleNext} className="guide-next-button">
					Next
				</button>
			</div>
		</div>
	);
}
