import { Wrapper, Status } from "@googlemaps/react-wrapper";
import Spinner from "./components/Spinner";
import ErrorComponent from "./components/ErrorComponent";
import { ReactElement } from "react";
import GoogleMap from "./components/GoogleMap";
import "./App.css"

const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const render = (status: Status): ReactElement => {
  if (status === Status.FAILURE) return <ErrorComponent />;
  return <Spinner />;
};

const App = () => {
  const center: google.maps.LatLngLiteral = {
    lat: -34.397,
    lng: 150.644,
  };

  return (
    <Wrapper apiKey={apiKey} render={render}>
      <GoogleMap zoom={10} center={center} />
    </Wrapper>
  );
};

export default App;