import { useEffect } from "react";
import "./App.css";

const App = () => {
  // useEffect(() => {
  //   const loadGoogleMaps = async () => {
  //     if (!document.querySelector("script[src*='maps.googleapis.com']")) {
  //       const googleMapsScript = document.createElement("script");
  //       googleMapsScript.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyBLZxDKEynXZdwnrfwiLvi6UjkOew7i8-Y&libraries=places`;
  //       googleMapsScript.async = true;
  //       googleMapsScript.defer = true;

  //       googleMapsScript.onload = async () => {
  //         const { Map } = (await google.maps.importLibrary(
  //           "maps"
  //         )) as google.maps.MapsLibrary;

  //         new Map(document.getElementById("map") as HTMLElement, {
  //           center: { lat: -34.397, lng: 150.644 },
  //           zoom: 8,
  //         });
  //       };

  //       document.head.appendChild(googleMapsScript);
  //     }
  //   };

  //   loadGoogleMaps();
  // }, []);

  useEffect(() => {
    const initMap = async () => {
      try {
        // Dynamically import the "maps" library
        const { Map } = (await google.maps.importLibrary(
          "maps"
        )) as google.maps.MapsLibrary;

        // Initialize the map
        new Map(document.getElementById("map") as HTMLElement, {
          center: { lat: -34.397, lng: 150.644 },
          zoom: 8,
        });
      } catch (error) {
        console.error("Failed to initialize the map:", error);
      }
    };

    initMap();
  }, []);

  return (
    <div
      id="map"
      style={{
        width: "100%", // Full width
        height: "100vh", // Full height
      }}
    ></div>
  );
};

export default App;
