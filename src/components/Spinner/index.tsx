import React from "react";
import "./Spinner.scss";

interface SpinnerProps {
  className: string;
}

const Spinner: React.FunctionComponent<SpinnerProps> = ({ className }) => {
  return <div className={`spinner ${className}`} />;
};

export default Spinner;
