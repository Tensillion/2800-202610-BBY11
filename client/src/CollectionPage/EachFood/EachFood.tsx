import mongoose, { Schema, Document } from "mongoose";

export interface FoodData extends Document {
  warnings: string;
  scientific_name: string;
  common_names: string;
  edible: boolean;
  parts: string[];
}

const FoodSchema = new Schema<FoodData>({
  warnings: { type: String, required: true },
  scientific_name: { type: String, required: true },
  common_names: { type: String, required: true },
  edible: { type: Boolean, required: true },
  parts: { type: [String], required: true },
});

export default mongoose.models.Food || mongoose.model<FoodData>("Food", FoodSchema);
