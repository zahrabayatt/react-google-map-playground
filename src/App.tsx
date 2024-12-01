import { useEffect } from "react";
import { Loader } from "@googlemaps/js-api-loader";
import "./App.css";

const App = () => {
  useEffect(() => {
    const initMap = async () => {
      // The location of Uluru
      const position = { lat: -25.344, lng: 131.031 };
      try {
        // Create a loader instance with your API key
        const loader = new Loader({
          apiKey: "AIzaSyBLZxDKEynXZdwnrfwiLvi6UjkOew7i8-Y", // Replace with your actual API key
          version: "weekly", // Optional: specify the API version
          libraries: ["places", "marker"], // Include marker library
        });

        // Load the Google Maps API
        const googleMaps = await loader.importLibrary("maps");

        // Initialize the map
        const map = new googleMaps.Map(
          document.getElementById("map") as HTMLElement,
          {
            center: { lat: -34.397, lng: 150.644 },
            zoom: 8,
          }
        );

        // AdvancedMarker need a map id
        // const { AdvancedMarkerElement } = (await loader.importLibrary(
        //   "marker"
        // )) as google.maps.MarkerLibrary;

        // // The marker, positioned at Uluru
        // const marker = new AdvancedMarkerElement({
        //   map: map,
        //   position: position,
        //   title: "Uluru",
        // });

        // Load the marker library separately to access Marker class
        const { Marker } = await loader.importLibrary("marker");

        // Use the basic Marker (without AdvancedMarkerElement)
        // Add a marker to the map
        new Marker({
          position: position,
          map: map,
          title: "Uluru",
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
        width: "100%", // Set the width of the map container
        height: "100vh", // Set the height of the map container
      }}
    ></div>
  );
};

export default App;
