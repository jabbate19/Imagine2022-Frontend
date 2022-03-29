import mapboxgl from "mapbox-gl";
import React from "react";
import "../../../node_modules/mapbox-gl/dist/mapbox-gl.css";
import "./Markers.scss";

type PointObject = {
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

type Coordinate = mapboxgl.LngLat | { latitude: number; longitude: number };
type MutableMapRef = React.MutableRefObject<mapboxgl.Map | undefined>;

class MarkerManager {
  _geojson: { type: string; features: PointObject[] };
  _map: MutableMapRef;
  constructor(map: MutableMapRef) {
    this._geojson = {
      type: "FeatureCollection",
      features: [],
    };
    this._map = map;
  }

  _generatePointJSON(
    name: string,
    coordinates: Coordinate,
    onClickCallback?: EventListener
  ): PointObject {
    return {
      name: name,
      type: "Feature",
      onClickCallback: onClickCallback ? onClickCallback : undefined,
      geometry: {
        type: "Point",
        coordinates:
          coordinates instanceof mapboxgl.LngLat
            ? [coordinates.lng, coordinates.lat]
            : [coordinates.longitude, coordinates.latitude],
      },
      properties: {
        title: "Hacker",
        description: "Bruh",
      },
    };
  }

  addMarker(
    name: string,
    coordinates: Coordinate,
    onClickCallback?: EventListener
  ): void {
    let markerJSON = this._generatePointJSON(
      name,
      coordinates,
      onClickCallback
    );
    this._geojson.features.push(markerJSON);
  }

  removeMarker(name: string) {
    document.getElementById(name)?.remove();
    this._geojson.features = this._geojson.features.filter(
      (feature) => feature.name !== name
    );
  }

  updateMarkers(): void {
    if (this._map.current) {
      // add markers to map
      for (const feature of this._geojson.features) {
        if (
          !Array.prototype.slice
            .call(document.getElementsByClassName("marker"))
            .map((marker) => marker.id)
            .includes(feature.name)
        ) {
          // create a HTML element for each feature
          const div = document.createElement("div");
          div.className = "marker";
          div.id = feature.name;
          if (typeof feature.onClickCallback !== "undefined")
            div.addEventListener("click", feature.onClickCallback);

          new mapboxgl.Marker(div)
            .setLngLat(feature.geometry.coordinates)
            .setPopup(
              new mapboxgl.Popup({ offset: 25, closeButton: false }).setHTML(
                `<h3>${feature.properties.title}</h3><p>${feature.properties.description}</p>`
              )
            )
            .addTo(this._map.current);
        }
      }
    }
  }
}

export default MarkerManager;
