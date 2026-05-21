import { useNavigate } from "react-router-dom";
import type { Plant } from "./PlantData";


export default function FoodCard({ food }: { food: Plant }) {
  const parts = food.parts ?? [];
  const commonNames = food.common_names ?? [];
  const navigate = useNavigate();
  return (
    <div
      className="card p-3 shadow"
      onClick={() =>
        navigate(`/plants/${food._id}`, {
          state: { food },
        })
      }
    >
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
    </div>
  );
}
