import { useState, useEffect, useContext, useCallback } from "react";
import Footer from "../Footer/Footer";
import PopUp from "../PopUp/PopUp";
import PetOnboardingFlow from "./PetOnboardingFlow";
import { AuthContext } from "../context/AuthContext";

interface Pet {
	_id: string;
	name: string;
	type: string;
	ownerId: string;
}

const guideSteps = [
	{
		x: "50%",
		y: 300,
		title: "Feed Your Pet",
		message: "This is where you use the food to feed your pet.",
	},
	{
		x: "70%",
		y: 150,
		title: "Shop for Accessories",
		message:
			"Staying active and taking care of your pet will earn you credits that you can use to customize your pet!",
	},
	{
		x: "50%",
		y: 120,
		title: "Keep Your Pet Healthy",
		message:
			"Make sure to feed your pet regularly and take care of it to keep it happy and healthy.",
	},
];

const BACKEND_URL = "http://localhost:3000";

function PetPage() {
	const { token } = useContext(AuthContext);
	const [pet, setPet] = useState<Pet | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const getAuthHeaders = useCallback(
		() => ({
			"Content-Type": "application/json",
			...(token && { Authorization: `Bearer ${token}` }),
		}),
		[token]
	);

	//Refetch pet data function for retrying after error
	const fetchPetData = async () => {
		try {
			setLoading(true);
			const response = await fetch(`${BACKEND_URL}/petAPI/getPet`, {
				method: "GET",
				headers: getAuthHeaders(),
			});

			if (!response.ok) {
				throw new Error("Failed to fetch pet data");
			}

			const data = await response.json();
			setPet(data.pet || null);
			setError(null);
		} catch (err) {
			console.error("Error fetching pet:", err);
			setError(err instanceof Error ? err.message : "An error occurred");
			setPet(null);
		} finally {
			setLoading(false);
		}
	};

	// Load pet data on component mount
	useEffect(() => {
		let isMounted = true;

		const loadPet = async () => {
			try {
				setLoading(true);
				const response = await fetch(`${BACKEND_URL}/petAPI/getPet`, {
					method: "GET",
					headers: getAuthHeaders(),
				});

				if (!response.ok) {
					throw new Error("Failed to fetch pet data");
				}

				const data = await response.json();
				if (isMounted) {
					setPet(data.pet || null);
					setError(null);
				}
			} catch (err) {
				if (isMounted) {
					console.error("Error fetching pet:", err);
					setError(err instanceof Error ? err.message : "An error occurred");
					setPet(null);
				}
			} finally {
				if (isMounted) {
					setLoading(false);
				}
			}
		};

		loadPet();

		return () => {
			isMounted = false;
		};
	}, [token, getAuthHeaders]);

	const handleOnboardingComplete = async (petName: string, petType: string) => {
		try {
			const response = await fetch(`${BACKEND_URL}/petAPI/addPet`, {
				method: "POST",
				headers: getAuthHeaders(),
				body: JSON.stringify({ name: petName, type: petType }),
			});

			if (!response.ok) {
				// Safely parse error response
				let errorMessage = "Failed to create pet";
				try {
					const errorData = await response.json();
					errorMessage = errorData.error || errorMessage;
				} catch (parseErr) {
					console.error("Could not parse error response:", parseErr);
				}
				throw new Error(errorMessage);
			}

			// Refresh pet data after successful creation
			const petResponse = await fetch(`${BACKEND_URL}/petAPI/getPet`, {
				method: "GET",
				headers: getAuthHeaders(),
			});

			if (petResponse.ok) {
				const data = await petResponse.json();
				setPet(data.pet || null);
				setError(null);
			}
		} catch (err) {
			const message = err instanceof Error ? err.message : "Failed to create pet";
			setError(message);
			throw err;
		}
	};

	if (loading) {
		return (
			<>
				<div style={{ textAlign: "center", padding: "2rem" }}>
					<p>Loading...</p>
				</div>
				<Footer />
			</>
		);
	}

	if (!pet) {
		return (
			<>
				<PetOnboardingFlow onComplete={handleOnboardingComplete} />
				<Footer />
			</>
		);
	}

	if (error) {
		return (
			<>
				<div style={{ textAlign: "center", padding: "2rem", color: "#c33" }}>
					<p>Error: {error}</p>
					<button onClick={() => fetchPetData()}>Try Again</button>
				</div>
				<Footer />
			</>
		);
	}

	return (
		<>
			<PopUp
				title="Welcome to the Pet Page!"
				message="Feed your pet and take care of it to keep it happy and healthy."
				steps={guideSteps}
			/>
			<Footer />
		</>
	);
}

export default PetPage;
