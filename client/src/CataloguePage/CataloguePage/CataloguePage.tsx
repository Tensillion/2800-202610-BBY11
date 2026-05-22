import PopUp from "../../PopUp/PopUp";
import "./CataloguePage.css";
import PlantList from "../PlantList/PlantList";
import Search from "../Search/Search";
import { useEffect, useState } from "react";
import type { Plant } from "../PlantData";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

const guideSteps = [
  {
    x: "50%",
    y: 300,
    title: "Look through the Catalogue !",
    message: "Search and filter through the plants to learn more about them.",
  },
];

/**
 * Renders all the components involved in the catalogue page together.
 * Defines a simple search handler as well for the serach bar.
 *
 *
 * @returns CataloguePage
 * @author Umanga Bajgai
 */
function CataloguePage() {
  const [Plants, setPlants] = useState<Plant[]>([]);
  useEffect(() => {
    async function loadPlants() {
      const res = await fetch(`${BACKEND_URL}/api/catalogue`);
      const data = await res.json();
      setPlants(data);
    }

    loadPlants();
  }, []);

  /*
   * Defines the search handler, which will fetch the backend results,
   * by passing in the query url.
   */
  async function handleSearch(query: string) {
    if (!query.trim()) {
      const res = await fetch(`${BACKEND_URL}/api/catalogue`);
      const data = await res.json();
      setPlants(data);
      return;
    }
    const res = await fetch(
      `${BACKEND_URL}/plants/search?q=${encodeURIComponent(query)}`,
    );
    const data = await res.json();

    setPlants(data);
  }

  return (
    <section id="catalogue-page">
      <PopUp
        title="Welcome to the Catalogue Page!"
        message="View all the plants you've identified and collected here."
        steps={guideSteps}
      />

      <div className="catalogue-content">
        <div className="catalogue-search">
          <Search onSearch={handleSearch} />
        </div>
        <PlantList plants={Plants} />
      </div>
    </section>
  );
}
export default CataloguePage;
