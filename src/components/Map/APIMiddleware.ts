const axios = require("axios").default;
import testData from "../../testdata.json";
import { Beacon } from "./types";
const hostnameFallback =
  "https://imagine-2022-backend-git-imagine2022-backend.apps.okd4.csh.rit.edu";

function _beaconJsonToList(json: any): Beacon[] {
  let list: Beacon[] = [];
  Object.keys(json).forEach((key) => {
    const obj: any = {};
    obj[key] = json[key];
    list.push(obj);
  });
  return list;
}

export async function retrieveBeacons(): Promise<Beacon[]> {
  return process.env.REACT_APP_DEVELOPER_MODE === "true"
    ? await axios
        .get(process.env.REACT_APP_API_BACKEND_URL || hostnameFallback)
        .then((response: any) => _beaconJsonToList(response.data))
    : _beaconJsonToList(testData);
}

if (require.main === module) {
  (async () => {
    let result = await retrieveBeacons();
    console.log(result);
  })();
}
