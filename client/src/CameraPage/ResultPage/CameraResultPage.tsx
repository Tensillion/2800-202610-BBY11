import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './CameraResultPage.css';

/**
 * Represents the result page for the camera scan.
 * This page receives the image blob from the camera page,
 * sends it to the backend for plant identification, and displays the result.
 *
 * TODO: Design a nice result page, it just dumps the JSON for now.
 *
 * @author Tyson Nguyen
 *
 * @returns The Result page of the scan
 */
export default function CameraResultPage() {
	const { state } = useLocation();
	const navigate = useNavigate();
	const imageBlob = state?.imageBlob;

	// Initialize result from sessionStorage to avoid re-fetching on refresh
	const [result, setResult] = useState<Record<string, unknown> | null>(() => {
		const cached = sessionStorage.getItem('plantIdentificationResult');
		return cached ? JSON.parse(cached) : null;
	});

	const [loading, setLoading] = useState(() => {
		// Don't load if we already have a cached result
		return !sessionStorage.getItem('plantIdentificationResult');
	});

	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		// If we already have a result, don't call the API again
		if (result) {
			return;
		}

		if (!imageBlob) {
			navigate('/camera');
			return;
		}

		//IMPORTANT, this allows the fetch to be cancelled, to prevent memory leaks
		const controller = new AbortController();

		async function identifyPlant() {
			try {
				const formData = new FormData();
				formData.append('image', imageBlob);

				//Replace URL with backend endpoint when ready idk what its gonna be but this is for testing
				const res = await fetch('http://localhost:3000/plantIdentification', {
					method: 'POST',
					body: formData,
					signal: controller.signal,
				});

				if (!res.ok) {
					throw new Error(`Server error: ${res.status} ${res.statusText}`);
				}

				const json = await res.json();
				setResult(json);
				setError(null);
				// Cache the result so refreshing doesn't call the API again
				sessionStorage.setItem('plantIdentificationResult', JSON.stringify(json));
			} catch (err) {
				if (err instanceof Error && err.name !== 'AbortError') {
					console.error(err);
					setError(err.message || 'Failed to identify plant. Please try again.');
				}
			} finally {
				setLoading(false);
			}
		}

		identifyPlant();

		return () => controller.abort();
	}, [imageBlob, navigate, result]);

	//TODO: make a cool loading screen spinner thing.
	if (loading) {
		return (
			<div className="loading-screen">
				<div className="spinner" />
				<p>Identifying plant…</p>
			</div>
		);
	}

	if (error) {
		return (
			<div className="result-container">
				<h1>Scan Failed</h1>
				<div className="result-error">{error}</div>
				<button
					onClick={() => {
						sessionStorage.removeItem('plantIdentificationResult');
						navigate('/camera');
					}}
					style={{ marginTop: '20px' }}
				>
					Try Again
				</button>
			</div>
		);
	}

	return (
		<div className="result-container">
			<h1>Scan Result</h1>
			<div className="result-data">
				<pre>{JSON.stringify(result, null, 2)}</pre>
			</div>
			<button
				onClick={() => {
					sessionStorage.removeItem('plantIdentificationResult');
					navigate('/camera');
				}}
				style={{ marginTop: '20px' }}
			>
				Take Another Photo
			</button>
		</div>
	);
}
