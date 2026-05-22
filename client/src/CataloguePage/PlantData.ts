/**
 * Defines the type Plant, centralizing the logic to be called in required functions.
 *
 * @author Umanga Bajgai
 */
export type Plant = {
  _id: string;
  warnings: string;
  scientific_name: string;
  common_names: string[];
  edible: boolean;
  parts: string[];
};
