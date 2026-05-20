import { AuthContext } from "../../context/AuthContext";
import "./FeedButton.css";
import { useCallback, useContext, useState, useEffect } from "react";

type FeedButtonProps = {
	onFeed: () => void | Promise<void>;
	disabled?: boolean;
};

const COOLDOWN_TIME_MS = 5000; // 5 seconds cooldown
const BACKEND_URL = "http://localhost:3000";

export default function FeedButton({ onFeed, disabled = false }: FeedButtonProps) {
	const { token } = useContext(AuthContext);
	const [cooldown, setCooldown] = useState(false);
	const [feeding, setFeeding] = useState(false);
	const [foodCount, setFoodCount] = useState(0);

	const getAuthHeaders = useCallback(
		() => ({
			"Content-Type": "application/json",
			...(token && { Authorization: `Bearer ${token}` }),
		}),
		[token]
	);

	const getFoodCount = useCallback(async () => {
		const response = await fetch(`${BACKEND_URL}/petAPI/getPet`, {
			headers: getAuthHeaders(),
		});

		if (!response.ok) {
			throw new Error("Failed to load pet food count");
		}

		const data = await response.json();
		const pet = data?.pet ?? data;
		const nextFoodCount = typeof pet?.food === "number" ? pet.food : 0;
		setFoodCount(nextFoodCount);
		return nextFoodCount;
	}, [getAuthHeaders]);

	useEffect(() => {
		const initialLoad = setTimeout(() => {
			void getFoodCount();
		}, 0);
		const interval = setInterval(getFoodCount, 10000);
		return () => {
			clearTimeout(initialLoad);
			clearInterval(interval);
		};
	}, [getAuthHeaders, token, getFoodCount]);

	const handleFeed = useCallback(async () => {
		if (cooldown || feeding) return;

		const latestFoodCount = await getFoodCount();
		if (latestFoodCount <= 0) {
			alert("You don't have any food to feed your pet!");
			return;
		}

		setCooldown(true);
		setFeeding(true);
		try {
			await onFeed();
			await getFoodCount();
		} finally {
			setFeeding(false);
			setTimeout(() => setCooldown(false), COOLDOWN_TIME_MS);
		}
	}, [cooldown, feeding, getFoodCount, onFeed]);

	return (
		<button
			className={`feed-button ${cooldown ? "cooldown" : ""}`}
			type="button"
			onClick={handleFeed}
			disabled={disabled || cooldown || feeding}
		>
			🌤 Feed Your Pet ({foodCount})
		</button>
	);
}
