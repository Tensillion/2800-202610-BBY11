import PopUp from "../PopUp/PopUp";
import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import L, { Map as LeafletMap, Marker, LatLng } from "leaflet";

import "leaflet/dist/leaflet.css";
import "./MapPage.css";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

import Footer from "../Footer/Footer";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

type PlantMarker = Marker & {
  dbId?: string;
  plantId?: string;
  edible?: boolean | null;
  markerUserId?: string;
  plantName?: string;
};

type Plant = {
  _id: string;
  common_names: string[];
  scientific_name: string;
  edible?: boolean;
};

type FilterEdible = "all" | "edible" | "not-edible";
type FilterOwner = "all" | "mine";

delete (
  L.Icon.Default.prototype as Partial<L.Icon.Default> & {
    _getIconUrl?: string;
  }
)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const customIcon = L.icon({
	iconUrl: "/leaf.PNG",
	iconSize: [55, 55],
	iconAnchor: [20, 40],
	popupAnchor: [0, -40],
});

const guideSteps = [
  {
    x: "50%",
    y: 300,
    title: "Check your Surroundings!",
    message:
      "This is where you can explore the map and find plants in your area.",
  },
  {
    x: "70%",
    y: 150,
    title: "Sort for Plants!",
    message:
      "Use the filters to sort for different types of plants and find the ones you are interested in!",
  },
  {
    x: "50%",
    y: "50%",
    title: "Share your finds!",
    message:
      "Share your plant discoveries with the community and help others find great forage locations!",
  },
];

function matchesFilters(
  marker: PlantMarker,
  filterEdible: FilterEdible,
  filterOwner: FilterOwner,
  currentUserId: string,
): boolean {
  if (filterEdible === "edible" && marker.edible !== true) return false;
  if (filterEdible === "not-edible" && marker.edible !== false) return false;
  if (filterOwner === "mine" && marker.markerUserId !== currentUserId)
    return false;
  return true;
}

function MapPage() {
  const navigate = useNavigate();
  const mapRef = useRef<LeafletMap | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const markersRef = useRef<PlantMarker[]>([]);
  const pendingMarkerRef = useRef<Marker | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pendingLatLng, setPendingLatLng] = useState<LatLng | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);

  const [plantName, setPlantName] = useState("");
  const [suggestions, setSuggestions] = useState<Plant[]>([]);
  const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  const [filterEdible, setFilterEdible] = useState<FilterEdible>("all");
  const [filterOwner, setFilterOwner] = useState<FilterOwner>("all");

  const token = localStorage.getItem("token");
  const currentUserId = token
    ? JSON.parse(atob(token.split(".")[1])).userId
    : "";

  const activeFilterCount =
    (filterEdible !== "all" ? 1 : 0) + (filterOwner !== "all" ? 1 : 0);

  useEffect(() => {
    if (!mapRef.current) return;
    markersRef.current.forEach((marker) => {
      const visible = matchesFilters(
        marker,
        filterEdible,
        filterOwner,
        currentUserId,
      );
      if (visible) {
        if (!mapRef.current!.hasLayer(marker)) marker.addTo(mapRef.current!);
      } else {
        if (mapRef.current!.hasLayer(marker)) marker.remove();
      }
    });
  }, [filterEdible, filterOwner, currentUserId]);

  // Sidebar controls

  const closeSidebar = () => {
    pendingMarkerRef.current?.remove();
    pendingMarkerRef.current = null;
    setSidebarOpen(false);
    setPendingLatLng(null);
    setPlantName("");
    setSelectedPlant(null);
    setSuggestions([]);
    setShowDropdown(false);
  };

  const handlePlantInput = (value: string) => {
    setPlantName(value);
    setSelectedPlant(null);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!value.trim()) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `${BACKEND_URL}/plants/search?q=${encodeURIComponent(value)}`,
        );
        const data: Plant[] = await res.json();
        setSuggestions(data);
        setShowDropdown(data.length > 0);
      } catch {
        setSuggestions([]);
        setShowDropdown(false);
      }
    }, 250);
  };

  const handleSelectSuggestion = (plant: Plant) => {
    setSelectedPlant(plant);
    setPlantName(plant.common_names[0]);
    setSuggestions([]);
    setShowDropdown(false);
  };

  // Save marker

  const confirmMarker = async () => {
    if (!pendingLatLng || !selectedPlant) return;

    try {
      const response = await fetch(`${BACKEND_URL}/markers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          lat: pendingLatLng.lat,
          lng: pendingLatLng.lng,
          plantId: selectedPlant._id,
          plantName: selectedPlant.common_names[0],
          edible: selectedPlant.edible ?? null,
        }),
      });

      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);

      const savedMarker = await response.json();

      pendingMarkerRef.current?.remove();
      pendingMarkerRef.current = null;

      const marker = L.marker([savedMarker.lat, savedMarker.lng], {
        icon: customIcon,
      }).addTo(mapRef.current!) as PlantMarker;

      marker.dbId = savedMarker._id;
      marker.edible = savedMarker.edible;
      marker.markerUserId = savedMarker.userId;
      marker.plantName = savedMarker.plantName;
      markersRef.current.push(marker);
      addPopup(
        marker,
        savedMarker._id,
        savedMarker.userId,
        savedMarker.plantName,
      );

      const visible = matchesFilters(
        marker,
        filterEdible,
        filterOwner,
        currentUserId,
      );
      if (!visible) marker.remove();

      closeSidebar();
    } catch (err) {
      console.error("Failed to save marker:", err);
    }
  };

  // Popup

  const addPopup = useCallback(
    (
      marker: Marker,
      markerId: string,
      markerUserId: string,
      plantDisplayName?: string,
    ) => {
      const isOwner = currentUserId === markerUserId;

      const edibleStatus = (marker as PlantMarker).edible;
      const edibleBadge =
        edibleStatus === true
          ? `<span class="popup-badge popup-badge--edible">Edible</span>`
          : edibleStatus === false
            ? `<span class="popup-badge popup-badge--not-edible">Not Edible</span>`
            : "";

      marker.bindPopup(
        `
			<div class="marker-popup">
				${
          plantDisplayName
            ? `<div class="popup-plant-name">
							${plantDisplayName}
							${edibleBadge}
						</div>`
            : ""
        }
				<div class="popup-actions">
					<button class="popup-btn popup-btn--open" id="open-btn-${markerId}">Open Item</button>
					${
            isOwner
              ? `<button class="popup-btn popup-btn--delete" id="delete-btn-${markerId}">Delete</button>`
              : ""
          }
				</div>
			</div>
		`,
        { closeButton: false, autoClose: false },
      );

      // Per-marker timer so mouse can travel from marker → popup without it closing
      let closeTimer: ReturnType<typeof setTimeout> | null = null;
      const scheduleClose = () => {
        closeTimer = setTimeout(() => marker.closePopup(), 200);
      };
      const cancelClose = () => {
        if (closeTimer) {
          clearTimeout(closeTimer);
          closeTimer = null;
        }
      };

      marker.on("mouseover", () => {
        cancelClose();
        marker.openPopup();
      });
      marker.on("mouseout", scheduleClose);

      marker.on("popupopen", () => {
        // Keep popup open while hovering over it
        const popupEl = marker.getPopup()?.getElement();
        if (popupEl) {
          popupEl.addEventListener("mouseenter", cancelClose);
          popupEl.addEventListener("mouseleave", scheduleClose);
        }

        const openBtn = document.getElementById(`open-btn-${markerId}`);
        const deleteBtn = document.getElementById(`delete-btn-${markerId}`);

        openBtn?.addEventListener("click", () => {
          navigate("/ItemPage");
        });

        deleteBtn?.addEventListener("click", async () => {
          try {
            await fetch(`${BACKEND_URL}/markers/${markerId}`, {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            });
            marker.remove();
            markersRef.current = markersRef.current.filter((m) => m !== marker);
          } catch (err) {
            console.error("Failed to delete marker:", err);
          }
        });
      });
    },
    [currentUserId, navigate],
  );

  // Map init

  useEffect(() => {
    if (mapRef.current || !mapContainerRef.current) return;

    let cancelled = false;

    const vancouverBounds = L.latLngBounds([49.19, -123.3], [49.4, -123.0]);

    const map = L.map(mapContainerRef.current, {
      doubleClickZoom: false,
      maxBounds: vancouverBounds,
      maxBoundsViscosity: 1.0,
      minZoom: 12,
    }).setView([49.2827, -123.1207], 14);

    mapRef.current = map;

    L.tileLayer(
      `https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=gDkxVYMhRLP8Cdndhy8P`,
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
      },
    ).addTo(map);

    const easterEggIcon = L.icon({
      iconUrl: "/star.png",
      iconSize: [42, 32],
      iconAnchor: [21, 21],
      popupAnchor: [0, -20],
    });

    const easterEggMarker = L.marker([49.2052, -123.2634], {
      icon: easterEggIcon,
    }).addTo(map);

    easterEggMarker.on("click", async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/petAPI/easterEgg`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();

        if (!response.ok) {
          easterEggMarker
            .bindPopup(
              `
						<div class="marker-popup">
							<h3>Secret Already Found</h3>
							<p>${data.error}</p>
						</div>
					`,
            )
            .openPopup();

          return;
        }

        easterEggMarker
          .bindPopup(
            `
					<div class="marker-popup">
						<h3>Hidden Discovery!</h3>
						<p>Your pet earned a legendary title</p>
						<p>Checkout your pet's new title in the pet page</p>
					</div>
				`,
          )
          .openPopup();
      } catch (err) {
        console.error(err);
      }
    });

    fetch(`${BACKEND_URL}/markers`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
        return res.json();
      })
      .then(
        (
          savedMarkers: {
            _id: string;
            lat: number;
            lng: number;
            userId: string;
            edible?: boolean | null;
            plantName?: string;
          }[],
        ) => {
          if (cancelled) return;
          savedMarkers.forEach((savedMarker) => {
            const marker = L.marker([savedMarker.lat, savedMarker.lng], {
              icon: customIcon,
            }).addTo(map) as PlantMarker;

            marker.dbId = savedMarker._id;
            marker.edible = savedMarker.edible;
            marker.markerUserId = savedMarker.userId;
            marker.plantName = savedMarker.plantName;
            markersRef.current.push(marker);
            addPopup(
              marker,
              savedMarker._id,
              savedMarker.userId,
              savedMarker.plantName,
            );
          });
        },
      )
      .catch((err) => console.error("Failed to load markers:", err));

    map.on("dblclick", (e) => {
      if (!vancouverBounds.contains(e.latlng)) return;
      pendingMarkerRef.current?.remove();
      const ghost = L.marker([e.latlng.lat, e.latlng.lng], {
        icon: customIcon,
      }).addTo(map);
      pendingMarkerRef.current = ghost;
      setPendingLatLng(e.latlng);
      setSidebarOpen(true);
    });

    return () => {
      cancelled = true;
      map.remove();
      mapRef.current = null;
    };
  }, [addPopup]);

  // Render

  return (
    <>
      <PopUp
        title="Welcome to the Map Page!"
        message="Explore the map to find plants in your area."
        steps={guideSteps}
      />

      <div
        ref={mapContainerRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          zIndex: 0,
        }}
      />

      <button
        className={`filter-toggle-btn ${activeFilterCount > 0 ? "has-active" : ""}`}
        onClick={() => setFilterOpen((o) => !o)}
        aria-label="Toggle filters"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="4" y1="6" x2="20" y2="6" />
          <line x1="8" y1="12" x2="16" y2="12" />
          <line x1="11" y1="18" x2="13" y2="18" />
        </svg>
        <span>Filter</span>
        {activeFilterCount > 0 && (
          <span className="filter-badge">{activeFilterCount}</span>
        )}
      </button>

      {filterOpen && (
        <div className="filter-panel">
          <div className="filter-panel-header">
            <span className="filter-panel-title">Filter Markers</span>
            {activeFilterCount > 0 && (
              <button
                className="filter-clear-btn"
                onClick={() => {
                  setFilterEdible("all");
                  setFilterOwner("all");
                }}
              >
                Clear all
              </button>
            )}
          </div>

          <div className="filter-section">
            <span className="filter-section-label">Edibility</span>
            <div className="filter-pills">
              {(["all", "edible", "not-edible"] as FilterEdible[]).map(
                (opt) => (
                  <button
                    key={opt}
                    className={`filter-pill ${filterEdible === opt ? "active" : ""}`}
                    onClick={() => setFilterEdible(opt)}
                  >
                    {opt === "all"
                      ? "All"
                      : opt === "edible"
                        ? "Edible"
                        : "Not Edible"}
                  </button>
                ),
              )}
            </div>
          </div>

          <div className="filter-section">
            <span className="filter-section-label">Placed by</span>
            <div className="filter-pills">
              {(["all", "mine"] as FilterOwner[]).map((opt) => (
                <button
                  key={opt}
                  className={`filter-pill ${filterOwner === opt ? "active" : ""}`}
                  onClick={() => setFilterOwner(opt)}
                >
                  {opt === "all" ? "Everyone" : "Just Me"}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className={`plant-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <h2>New Plant Marker</h2>
          <button className="sidebar-close" onClick={closeSidebar}>
            ✕
          </button>
        </div>

        <div className="sidebar-body">
          <label htmlFor="plant-name-input">Plant Name</label>
          <input
            id="plant-name-input"
            type="text"
            placeholder="e.g. Salmonberry"
            value={plantName}
            onChange={(e) => handlePlantInput(e.target.value)}
            onKeyDown={(e) =>
              e.key === "Enter" && selectedPlant && confirmMarker()
            }
            onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
            onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
            autoComplete="off"
            autoFocus
          />

          {plantName && !selectedPlant && (
            <p className="validation-hint error">
              ⚠ Select a plant from the list
            </p>
          )}
          {selectedPlant && (
            <p className="validation-hint success">
              ✓ <em>{selectedPlant.scientific_name}</em>
              {selectedPlant.edible != null && (
                <span className="edible-badge">
                  {selectedPlant.edible ? " · Edible" : " · Not Edible"}
                </span>
              )}
            </p>
          )}

          {showDropdown && (
            <ul className="plant-dropdown">
              {suggestions.map((plant) => (
                <li
                  key={plant._id}
                  className="plant-dropdown-item"
                  onMouseDown={() => handleSelectSuggestion(plant)}
                >
                  <span className="plant-common">
                    {plant.common_names.join(", ")}
                  </span>
                  <span className="plant-sci">{plant.scientific_name}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="sidebar-footer">
          <button className="btn-cancel" onClick={closeSidebar}>
            Cancel
          </button>
          <button
            className="btn-confirm"
            disabled={!selectedPlant}
            onClick={confirmMarker}
          >
            Place Marker
          </button>
        </div>
      </div>

      <Footer />
    </>
  );
}

export default MapPage;
