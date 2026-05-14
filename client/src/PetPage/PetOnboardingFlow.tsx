import { useState } from "react";
import "./PetPageOnboarding.css";

interface PetOnboardingFlowProps {
	onComplete: (petName: string, petType: string) => Promise<void>;
}

const PET_TYPES = ["Acorn", "Mushroom", "Berry"];

const PetOnboardingFlow = ({ onComplete }: PetOnboardingFlowProps) => {
	const [currentStep, setCurrentStep] = useState(0);
	const [selectedPetIndex, setSelectedPetIndex] = useState(0);
	const [petName, setPetName] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const selectedPetType = PET_TYPES[selectedPetIndex];

	const handlePrevPet = () => {
		setSelectedPetIndex(prev => (prev === 0 ? PET_TYPES.length - 1 : prev - 1));
		setError(null);
	};

	const handleNextPet = () => {
		setSelectedPetIndex(prev => (prev === PET_TYPES.length - 1 ? 0 : prev + 1));
		setError(null);
	};

	const handleNextFromSelection = () => {
		setCurrentStep(1);
		setError(null);
	};

	const handleConfirmType = () => {
		setCurrentStep(2);
		setError(null);
	};

	const handleNameSubmit = () => {
		if (petName.trim().length === 0) {
			setError("Please enter a pet name");
			return;
		}
		if (petName.trim().length > 20) {
			setError("Pet name must be 20 characters or less");
			return;
		}
		setCurrentStep(3);
		setError(null);
	};

	const handleFinalConfirm = async () => {
		if (!selectedPetType || !petName.trim()) {
			setError("Please complete all fields");
			return;
		}

		setIsLoading(true);
		setError(null);

		try {
			await onComplete(petName.trim(), selectedPetType);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to create pet. Please try again.");
			setIsLoading(false);
		}
	};

	const handleBack = () => {
		if (currentStep > 0) {
			setCurrentStep(currentStep - 1);
			setError(null);
		}
	};

	// Step 0: Pet Selection with Carousel
	if (currentStep === 0) {
		return (
			<div className="pet-onboarding-container">
				<div className="pet-onboarding-content">
					<h1>Choose Your Pet</h1>
					<p className="pet-onboarding-subtitle">Pick your companion to start your journey!</p>

					<div className="pet-carousel">
						<button
							className="pet-carousel-button pet-carousel-button-prev"
							onClick={handlePrevPet}
							aria-label="Previous pet"
						>
							◀
						</button>

						<div className="pet-carousel-display">
							<img
								src={`/assets/pets/${selectedPetType}.png`}
								alt={selectedPetType}
								className="pet-carousel-image"
								key={selectedPetType}
							/>
						</div>

						<button
							className="pet-carousel-button pet-carousel-button-next"
							onClick={handleNextPet}
							aria-label="Next pet"
						>
							▶
						</button>
					</div>

					<div className="pet-carousel-indicator">
						{PET_TYPES.map((_, index) => (
							<div
								key={index}
								className={`pet-carousel-dot ${index === selectedPetIndex ? "active" : ""}`}
							></div>
						))}
					</div>

					<h3 className="pet-carousel-name">{selectedPetType}</h3>

					{error && <div className="pet-error-message">{error}</div>}

					<div className="pet-button-group">
						<button className="pet-button pet-button-primary" onClick={handleNextFromSelection}>
							I Choose You!
						</button>
					</div>
				</div>
			</div>
		);
	}

	// Step 1: Type Confirmation
	if (currentStep === 1) {
		return (
			<div className="pet-onboarding-container">
				<div className="pet-onboarding-modal">
					<button className="pet-close-button" onClick={handleBack}>
						← Back
					</button>

					<img
						src={`/assets/pets/${selectedPetType}.png`}
						alt={selectedPetType}
						className="pet-confirmation-image"
					/>

					<h2>Are you sure?</h2>
					<p className="pet-confirmation-text">
						Do you want a <strong>{selectedPetType}</strong> as your pet companion?
					</p>

					{error && <div className="pet-error-message">{error}</div>}

					<div className="pet-button-group">
						<button className="pet-button pet-button-secondary" onClick={handleBack}>
							Back
						</button>
						<button className="pet-button pet-button-primary" onClick={handleConfirmType}>
							Yes, Continue
						</button>
					</div>
				</div>
			</div>
		);
	}

	// Step 2: Name Input
	if (currentStep === 2) {
		return (
			<div className="pet-onboarding-container">
				<div className="pet-onboarding-modal">
					<button className="pet-close-button" onClick={handleBack}>
						← Back
					</button>

					<h2>Name Your Pet</h2>
					<p className="pet-confirmation-text">
						What would you like to name your {selectedPetType}?
					</p>

					<div className="pet-form-group">
						<div className="pet-input-wrapper">
							<input
								type="text"
								className="pet-name-input"
								placeholder="Enter a name..."
								value={petName}
								onChange={e => setPetName(e.target.value)}
								maxLength={20}
								disabled={isLoading}
								autoFocus
								onKeyDown={e => {
									if (e.key === "Enter" && petName.trim().length > 0 && !isLoading) {
										handleNameSubmit();
									}
								}}
							/>
						</div>
						<p className="pet-input-hint">{petName.length}/20 characters</p>
					</div>

					{error && <div className="pet-error-message">{error}</div>}

					<div className="pet-button-group">
						<button
							className="pet-button pet-button-secondary"
							onClick={handleBack}
							disabled={isLoading}
						>
							Back
						</button>
						<button
							className="pet-button pet-button-primary"
							onClick={handleNameSubmit}
							disabled={petName.trim().length === 0 || isLoading}
						>
							Next
						</button>
					</div>
				</div>
			</div>
		);
	}

	// Step 3: Final Confirmation
	if (currentStep === 3) {
		return (
			<div className="pet-onboarding-container">
				<div className="pet-onboarding-modal">
					<button className="pet-close-button" onClick={handleBack} disabled={isLoading}>
						← Back
					</button>

					<img
						src={`/assets/pets/${selectedPetType}.png`}
						alt={selectedPetType}
						className="pet-confirmation-image"
					/>

					<h2>Ready to Adopt!</h2>
					<p className="pet-confirmation-text">
						Meet <strong>{petName}</strong> the <strong>{selectedPetType}</strong>!
					</p>
					<p className="pet-subtext">
						Your new companion is ready to start an amazing adventure with you.
					</p>

					{error && <div className="pet-error-message">{error}</div>}

					<div className="pet-button-group">
						<button
							className="pet-button pet-button-secondary"
							onClick={handleBack}
							disabled={isLoading}
						>
							Back
						</button>
						<button
							className="pet-button pet-button-primary"
							onClick={handleFinalConfirm}
							disabled={isLoading}
						>
							{isLoading ? "Creating..." : "Confirm & Create Pet"}
						</button>
					</div>
				</div>
			</div>
		);
	}

	return null;
};

export default PetOnboardingFlow;
