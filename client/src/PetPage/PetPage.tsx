import { useState, useEffect, useContext, useCallback } from "react";
import PopUp from "../PopUp/PopUp";
import PetOnboardingFlow from "./PetOnboardingFlow";
import { AuthContext } from "../context/AuthContext";
import PetStatDisplay from "./PetStatDisplay/PetStatDisplay";
import "./PetPage.css";
import Pet from "./Pet/Pet";

const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const guideSteps = [
	{
		x: "50%",
		y: "80%",
		title: "Feed Your Pet",
		message: "This is where you use the food to feed your pet.",
	},
	{
		x: "50%",
		y: "30%",
		title: "Keep Your Pet Healthy",
		message:
			"Make sure to feed your pet regularly and take care of it to keep it happy and healthy.",
	},
];

interface PetUpdatePayload {
	xp?: number;
	happiness?: number;
}

interface Pet {
	id?: string;
	name: string;
	type: string;
	xp: number;
	level: number;
	happiness: number;
}

function PetPage() {
	const { token } = useContext(AuthContext);
	const [hasPet, setHasPet] = useState<boolean | null>(null);
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

	const updatePetStats = useCallback(
		async (updates: PetUpdatePayload = {}) => {
			const response = await fetch(`${BACKEND_URL}/petAPI/updatePet`, {
				method: "POST",
				headers: getAuthHeaders(),
				body: JSON.stringify(updates),
			});

			if (!response.ok) {
				let errorMessage = "Failed to update pet";
				try {
					const errorData = await response.json();
					errorMessage = errorData.error || errorMessage;
				} catch (parseErr) {
					console.error("Could not parse pet update error response:", parseErr);
				}
				throw new Error(errorMessage);
			}

			const data = await response.json();
			// If the update endpoint returns the updated pet, keep it in state
			const returnedPet = data?.pet ?? data?.updatedPet ?? data?.petData;
			if (returnedPet) setPet(returnedPet);
			return data;
		},
		[getAuthHeaders]
	);

	const loadPet = useCallback(async () => {
		try {
			const response = await fetch(`${BACKEND_URL}/petAPI/getPet`, {
				method: "GET",
				headers: getAuthHeaders(),
			});

			if (!response.ok) throw new Error("Failed to load pet");

			const data = await response.json();
			const petData = data?.pet ?? data;
			setPet(petData ?? null);
			return petData;
		} catch (err) {
			console.error("Error loading pet:", err);
			setPet(null);
			throw err;
		}
	}, [getAuthHeaders]);

	const checkIfUserHasPet = useCallback(async () => {
		try {
			setLoading(true);
			const response = await fetch(`${BACKEND_URL}/petAPI/hasPet`, {
				method: "GET",
				headers: getAuthHeaders(),
			});

			if (!response.ok) {
				throw new Error("Failed to check pet status");
			}

			const data = await response.json();
			const petExists = Boolean(data.hasPet);
			if (petExists) {
				await updatePetStats();
				// Ensure we load the full pet for client use
				await loadPet();
			}
			setHasPet(petExists);
			setError(null);
		} catch (err) {
			console.error("Error fetching pet:", err);
			setError(err instanceof Error ? err.message : "An error occurred");
			setHasPet(null);
		} finally {
			setLoading(false);
		}
	}, [getAuthHeaders, updatePetStats, loadPet]);

	useEffect(() => {
		const loadPetStatus = async () => {
			await checkIfUserHasPet();

			if (hasPet) {
				await loadPet();
			}
		};

		void loadPetStatus();
	}, [checkIfUserHasPet, loadPet, hasPet]);

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

			const data = await response.json();
			const petData = data?.pet ?? data;
			if (petData) setPet(petData);
			setHasPet(true);
			setError(null);
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
					<div className="spinner" />
					<p>Loading...</p>
				</div>
			</>
		);
	}

	if (error) {
		return (
			<>
				<div style={{ textAlign: "center", padding: "2rem", color: "#c33" }}>
					<p>Error: {error}</p>
					<button onClick={() => checkIfUserHasPet()}>Try Again</button>
				</div>
			</>
		);
	}

	if (hasPet === false || pet === null) {
		return (
			<>
				<PetOnboardingFlow onComplete={handleOnboardingComplete} />
			</>
		);
	}

	return (
		<section id="PetPage">
			<PopUp
				title="Welcome to the Pet Page!"
				message="Feed your pet and take care of it to keep it happy and healthy."
				steps={guideSteps}
			/>

			<PetStatDisplay
				name={pet.name}
				xp={pet.xp}
				level={pet.level}
				happiness={Math.round(pet.happiness)}
			/>

			<div className="pet-scene">
				<Pet imageUrl={`/assets/pets/${pet.type}-pet-sitting.png`} />
			</div>
		</section>
	);
}

export default PetPage;
