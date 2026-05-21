import FoodCard from "../FoodCard";
import type { Plant } from "../PlantData";

export default function FoodList({ foods }: { foods: Plant[] }) {
	return (
		<div className="catalogue-list">
			{foods.map(food => (
				<FoodCard key={food._id} food={food} />
			))}
		</div>
	);
}
