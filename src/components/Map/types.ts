import mapboxgl from "mapbox-gl";
export type MutableMapRef = React.MutableRefObject<mapboxgl.Map | undefined>;
export type Coordinates =
  | mapboxgl.LngLat
  | { latitude: number; longitude: number };
export type Beacon = {
  id: string;
  position: Coordinates;
  absolutePosition: Coordinates;
};
export type PointObject = {
  name: string;
  type: "Feature";
  onClickCallback?: EventListener;
  geometry: {
    type: "Point";
    coordinates: [number, number];
  };
  properties: {
    title: string;
    description: string;
  };
};
