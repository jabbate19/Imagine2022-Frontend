const axios = require("axios").default;
import MarkerManager from "./components/Markers";
import { MAX_BOUNDS } from "./components/Map";
import { Beacon } from "./components/types";

const TEST_DATA_SECTION_COUNT = 10;
let testData: Beacon[];

const hostnameFallback =
  "https://imagine-2022-backend-git-imagine2022-backend.apps.okd4.csh.rit.edu";

function _flipArray<T>(input: [T, T]): [T, T] {
  return [input[1], input[0]];
}

function _beaconJsonToList(json: any): Beacon[] {
  let list: Beacon[] = [];
  Object.keys(json).forEach((key) => {
    const obj: any = {};
    json[key].absolute_position = _flipArray(json[key].absolute_position);
    json[key].position = _flipArray(json[key].position);
    obj[key] = json[key];
    list.push(obj);
  });
  return list;
}

export function initialize() {
  testData = MarkerManager.generateFakeBeaconLocationData(
    MAX_BOUNDS,
    TEST_DATA_SECTION_COUNT
  );
}

export async function retrieveBeacons(): Promise<Beacon[]> {
  return process.env.REACT_APP_DEVELOPER_MODE_OKD ||
    process.env.REACT_APP_DEVELOPER_MODE === "true"
    ? testData
    : await axios
        .get(
          process.env.REACT_APP_API_BACKEND_URL_OKD ||
            process.env.REACT_APP_API_BACKEND_URL ||
            hostnameFallback
        )
        .then((response: any) => _beaconJsonToList(response.data));
}

async function main() {
  let result = await retrieveBeacons();
  console.log(result);
}

if (require.main === module) {
  main();
}
