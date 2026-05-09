import PopUp from '../PopUp/PopUp';
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import L, { Map as LeafletMap, Marker } from "leaflet";

import "leaflet/dist/leaflet.css";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

import Footer from "../Footer/Footer";

delete (L.Icon.Default.prototype as Partial<L.Icon.Default> & {
  _getIconUrl?: string;
})._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const guideSteps = [
	{
		x: '50%',
		y: 300,
		title: 'Scan Your Area!',
		message: 'This is where you can explore the map and find plants in your area.',
	},
	{
		x: '70%',
		y: 150,
		title: 'Sort for Plants!',
		message:
			'Use the filters to sort for different types of plants and find the ones you are interested in!',
	},
	{
		x: '50%',
		y: 120,
		title: 'Share your finds!',
		message:
			'Share your plant discoveries with the community and help others find great forage locations!',
	},
];

function MapPage() {

  const navigate = useNavigate();
  const mapRef = useRef<LeafletMap | null>(null);
  const markersRef = useRef<Marker[]>([]);

  useEffect(() =>{

    // Creates the interactive elements of the map with the starting location and zoom at Vancouver. 
    const map = L.map("map").setView([49.2827, -123.1207], 14);
    mapRef.current = map;

    // Creates the actual map image.
    L.tileLayer(
      `https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=gDkxVYMhRLP8Cdndhy8P`,
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
      }
    ).addTo(map);

    // Add marker on click
    map.on("click", (e) => {
      const marker = L.marker(e.latlng).addTo(map);

      markersRef.current.push(marker);

        const markerId = Date.now();

       // Popup menu HTML
      marker.bindPopup(`
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <button id="open-btn-${markerId}">Open Item</button>
          <button id="delete-btn-${markerId}">Delete Marker</button>
        </div>
      `);

      marker.on("popupopen", () => {

        const openBtn = document.getElementById(`open-btn-${markerId}`);

        const deleteBtn = document.getElementById(`delete-btn-${markerId}`);

        // Open item action
        openBtn?.addEventListener("click", () => {
          navigate("/ItemPage");
        });

        // Delete marker action
        deleteBtn?.addEventListener("click", () => {
          marker.remove();
          markersRef.current = markersRef.current.filter((m) => m !== marker);
        });
      });
    });

    return () => {
      map.remove();
    };
  });

    // Creates the size of the map on the screen
    return (
    <>
       <PopUp
				title="Welcome to the Map Page!"
				message="Explore the map to find plants in your area."
				steps={guideSteps}
			/>
      <div
        id="map"
        style={{ height: "725px", width: "100%" }}
      ></div>
      <Footer />
    </>
  );
}
export default MapPage;
