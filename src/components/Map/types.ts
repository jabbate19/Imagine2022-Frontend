import mapboxgl from "mapbox-gl";

export type MutableMapRef = React.MutableRefObject<mapboxgl.Map | undefined>;

export interface Beacon {
  [key: string]: {
    position: [number, number];
    absolute_position: [number, number];
    esps: {
      [id: string]: {
        timestamp: number;
        rssi: number;
        esp_position: [number, number];
        esp_position_normal: [number, number];
        distance: number;
      };
    };
    beacon_id: string;
  };
}

/* export interface PolygonCollectionObject extends FeatureCollection {
  type: "FeatureCollection";
  crs: { type: "name"; properties: { name: "urn:ogc:def:crs:OGC:1.3:CRS84" } };
  features: PolygonObject[];
}*/
