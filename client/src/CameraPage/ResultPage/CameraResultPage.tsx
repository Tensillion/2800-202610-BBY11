import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./CameraResultPage.css";
import ResultCard from "./ResultCard/ResultCard";

const BACKEND_URL = "http://localhost:3000"; // Replace with actual backend URL when deployed

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
	const { state } = useLocation();
	const navigate = useNavigate();
	const imageBlob = state?.imageBlob;

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
	};
	//END OF TYPE DEFINITIONS

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

	//Helper function to normalize text for lookup, removes punctuation, converts to lowercase, etc.
	const normalizeText = (value: string) =>
		value
			.toLowerCase()
			.replace(/×/g, "x")
			.replace(/[^a-z0-9\s-]/g, " ")
			.replace(/\s+/g, " ")
			.trim();

	//Preprocess the edibility lookup data into a normalized form for easier matching
	const normalizedLookup = useMemo(() => {
		return Object.entries(edibilityLookup).reduce<
			Record<string, { key: string; value: EdibilityEntry }>
		>((accumulator, [key, value]) => {
			accumulator[normalizeText(key)] = { key, value };
			return accumulator;
		}, {});
	}, [edibilityLookup]);

	//Merge the plant identification results with the edibility lookup data,
	//matching by scientific name, genus, or scientific name without author, in that order of priority.
	const mergedResults = useMemo<ResultWithLookup[]>(() => {
		const scannedResults = result?.results ?? [];

		return [...scannedResults]
			.sort((left, right) => right.score - left.score)
			.map(item => {
				const candidates = [
					item.species.scientificNameWithoutAuthor,
					item.species.scientificName,
					item.species.genus.scientificName,
				].filter(Boolean);

				let lookupKey: string | null = null;
				let edibility: EdibilityEntry | null = null;

				for (const candidate of candidates) {
					const match = normalizedLookup[normalizeText(candidate)];
					if (match) {
						lookupKey = match.key;
						edibility = match.value;
						break;
					}
				}

				return {
					...item,
					lookupKey,
					edibility,
				};
			});
	}, [normalizedLookup, result]);

	//Gets the plant identification result from the backend with Pl@ntNet API
	useEffect(() => {
		if (result) {
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
	}, [imageBlob, navigate, result]);

	//Looks up at our data base for plants
	useEffect(() => {
		let cancelled = false;

		async function loadPlantReferenceData() {
			try {
				//Replace URL with backend endpoint when ready, this is just for testing
				const response = await fetch(`${BACKEND_URL}/plantData`);

				if (!response.ok) {
					throw new Error(`Failed to load plant reference data: ${response.status}`);
				}

				const json = (await response.json()) as EdibilityLookup;
				if (!cancelled) {
					setEdibilityLookup(json);
				}
			} catch (fetchError) {
				if (!cancelled) {
					console.error(fetchError);
					setEdibilityLookup({});
				}
			}
		}

		loadPlantReferenceData();

		return () => {
			cancelled = true;
		};
	}, []);

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
			<h1>Plant Identification Results</h1>
			{result.bestMatch && (
				<div className="best-match">
					<p className="best-match-label">Top Match:</p>
					<h2>{result.bestMatch}</h2>
				</div>
			)}

			<div className="results-grid">
				{mergedResults.length > 0 ?
					mergedResults.map((item, index) => (
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
