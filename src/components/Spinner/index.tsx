import React from "react";
import "./Spinner.scss";

export const Spinner: React.FunctionComponent<{ className: string }> = ({
  className,
}) => <div className={`spinner ${className}`} />;

export default Spinner;
