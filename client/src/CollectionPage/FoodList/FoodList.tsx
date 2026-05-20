import { useEffect, useState } from "react";
import FoodCard from "../FoodCard";

type Food = {
  _id: string;
  warnings: string;
  scientific_name: string;
  common_names: string;
  edible: boolean;
  parts: string[];
};

export default function FoodList() {
  const [foods, setFoods] = useState<Food[]>([]);

  useEffect(() => {
    async function loadFoods() {
      const res = await fetch("/api/collection");
      const data = await res.json();
      setFoods(data);
    }

    loadFoods();
  }, []);

  return (
    <div className="d-flex flex-wrap gap-3">
      {foods.map((food) => (
        <FoodCard key={food._id} food={food} />
      ))}
    </div>
  );
}
