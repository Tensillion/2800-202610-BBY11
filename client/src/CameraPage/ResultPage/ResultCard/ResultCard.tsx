import "./ResultCard.css";

/**
 * Component for displaying the result of a plant identification, including scientific name, common names, family, edibility, and warnings.
 *
 * @param plantData - The data for the plant to display in the result card
 * @returns A card displaying the plant data, including scientific name, common names, family, edibility, and warnings
 *
 * @author Tyson Nguyen
 */
export default function ResultCard(props: {
	score: number;
	scientificName: string;
	commonNames: string[];
	family: string;
	edibility?: boolean | "unknown";
	parts?: string[];
	warnings?: string;
	matchedKey?: string | null;
}) {
	const percentMatch = (props.score * 100).toFixed(1);
	const edibilityLabel =
		props.edibility === true ? "Edible"
		: props.edibility === false ? "Not edible"
		: props.edibility === "unknown" ? "Unknown"
		: "No lookup";
	const badgeClass =
		props.edibility === true ? "edible"
		: props.edibility === false ? "not-edible"
		: props.edibility === "unknown" ? "unknown"
		: "no-lookup";

	return (
		<div className="result-card">
			<div className="result-card-header">
				<h3>{props.scientificName}</h3>
				<span className="match-score">{percentMatch}%</span>
			</div>

			<div className="result-badges">
				<span className={`edibility-badge ${badgeClass}`}>{edibilityLabel}</span>
				{props.matchedKey && <span className="lookup-badge">Lookup: {props.matchedKey}</span>}
			</div>

			{props.commonNames.length > 0 && (
				<p className="common-names">
					<strong>Common Names:</strong> {props.commonNames.join(", ")}
				</p>
			)}

			<p className="family">
				<strong>Family:</strong> {props.family}
			</p>

			{props.parts && props.parts.length > 0 && (
				<p className="parts">
					<strong>Edible Parts:</strong> {props.parts.join(", ")}
				</p>
			)}

			{props.warnings && (
				<p className="warnings">
					<strong>Notes:</strong> {props.warnings}
				</p>
			)}
		</div>
	);
}
