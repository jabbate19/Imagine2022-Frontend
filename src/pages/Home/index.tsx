import React from "react";
import Map from "../../components/Map";
import { LoadingMarkersIndicator } from "../../components/StatusIndicators";
import AdminPanel from "../../components/AdminPanel";
export const Home: React.FunctionComponent = () => (
  <>
    <AdminPanel></AdminPanel>
    <LoadingMarkersIndicator></LoadingMarkersIndicator>
    <Map></Map>
  </>
);

export default Home;
