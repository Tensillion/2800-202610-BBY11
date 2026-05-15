type Food = {
  _id: string;
  warnings: string;
  scientific_name: string;
  common_names: string;
  edible: boolean;
  parts: string[];
};

export default function FoodCard({ food }: { food: Food }) {
  return (
    <div className="card p-3 shadow">
      <h3>{food.common_names}</h3>
      <p><b>Scientific:</b> {food.scientific_name}</p>
      <p><b>Edible:</b> {food.edible ? "Yes" : "No"}</p>
      <p><b>Parts:</b> {food.parts.join(", ")}</p>
      <p><b>Warnings:</b> {food.warnings}</p>
    </div>
  );
}