import FoodCard from "../FoodCard";
import type { Plant } from "../PlantData";

export default function FoodList({ foods }: { foods: Plant[] }) {
  return (
    <div className="d-flex flex-wrap gap-3">
      {foods.map((food) => (
        <FoodCard key={food._id} food={food} />
      ))}
    </div>
  );
}
