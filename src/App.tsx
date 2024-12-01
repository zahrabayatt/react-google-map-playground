import "./App.css";

import { Wrapper, Status } from "@googlemaps/react-wrapper";
import Spinner from "./components/Spinner";
import ErrorComponent from "./components/ErrorComponent";
import { ReactElement } from "react";
import GoogleMap from "./components/GoogleMap";

const render = (status: Status): ReactElement => {
  if (status === Status.FAILURE) return <ErrorComponent />;
  return <Spinner />;
};

const App = () => (
  <Wrapper apiKey={"AIzaSyBLZxDKEynXZdwnrfwiLvi6UjkOew7i8-Y"} render={render}>
    <GoogleMap zoom={8} center={{ lat: -34.397, lng: 150.644 }} />
  </Wrapper>
);

export default App;
// https://www.npmjs.com/package/@googlemaps/react-wrapper
