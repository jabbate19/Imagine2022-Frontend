import React from "react";
import Spinner from "../Spinner";
import "./InfoSpinner.scss";

export const InfoSpinner: React.FunctionComponent = ({ children }) => {
  return (
    <div className="spinner-container">
      <Spinner className="info-spinner" />
      <span className="spinner-text">{children}</span>
    </div>
  );
};

export default InfoSpinner;
