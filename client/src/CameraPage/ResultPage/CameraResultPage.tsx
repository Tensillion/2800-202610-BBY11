import { useEffect, useMemo, useState, useContext, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./CameraResultPage.css";
import ResultCard from "./ResultCard/ResultCard";
import { AuthContext } from "../../context/AuthContext";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

//Types for the plant identification result and edibility lookup
type PlantIdentificationResult = {
	bestMatch: string;
	results: Array<{
		score: number;
		species: {
			scientificName: string;
			scientificNameWithoutAuthor: string;
			scientificNameAuthorship: string;
			commonNames: string[];
			family: {
				scientificName: string;
			};
			genus: {
				scientificName: string;
			};
		};
		gbif?: { id: string };
		powo?: { id: string };
	}>;
};

type EdibilityEntry = {
	edible: boolean | "unknown";
	parts: string[];
	warnings: string;
	sources: string[];
};

type EdibilityLookup = Record<string, EdibilityEntry>;

type ResultWithLookup = PlantIdentificationResult["results"][number] & {
	lookupKey: string | null;
	edibility: EdibilityEntry | null;
	_searchCandidates?: string[];
};

interface PetUpdatePayload {
	xp?: number;
	happiness?: number;
	food?: number;
}

//END OF TYPE DEFINITIONS

/**
 * Represents the result page for the camera scan.
 * This page receives the image blob from the camera page,
 * sends it to the backend for plant identification, and displays the result.
 *
 * @author Tyson Nguyen
 *
 * @returns The Result page of the scan
 *
 * @version 1.1 - Added results page designs, and edibility lookup integration with temp JSON DB.
 * @version 1.0 - Initial implementation with plant identification result display.
 */
export default function CameraResultPage() {
	const { token } = useContext(AuthContext);
	const { state } = useLocation();
	const navigate = useNavigate();
	const imageBlob = state?.imageBlob;
	const [newResult, setNewResult] = useState(false);
	const [hasPet, setHasPet] = useState<boolean | null>(null);

	const getAuthHeaders = useCallback(
		() => ({
			"Content-Type": "application/json",
			...(token && { Authorization: `Bearer ${token}` }),
		}),
		[token]
	);

	//State for the plant identification result, edibility lookup data, loading and error states
	const [result, setResult] = useState<PlantIdentificationResult | null>(() => {
		const cached = sessionStorage.getItem("plantIdentificationResult");
		return cached ? (JSON.parse(cached) as PlantIdentificationResult) : null;
	});
	const [edibilityLookup, setEdibilityLookup] = useState<EdibilityLookup>({});

	const [loading, setLoading] = useState(() => {
		return !sessionStorage.getItem("plantIdentificationResult");
	});

	const [error, setError] = useState<string | null>(null);
	//END OF STATE DEFINITIONS

	const loadUserPlants = useCallback(async () => {
		const response = await fetch(`${BACKEND_URL}/users/getUserData`, {
			method: "POST",
			headers: getAuthHeaders(),
		});

		if (!response.ok) {
			throw new Error("Failed to load user plants");
		}

		const data = await response.json();
		return (data?.user?.plants ?? data?.plants ?? []) as string[];
	}, [getAuthHeaders]);

	const getIdentifiedPlantName = useCallback(
		(plantResult: PlantIdentificationResult | null) =>
			plantResult?.results[0]?.species.scientificNameWithoutAuthor ?? null,
		[]
	);

	const syncRewardState = useCallback(
		async (plantResult: PlantIdentificationResult | null) => {
			const identifiedPlantName = getIdentifiedPlantName(plantResult);

			if (!identifiedPlantName) {
				return null;
			}

			const userPlants = await loadUserPlants();
			return {
				identifiedPlantName,
				isNew: !userPlants.includes(identifiedPlantName),
			};
		},
		[getIdentifiedPlantName, loadUserPlants]
	);

	const updatePetStats = useCallback(
		async (updates: PetUpdatePayload = {}) => {
			const response = await fetch(`${BACKEND_URL}/petAPI/updatePet`, {
				method: "POST",
				headers: getAuthHeaders(),
				body: JSON.stringify(updates),
			});

			if (!response.ok) {
				let errorMessage = "Failed to update pet (Cannot Add Food Reward)";
				try {
					const errorData = await response.json();
					errorMessage = errorData.error || errorMessage;
				} catch (parseErr) {
					console.error("Could not parse pet update error response:", parseErr);
				}
				throw new Error(errorMessage);
			}
		},
		[getAuthHeaders]
	);

	const gainReward = useCallback(
		async (plantResult?: PlantIdentificationResult | null, allowReward = true) => {
			if (!allowReward) {
				setNewResult(false);
				return;
			}

			const rewardState = await syncRewardState(plantResult ?? result);
			if (!rewardState) return;

			if (rewardState.isNew) {
				const addPlantResponse = await fetch(`${BACKEND_URL}/users/addPlant`, {
					method: "POST",
					headers: getAuthHeaders(),
					body: JSON.stringify({
						scientificNameWithoutAuthor: rewardState.identifiedPlantName,
					}),
				});

				if (!addPlantResponse.ok) {
					let errorMessage = "Failed to add plant to collection";
					try {
						const errorData = await addPlantResponse.json();
						errorMessage = errorData.error || errorMessage;
					} catch (parseErr) {
						console.error("Could not parse add plant error response:", parseErr);
					}
					throw new Error(errorMessage);
				}

				setNewResult(true);
				await updatePetStats({ food: 5 });
			} else {
				setNewResult(false);
				await updatePetStats({ food: 1 });
			}
		},
		[result, getAuthHeaders, syncRewardState, updatePetStats]
	);

	const refreshPetStatus = useCallback(async () => {
		try {
			const response = await fetch(`${BACKEND_URL}/petAPI/hasPet`, {
				method: "GET",
				headers: getAuthHeaders(),
			});

			if (!response.ok) {
				throw new Error("Failed to check pet status");
			}

			const data = await response.json();
			const petExists = Boolean(data.hasPet);
			setHasPet(petExists);
			return petExists;
		} catch (error) {
			console.error("Error checking pet status:", error);
			setHasPet(false);
			return false;
		}
	}, [getAuthHeaders]);

	//Merge plant identification results with edibility data from server
	const mergedResults = useMemo<ResultWithLookup[]>(() => {
		const scannedResults = result?.results ?? [];

		return scannedResults.map(item => {
			// Extract candidates for server search
			const candidates = [
				item.species.scientificNameWithoutAuthor,
				item.species.scientificName,
				item.species.genus.scientificName,
			].filter(Boolean);

			// Store the candidates to be sent to server
			return {
				...item,
				lookupKey: null,
				edibility: null,
				_searchCandidates: candidates, // temporary property for server search
			};
		});
	}, [result]);

	//Gets the plant identification result from the backend with Pl@ntNet API
	useEffect(() => {
		if (result) {
			void (async () => {
				const userHasPet = await refreshPetStatus();
				if (!userHasPet) {
					setNewResult(false);
					return;
				}

				const rewardState = await syncRewardState(result);
				if (rewardState) {
					setNewResult(rewardState.isNew);
				}
			})();
			return;
		}

		if (!imageBlob) {
			navigate("/camera");
			return;
		}

		//IMPORTANT, this allows the fetch to be cancelled, to prevent memory leaks
		const controller = new AbortController();

		async function identifyPlant() {
			try {
				const formData = new FormData();
				formData.append("image", imageBlob);

				//Replace URL with backend endpoint when ready idk what its gonna be but this is for testing
				const res = await fetch(`${BACKEND_URL}/plantIdentification`, {
					method: "POST",
					body: formData,
					signal: controller.signal,
				});

				if (!res.ok) {
					throw new Error(`Server error: ${res.status} ${res.statusText}`);
				}

				const json = await res.json();
				setResult(json);
				setError(null);
				sessionStorage.setItem("plantIdentificationResult", JSON.stringify(json));
				const userHasPet = await refreshPetStatus();
				if (userHasPet) {
					await gainReward(json, true);
				} else {
					setNewResult(false);
				}
			} catch (err) {
				if (err instanceof Error && err.name !== "AbortError") {
					console.error(err);
					setError(err.message || "Failed to identify plant. Please try again.");
				}
			} finally {
				setLoading(false);
			}
		}

		identifyPlant();

		return () => controller.abort();
	}, [imageBlob, navigate, gainReward, refreshPetStatus, result, syncRewardState]);

	//Fetch edibility data from server using plant search endpoint
	useEffect(() => {
		let cancelled = false;

		async function loadPlantEdibilityData() {
			try {
				if (mergedResults.length === 0) {
					setEdibilityLookup({});
					return;
				}

				// Collect all candidate names from the results
				const candidateNames = Array.from(
					new Set(mergedResults.flatMap(item => item._searchCandidates ?? []))
				);

				// Call the new search endpoint with parameters
				const response = await fetch(`${BACKEND_URL}/plants/search`, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						names: candidateNames,
						limit: 50,
						sortField: "scientific_name",
						sortOrder: 1,
					}),
				});

				if (!response.ok) {
					throw new Error(`Failed to search plants: ${response.status}`);
				}

				const plants = (await response.json()) as Array<
					EdibilityEntry & {
						name?: string;
						scientific_name?: string;
						scientificName?: string;
						common_names?: string[];
						commonNames?: string[];
					}
				>;

				// Map results by every usable plant name for quick lookup
				if (!cancelled) {
					const lookup = plants.reduce<EdibilityLookup>((acc, plant) => {
						const aliases = [
							plant.name,
							plant.scientific_name,
							plant.scientificName,
							...(plant.common_names ?? []),
							...(plant.commonNames ?? []),
						].filter((alias): alias is string => Boolean(alias));

						for (const alias of aliases) {
							acc[alias] = {
								edible: plant.edible,
								parts: plant.parts,
								warnings: plant.warnings,
								sources: plant.sources,
							};
						}
						return acc;
					}, {});
					setEdibilityLookup(lookup);
				}
			} catch (fetchError) {
				if (!cancelled) {
					console.error(fetchError);
					setEdibilityLookup({});
				}
			}
		}

		loadPlantEdibilityData();

		return () => {
			cancelled = true;
		};
	}, [mergedResults]);

	//Match results with edibility data (already sorted by server)
	const finalResults = useMemo<ResultWithLookup[]>(() => {
		return mergedResults.map(item => {
			const candidates = item._searchCandidates;
			let lookupKey: string | null = null;
			let edibility: EdibilityEntry | null = null;

			// If no candidates, return as is
			if (!candidates) {
				return { ...item, lookupKey, edibility };
			}

			// Find first matching plant name in edibility lookup
			for (const candidate of candidates) {
				if (edibilityLookup[candidate]) {
					lookupKey = candidate;
					edibility = {
						edible: edibilityLookup[candidate].edible,
						parts: edibilityLookup[candidate].parts,
						warnings: edibilityLookup[candidate].warnings,
						sources: edibilityLookup[candidate].sources,
					};
					break;
				}
			}

			return {
				...item,
				lookupKey,
				edibility,
			};
		});
	}, [mergedResults, edibilityLookup]);

	//Error/Loading States
	if (error) {
		return (
			<div className="result-container">
				<h1>Scan Failed Please Take Another Photo</h1>
				<div className="result-error">{error}</div>
				<button
					onClick={() => {
						sessionStorage.removeItem("plantIdentificationResult");
						navigate("/camera");
					}}
					className="result-action"
				>
					Try Again
				</button>
			</div>
		);
	}

	if (loading || !result) {
		return (
			<div className="loading-screen">
				<div className="spinner" />
				<p>Identifying plant…</p>
			</div>
		);
	}

	return (
		<div className="result-container">
			<h1>Plant Results</h1>
			{newResult && hasPet ?
				<div className="new-result">
					<p className="new-result-label">You found a new plant!</p>
					<p className="new-result-description">
						Your pet has been rewarded with a bonus of 5 food points for discovering a new plant!
					</p>
				</div>
			:	<p className="new-result-description">
					Your pet has been rewarded with a 1 food point for identifying a plant you've seen before!
				</p>
			}

			{result.bestMatch && (
				<div className="best-match">
					<p className="best-match-label">Top Match:</p>
					<h2>{result.bestMatch}</h2>
				</div>
			)}

			<div className="results-grid">
				{finalResults.length > 0 ?
					finalResults.map((item, index) => (
						<ResultCard
							key={index}
							score={item.score}
							scientificName={item.species.scientificName}
							commonNames={item.species.commonNames || []}
							family={item.species.family.scientificName}
							edibility={item.edibility?.edible}
							parts={item.edibility?.parts}
							warnings={item.edibility?.warnings}
							matchedKey={item.lookupKey}
						/>
					))
				:	<p className="empty-results">No results found.</p>}
			</div>

			<button
				onClick={() => {
					sessionStorage.removeItem("plantIdentificationResult");
					navigate("/camera");
				}}
				className="result-action"
			>
				Take Another Photo
			</button>
		</div>
	);
}
