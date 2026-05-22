import { useNavigate } from "react-router-dom";
import type { Plant } from "./PlantData";

/**
 * Creates a Plant card based on information from the Plant input.
 * Shows default values if nothing is found.
 *
 * @param plant is just one Plant, which is a predefined type under PlantData.ts.
 * @returns PlantCard Component.
 *
 * @author Umanga Bajgai
 */
export default function PlantCard({ plant }: { plant: Plant }) {
  const parts = plant.parts ?? [];
  const commonNames = plant.common_names ?? [];
  const navigate = useNavigate();
  return (
    <div
      className="catalogue-card"
      onClick={() =>
        navigate(`/plants/${plant._id}`, {
          state: { plant },
        })
      }
    >
      <h3>{commonNames.join(", ")}</h3>
      <p>
        <b>Scientific:</b> {plant.scientific_name}
      </p>
      <p>
        <b>Edible:</b> {plant.edible ? "Yes" : "No"}
      </p>
      <p>
        <b>Parts:</b> {parts.length ? parts.join(", ") : "None listed"}{" "}
      </p>
      <p>
        <b>Warnings:</b> {plant.warnings || "None in database. Investigate!"}
      </p>
    </div>
  );
}
