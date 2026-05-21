import { useLocation } from "react-router-dom";
import AskAIPopUp from "../CataloguePage/AskAIPopUp/AskAIPopUp";
function PlantPage() {
  const location = useLocation();
  const food = location.state?.food;

  const parts = food.parts ?? [];
  const commonNames = food.common_names ?? [];

  if (!food) {
    return <div>Sorry no food found sad face</div>;
  }

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
