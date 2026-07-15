import AskAIPopUp from "../CataloguePage/AskAIPopUp/AskAIPopUp";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import type { Plant } from "../CataloguePage/PlantData";
import "./PlantPage.css";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

function PlantPage() {
  const { id } = useParams();
  const [food, setFood] = useState<Plant | null>(null);
  const [loading, setLoading] = useState(true);
  const [images, setImages] = useState<
    { url: string; creator?: string; license?: string }[]
  >([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  useEffect(() => {
    async function loadPlant() {
      try {
        const [plantRes, imageRes] = await Promise.all([
          fetch(`${BACKEND_URL}/plants/${id}`),
          fetch(`${BACKEND_URL}/plants/${id}/images`),
        ]);

        const plantData = await plantRes.json();
        const imageData = await imageRes.json();

        setFood(plantData);
        setImages(imageData);
      } finally {
        setLoading(false);
      }
    }

    loadPlant();
  }, [id]);

  if (loading) {
    return <div className="loading-state">Loading...</div>;
  }

  if (!food) {
    return <div className="error-state">Plant not found.</div>;
  }

  console.log(food);
  const parts = food.parts ?? [];
  const commonNames = food.common_names ?? [];

  return (
    <div className="plant-page">
      <div className="plant-container">
        <div className="plant-card">
          <h1 className="CommonNames">{commonNames.join(", ")}</h1>

          <div className="plant-images">
            {images.length > 0 ? (
              images.map((image, index) => (
                <img
                  key={index}
                  src={image.url}
                  alt={`${food.scientific_name} ${index + 1}`}
                  className="plant-image"
                  onClick={() => setSelectedImage(image.url)}
                />
              ))
            ) : (
              <p>No images available.</p>
            )}
          </div>

          <div className="plant-section">
            <span className="plant-label">Scientific Name</span>
            <span className="plant-value">{food.scientific_name}</span>
          </div>

          <div className="plant-section">
            <span className="plant-label">Edibility</span>

            <span
              className={`plant-value ${food.edible ? "edible-yes" : "edible-no"}`}
            >
              {food.edible ? "Edible" : "Not Edible"}
            </span>
          </div>

          <div className="plant-section">
            <span className="plant-label">Edible Parts</span>

            <span className="plant-value">
              {parts.length ? parts.join(", ") : "None listed"}
            </span>
          </div>
          <div className="warning-box">
            <div className="plant-label">Warnings</div>

            <div className="plant-value">
              {food.warnings || "None in database."}
            </div>
          </div>
          {selectedImage && (
            <div className="image-modal" onClick={() => setSelectedImage(null)}>
              <button
                className="close-button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedImage(null);
                }}
              >
                ×
              </button>

              <img
                src={selectedImage}
                alt="Plant"
                className="fullscreen-image"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}
          <AskAIPopUp plantInfo={food} />
        </div>
      </div>
    </div>
  );
}

export default PlantPage;
