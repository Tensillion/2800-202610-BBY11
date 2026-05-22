import PlantCard from "../PlantCard/PlantCard";
import type { Plant } from "../PlantData";

/**
 *
 * Creates a list of PlantCard elements from a given input.
 *
 * @param param Plants refines a parameter of type Plant[].
 * @returns List of PlantCards from the given list of plants.
 *
 * @author Umanga Bajgai
 */
export default function PlantList({ plants }: { plants: Plant[] }) {
  return (
    <div className="catalogue-list">
      {plants.map((plant) => (
        <PlantCard key={plant._id} plant={plant} />
      ))}
    </div>
  );
}
