import PopUp from "../PopUp/PopUp";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import L, { Map as LeafletMap, Marker, LatLng } from "leaflet";

import "leaflet/dist/leaflet.css";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

const BACKEND_URL = "http://localhost:3000";

type PlantMarker = Marker & { dbId?: string };
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
	iconUrl: "/public/leaf.png",
	iconSize: [40, 70],
	iconAnchor: [20, 40],
	popupAnchor: [0, -40],
});

const guideSteps = [
	{
		x: "50%",
		y: 300,
		title: "Scan Your Area!",
		message: "This is where you can explore the map and find plants in your area.",
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
		y: 120,
		title: "Share your finds!",
		message:
			"Share your plant discoveries with the community and help others find great forage locations!",
	},
];

function MapPage() {
	const navigate = useNavigate();
	const mapRef = useRef<LeafletMap | null>(null);
	const markersRef = useRef<Marker[]>([]);
	const pendingMarkerRef = useRef<Marker | null>(null);

	const [sidebarOpen, setSidebarOpen] = useState(false);
	const [pendingLatLng, setPendingLatLng] = useState<LatLng | null>(null);
	const [plantName, setPlantName] = useState("");

	const token = localStorage.getItem("token");
	const currentUserId = token ? JSON.parse(atob(token.split(".")[1])).userId : "";
	const closeSidebar = () => {
		pendingMarkerRef.current?.remove();
		pendingMarkerRef.current = null;
		setSidebarOpen(false);
		setPendingLatLng(null);
		setPlantName("");
	};

	const confirmMarker = async () => {
		if (!pendingLatLng || !plantName.trim()) return;

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
					plantName: plantName.trim(),
				}),
			});

			if (!response.ok) throw new Error(`HTTP error: ${response.status}`);

			const savedMarker = await response.json();

			pendingMarkerRef.current?.remove();
			pendingMarkerRef.current = null;

			const marker = L.marker([savedMarker.lat, savedMarker.lng], { icon: customIcon }).addTo(
				mapRef.current!
			);
			(marker as PlantMarker).dbId = savedMarker._id;
			markersRef.current.push(marker);
			addPopup(marker, savedMarker._id, savedMarker.userId);

			closeSidebar();
		} catch (err) {
			console.error("Failed to save marker:", err);
		}
	};

	const addPopup = (marker: Marker, markerId: string, markerUserId: string) => {
		const isOwner = currentUserId === markerUserId;

		marker.bindPopup(`
			<div style="display: flex; flex-direction: column; gap: 8px;">
				<button id="open-btn-${markerId}">Open Item</button>
				${isOwner ? `<button id="delete-btn-${markerId}">Delete Marker</button>` : ""}
			</div>
		`);

		marker.on("popupopen", () => {
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
					markersRef.current = markersRef.current.filter(m => m !== marker);
				} catch (err) {
					console.error("Failed to delete marker:", err);
				}
			});
		});
	};

	useEffect(() => {
		const vancouverBounds = L.latLngBounds(
			[49.19, -123.3], // Southwest Coordinates
			[49.4, -123.0] // Northeast Coordinates
		);

		const map = L.map("map", {
			doubleClickZoom: false,
			maxBounds: vancouverBounds,
			maxBoundsViscosity: 1.0,
			minZoom: 10,
		}).setView([49.2827, -123.1207], 14);

		mapRef.current = map;

		L.tileLayer(`https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=gDkxVYMhRLP8Cdndhy8P`, {
			attribution: '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
		}).addTo(map);

		fetch(`${BACKEND_URL}/markers`)
			.then(res => {
				if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
				return res.json();
			})
			.then((savedMarkers: { _id: string; lat: number; lng: number; userId: string }[]) => {
				savedMarkers.forEach(savedMarker => {
					const marker: PlantMarker = L.marker([savedMarker.lat, savedMarker.lng], {
						icon: customIcon,
					}).addTo(map);
					marker.dbId = savedMarker._id;
					markersRef.current.push(marker);
					addPopup(marker, savedMarker._id, savedMarker.userId);
				});
			})
			.catch(err => console.error("Failed to load markers:", err));

		map.on("dblclick", e => {
			pendingMarkerRef.current?.remove();

			const ghost = L.marker([e.latlng.lat, e.latlng.lng], { icon: customIcon }).addTo(map);
			pendingMarkerRef.current = ghost;
			setPendingLatLng(e.latlng);
			setSidebarOpen(true);
		});

		return () => {
			map.remove();
			mapRef.current = null;
		};
	}, [navigate]);

	return (
		<>
			<PopUp
				title="Welcome to the Map Page!"
				message="Explore the map to find plants in your area."
				steps={guideSteps}
			/>

			<style>{`
        .ghost-marker { opacity: 0.5; }

        .plant-sidebar {
          position: fixed;
          top: 0;
          right: 0;
          height: 100%;
          width: 340px;
          background: #fff;
          box-shadow: -4px 0 16px rgba(0,0,0,0.2);
          z-index: 1000;
          display: flex;
          flex-direction: column;
          transform: translateX(100%);
          transition: transform 0.3s ease;
		  max-height: 100dvh;
  		  overflow-y: auto;
        }
        .plant-sidebar.open {
          transform: translateX(0);
        }
        .sidebar-header {
          padding: 20px 16px 12px;
          border-bottom: 1px solid #e5e7eb;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .sidebar-header h2 {
          margin: 0;
          font-size: 1.1rem;
          font-weight: 600;
          color: #166534;
        }
        .sidebar-close {
          background: none;
          border: none;
          font-size: 1.4rem;
          cursor: pointer;
          color: #6b7280;
          line-height: 1;
        }
        .sidebar-body {
  		flex: 1;
  		padding: 24px 16px;
  		display: flex;
  		flex-direction: column;
  		gap: 8px;
  		flex: unset;
		}
        .sidebar-body label {
          font-size: 0.9rem;
          font-weight: 500;
          color: #374151;
        }
        .sidebar-body input {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 0.95rem;
          outline: none;
          box-sizing: border-box;
        }
        .sidebar-body input:focus {
          border-color: #16a34a;
          box-shadow: 0 0 0 2px rgba(22,163,74,0.15);
        }
        .sidebar-footer {
          padding: 14px 16px;
          border-top: 1px solid #e5e7eb;
          display: flex;
          gap: 10px;
		  position: sticky;
  		  bottom: 0;
 		  background: #fff;
        }
        .btn-confirm {
          flex: 1;
          padding: 10px;
          background: #16a34a;
          color: #fff;
          border: none;
          border-radius: 8px;
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s;
        }
        .btn-confirm:disabled {
          background: #a3a3a3;
          cursor: not-allowed;
        }
        .btn-confirm:not(:disabled):hover {
          background: #15803d;
        }
        .btn-cancel {
          flex: 1;
          padding: 10px;
          background: #f3f4f6;
          color: #374151;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 0.95rem;
          cursor: pointer;
          transition: background 0.15s;
        }
        .btn-cancel:hover {
          background: #e5e7eb;
        }
      `}</style>

			<div id="map" />

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
						placeholder="e.g. Salmon Berry"
						value={plantName}
						onChange={e => setPlantName(e.target.value)}
						onKeyDown={e => e.key === "Enter" && confirmMarker()}
						autoFocus
					/>
				</div>
				<div className="sidebar-footer">
					<button className="btn-cancel" onClick={closeSidebar}>
						Cancel
					</button>
					<button className="btn-confirm" disabled={!plantName.trim()} onClick={confirmMarker}>
						Place Marker
					</button>
				</div>
			</div>
		</>
	);
}

export default MapPage;
