import { useEffect } from "react";
import { Loader } from "@googlemaps/js-api-loader";
import "./App.css";

const App = () => {
  useEffect(() => {
    const initMap = async () => {
      try {
        // Create a loader instance with your API key
        const loader = new Loader({
          apiKey: "AIzaSyBLZxDKEynXZdwnrfwiLvi6UjkOew7i8-Y", // Replace with your actual API key
          version: "weekly", // Optional: specify the API version
          libraries: ["places"], // Optional: include additional libraries
        });

        // Load the Google Maps API
        const google = await loader.importLibrary("maps");

        // Initialize the map
        new google.Map(document.getElementById("map") as HTMLElement, {
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
        width: "100%", // Set the width of the map container
        height: "100vh", // Set the height of the map container
      }}
    ></div>
  );
};

export default App;
