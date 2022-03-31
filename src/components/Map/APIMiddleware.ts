const axios = require("axios").default;
const hostnameFallback =
  "https://imagine-2022-backend-git-imagine2022-backend.apps.okd4.csh.rit.edu";

export async function retrieveBeacons() {
  return await axios
    .get(process.env.REACT_APP_API_BACKEND_URL || hostnameFallback)
    .then((response: any) => {
      const beacons = [];
      const beaconsJSON = response.data;
      console.log(beaconsJSON);
      for (const id of Object.keys(beaconsJSON)) {
        const beaconObj = beaconsJSON[id];
        const beacon = {
          id: id,
          position: beaconObj.position,
          absolutePosition: beaconObj.absolute_position, // String index due to _ disagreeing with naming conventions
        };
        beacons.push(beacon);
      }
    });
}

if (require.main === module) {
  (async () => {
    let result = await retrieveBeacons();
    console.log(result);
  })();
}
