import Footer from "../../Footer/Footer";
import PopUp from "../../PopUp/PopUp";
import AskAIPopUp from "../AskAIPopUp/AskAIPopUp";
import "./CataloguePage.css";
import FoodList from "../FoodList/FoodList";
import Search from "../Search";
import { useEffect, useState } from "react";

type Food = {
  _id: string;
  warnings: string;
  scientific_name: string;
  common_names: string[];
  edible: boolean;
  parts: string[];
};

const guideSteps = [
  {
    x: "50%",
    y: 300,
    title: "Look through the Catalogue !",
    message: "Search and filter through the plants to learn more about them.",
  },
];

function CataloguePage() {
  const [foods, setFoods] = useState<Food[]>([]);
  useEffect(() => {
    async function loadFoods() {
      const res = await fetch("/api/CataloguePage");
      const data = await res.json();
      setFoods(data);
    }

    loadFoods();
  }, []);

  async function handleSearch(query: string) {
    if (!query.trim()) {
      const res = await fetch("/api/collection");
      const data = await res.json();
      setFoods(data);
      return;
    }
    const res = await fetch(`/plants/search?q=${encodeURIComponent(query)}`);
    const data = await res.json();

    setFoods(data);
  }

  const demoPlantInfo = {
    name: "Rubus spectabilis",
    edible: true,
    parts: ["berries", "young shoots"],
    warnings:
      "Young shoots best harvested before leaves fully unfurl. Berries tart but palatable raw or cooked.",
    sources: [
      "https://www.wikidata.org/wiki/Q159021",
      "https://www.gbif.org/species/3003011",
    ],
  };

  return (
    <section id="catalogue-page">
      <PopUp
        title="Welcome to the Catalogue Page!"
        message="View all the plants you've identified and collected here."
        steps={guideSteps}
      />

      {/* Example usage of AskAIPopUp with demo plant info.
			Please put this into the actual plant item page where you can pass the DB plant info. */}

      <AskAIPopUp plantInfo={demoPlantInfo} />
      <div>
        <Search onSearch={handleSearch} />
      </div>
      <FoodList foods={foods} />
      <Footer />
    </section>
  );
}
export default CataloguePage;
