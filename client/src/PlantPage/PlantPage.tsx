import { useLocation } from "react-router-dom";
import AskAIPopUp from "../CataloguePage/AskAIPopUp/AskAIPopUp";
import "./PlantPage.css";

function PlantPage() {
	const location = useLocation();
	const food = location.state?.food;

	const parts = food.parts ?? [];
	const commonNames = food.common_names ?? [];

	if (!food) {
		return <div>Sorry no food found sad face</div>;
	}

	return (
		<div className="plant-page">
			<div className="plant-page-card">
				<h3>{commonNames.join(", ")}</h3>
				<p className="plant-info">
					<b>Scientific:</b> {food.scientific_name}
				</p>
				<p className="plant-info">
					<b>Edible:</b> {food.edible ? "Yes" : "No"}
				</p>
				<p className="plant-info">
					<b>Parts:</b> {parts.length ? parts.join(", ") : "None listed"}{" "}
				</p>
				<p className="plant-info">
					<b>Warnings:</b> {food.warnings || "None in database. Investigate!"}
				</p>
				<div className="plant-page-actions">
					<AskAIPopUp plantInfo={food} />
				</div>
			</div>
		</div>
	);
}

export default PlantPage;
