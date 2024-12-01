import "./App.css";

import { Wrapper, Status } from "@googlemaps/react-wrapper";
import Spinner from "./components/Spinner";
import ErrorComponent from "./components/ErrorComponent";
import { ReactElement, useState } from "react";
import GoogleMap from "./components/GoogleMap";

const render = (status: Status): ReactElement => {
  if (status === Status.FAILURE) return <ErrorComponent />;
  return <Spinner />;
};

const App = () => {
  const [center, setCenter] = useState<google.maps.LatLngLiteral>({
    lat: -34.397,
    lng: 150.644,
  });

  const panToMarker = () => {
    setCenter({ lat: -25.344, lng: 131.031 }); // Example to pan to the marker's location
  };

  return (
    <Wrapper apiKey={"AIzaSyBLZxDKEynXZdwnrfwiLvi6UjkOew7i8-Y"} render={render}>
      <GoogleMap zoom={8} center={center} panToMarker={panToMarker} />
    </Wrapper>
  );
};

export default App;

// https://www.npmjs.com/package/@googlemaps/react-wrapper
