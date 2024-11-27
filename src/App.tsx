import { APIProvider, Map } from "@vis.gl/react-google-maps";
import ControlButtonsWrapper from "./components/ControlButtonWrapper";

const App = () => {
  return (
    <div>
      <APIProvider apiKey="AIzaSyBLZxDKEynXZdwnrfwiLvi6UjkOew7i8-Y">
        <Map
          style={{ width: "100vw", height: "100vh" }}
          defaultCenter={{ lat: 22.54992, lng: 0 }}
          defaultZoom={3}
          gestureHandling={"greedy"}
          disableDefaultUI={true}
        >
          <ControlButtonsWrapper />
        </Map>
      </APIProvider>
    </div>
  );
};

export default App;

//  @vis.gl/react-google-maps docs: https://visgl.github.io/react-google-maps/docs
