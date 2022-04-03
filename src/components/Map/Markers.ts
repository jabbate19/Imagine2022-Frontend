import mapboxgl, { GeoJSONSource, GeoJSONSourceRaw, Point } from "mapbox-gl";
import { FeatureCollection, Feature, Position } from "geojson";
import * as APIMiddleware from "./APIMiddleware";
import { MutableMapRef, Beacon } from "./types";

import "../../../node_modules/mapbox-gl/dist/mapbox-gl.css";
import "./Markers.scss";

const BEACON_MARKER_WIDTH = 0.05;

class MarkerManager {
  _geojson: { type: "geojson"; data: FeatureCollection };
  _map: MutableMapRef;
  updateRequired: Boolean;
  constructor(map: MutableMapRef) {
    this._geojson = {
      type: "geojson",
      data: {
        type: "FeatureCollection",
        features: [],
      },
    };
    this._map = map;
    this.updateRequired = false; // True if marker was added and we haven't updated
  }

  initialize() {
    if (this._map.current) {
      console.log(this._geojson);
      this._map.current.addSource("beacons", this._geojson);
      this._map.current.addLayer({
        id: "beacons",
        type: "fill",
        source: "beacons", // reference the data source
        layout: {},
        paint: {
          "fill-color": "#0080ff", // blue color fill
          "fill-opacity": 0.01,
        },
      });
    }
  }

  _generateGeoJSONCircleCoordinates(
    radiusInKm: number,
    center: Position,
    points: number = 64
  ): Position[] {
    const ret = [];
    const distanceX =
      radiusInKm / (111.32 * Math.cos((center[1] * Math.PI) / 180));
    const distanceY = radiusInKm / 110.574;

    let theta, x, y;
    for (let i = 0; i < points; i++) {
      theta = (i / points) * (2 * Math.PI);
      x = distanceX * Math.cos(theta);
      y = distanceY * Math.sin(theta);

      ret.push([center[0] + x, center[1] + y]);
    }
    // Complete polygon by pushing initial point
    ret.push(ret[0]);

    return ret;
  }

  /*_parseCoordinatesForJSON(
    coordinates: Coordinates | CoordinatesArray | mapboxgl.LngLat
  ): [number, number] | number[][] {
    /*
     * Parses the given coordinates for use in the _geojson.
     * For some reason it takes longitude first rather than
     * latitude (which is corroborated by the mapboxgl.LngLat
     * class). I have no idea why (likely because longitude is
     * associated with the X axis and latitude the Y).
     
    if (coordinates instanceof mapboxgl.LngLat) {
      // Coordinates
      return [coordinates.lng, coordinates.lat];
    } else if (coordinates.hasOwnProperty("latitude")) {
      return [
        (<Coordinates>coordinates).longitude,
        (<Coordinates>coordinates).latitude,
      ];
    } else {
      // CoordinatesArray
      let parsedCoordinates = [];
      for (const coordinate of <CoordinatesArray>coordinates) {
        parsedCoordinates.push([coordinate.longitude, coordinate.latitude]);
      }
      return parsedCoordinates;
    }
  }*/

  getMarkersFromJson() {
    return this._geojson.data?.features;
  }

  addMarker(coordinates: Position[], radius: number = 64) {
    //coordinates.push(coordinates[0]);
    this._geojson.data?.features.push({
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates: [coordinates],
      },
      properties: {},
    });
    this.updateRequired = true;
  }

  removeMarker(name: string): void {
    if (this._geojson.data) {
      document.getElementById(name)?.remove();
      /*this._geojson.data.features = this._geojson.data.features.filter(
        (data) => data.name !== name
      );*/
      this.updateRequired = true;
    }
  }

  updateHackerLocations(beacons: Beacon[]) {
    console.log("UPDATE");
    beacons.forEach((beacon_obj: Beacon) => {
      // const beacon_id = Object.keys(beacon_obj)[0];
      this.addMarker(
        <Position[]>(
          this._generateGeoJSONCircleCoordinates(BEACON_MARKER_WIDTH, [
            -77.67630082876184,
            43.0847976948913,
          ])
        )
      );
      console.log(beacon_obj);
    });
  }

  updateMarkers() {
    if (this._map.current) {
      (<GeoJSONSource>this._map.current.getSource("beacons")).setData(
        this._geojson.data
      );
      // add markers to map
      //for (const feature of this._geojson.data.features) {
      /*if (
          !Array.prototype.slice
            .call(document.getElementsByClassName("marker"))
            .map((marker) => marker.id)
            .includes(feature.name)
        ) {
          // Add a new layer to visualize the polygon.
          // create an HTML element for each feature
          
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
            .addTo(this._map.current);*/
    }
  }
}

export default MarkerManager;
