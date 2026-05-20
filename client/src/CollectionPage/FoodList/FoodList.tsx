import FoodCard from "../FoodCard";

type Food = {
  _id: string;
  warnings: string;
  scientific_name: string;
  common_names: string;
  edible: boolean;
  parts: string[];
};

export default function FoodList({ foods }: { foods: Food[] }) {
  return (
    <div className="d-flex flex-wrap gap-3">
      {foods.map((food) => (
        <FoodCard key={food._id} food={food} />
      ))}
    </div>
  );
}
