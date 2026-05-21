import AskAIPopUp from "../CataloguePage/AskAIPopUp/AskAIPopUp";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import type { Plant } from "../CataloguePage/PlantData";
import "./PlantPage.css";

function PlantPage() {
  const { id } = useParams();
  const [food, setFood] = useState<Plant | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_BACKEND_URL}/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setFood(data);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return <div className="loading-state">Loading...</div>;
  }

  if (!food) {
    return <div className="error-state">Plant not found.</div>;
  }

  console.log(food);
  const parts = food.parts ?? [];
  const commonNames = food.common_names ?? [];

  return (
    <div className="plant-page">
      <div className="plant-container">
        <div className="plant-card">
          <h1 className="CommonNames">{commonNames.join(", ")}</h1>

          <div className="plant-section">
            <span className="plant-label">Scientific Name</span>
            <span className="plant-value">{food.scientific_name}</span>
          </div>

          <div className="plant-section">
            <span className="plant-label">Edibility</span>

            <span
              className={`plant-value ${
                food.edible ? "edible-yes" : "edible-no"
              }`}
            >
              {food.edible ? "Edible" : "Not Edible"}
            </span>
          </div>

          <div className="plant-section">
            <span className="plant-label">Edible Parts</span>

            <span className="plant-value">
              {parts.length ? parts.join(", ") : "None listed"}
            </span>
          </div>
          <div className="warning-box">
            <div className="plant-label">Warnings</div>

            <div className="plant-value">
              {food.warnings || "None in database."}
            </div>
          </div>
          <AskAIPopUp plantInfo={food} />
        </div>
      </div>
    </div>
  );
}

export default PlantPage;
