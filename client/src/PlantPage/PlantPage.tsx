import AskAIPopUp from "../CataloguePage/AskAIPopUp/AskAIPopUp";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import type { Plant } from "../CataloguePage/PlantData";

function PlantPage() {
  const { plantId } = useParams();
  const [food, setFood] = useState<Plant | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`http://localhost:3000/plants/${plantId}`)
      .then((res) => res.json())
      .then((data) => {
        setFood(data);
        setLoading(false);
      });
  }, [plantId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!food) {
    return <div>Sorry no food found sad face</div>;
  }

  const parts = food.parts ?? [];
  const commonNames = food.common_names ?? [];

  return (
    <div>
      <h3>{commonNames.join(", ")}</h3>
      <p>
        <b>Scientific:</b> {food.scientific_name}
      </p>
      <p>
        <b>Edible:</b> {food.edible ? "Yes" : "No"}
      </p>
      <p>
        <b>Parts:</b> {parts.length ? parts.join(", ") : "None listed"}{" "}
      </p>
      <p>
        <b>Warnings:</b> {food.warnings || "None in database. Investigate!"}
      </p>
      <AskAIPopUp plantInfo={food} />
    </div>
  );
}

export default PlantPage;
