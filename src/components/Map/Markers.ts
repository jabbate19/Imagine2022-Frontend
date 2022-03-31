import mapboxgl from "mapbox-gl";
import * as APIMiddleware from "./APIMiddleware";
import { MutableMapRef, PointObject, Coordinates, Beacon } from "./types";

import "../../../node_modules/mapbox-gl/dist/mapbox-gl.css";
import "./Markers.scss";

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

  _parseCoordinatesForJSON(coordinates: Coordinates): [number, number] {
    /**
     * Parses the given coordinates for use in the _geojson.
     * For some reason it takes longitude first rather than
     * latitude (which is corroborated by the mapboxgl.LngLat)
     * type. I have no idea why.
     */
    return coordinates instanceof mapboxgl.LngLat
      ? [coordinates.lng, coordinates.lat]
      : [coordinates.longitude, coordinates.latitude];
  }

  _generatePointJSON(
    name: string,
    coordinates: Coordinates,
    onClickCallback?: EventListener
  ): PointObject {
    return {
      name: name,
      type: "Feature",
      onClickCallback: onClickCallback ? onClickCallback : undefined,
      geometry: {
        type: "Point",
        coordinates: this._parseCoordinatesForJSON(coordinates),
      },
      properties: {
        title: "Hacker",
        description: "Bruh",
      },
    };
  }

  addMarker(
    name: string,
    coordinates: Coordinates,
    onClickCallback?: EventListener
  ) {
    let markerJSON = this._generatePointJSON(
      name,
      coordinates,
      onClickCallback
    );
    this._geojson.features.push(markerJSON);
  }

  removeMarker(name: string): void {
    document.getElementById(name)?.remove();
    this._geojson.features = this._geojson.features.filter(
      (feature) => feature.name !== name
    );
  }

  updateHackerLocations(beacons: Beacon[]) {
    for (const beacon of beacons) {
      this.addMarker(beacon.id, beacon.absolutePosition);
    }
  }

  updateMarkers() {
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
