import React, { useEffect } from "react";
import { Button } from "reactstrap";
import "./AdminPanel.scss";

export const swapVisibility = (elem: HTMLElement, visNullDefault?: string) => {
  elem.style.visibility =
    elem.style.visibility !== ""
      ? elem.style.visibility === "visible"
        ? "hidden"
        : "visible"
      : typeof visNullDefault !== "undefined"
      ? visNullDefault
      : "hidden";
};

export const hideParentOnClick = (eventOrElement: MouseEvent | HTMLElement) => {
  let elem =
    eventOrElement instanceof MouseEvent
      ? (eventOrElement.target as HTMLElement).parentNode
      : eventOrElement;
  [].slice
    .call(elem?.children)
    .forEach((child: HTMLElement) => swapVisibility(child));
  swapVisibility(elem as HTMLElement);
};

export const AdminPanel: React.FunctionComponent = () => {
  useEffect(() => {
    let closeButton = document.getElementById("close-button");
    closeButton?.addEventListener("click", hideParentOnClick);
  });
  return (
    <div id="admin-panel" className="no-transition">
      <h1>Admin Panel</h1>
      <Button id="close-button">X</Button>
      <hr />
      <div id="mode-selection-menu">
        <Button id="add-marker">Add Markers</Button>
        <Button id="remove-marker">Remove Markers</Button>
      </div>
      <div id="one-hit-menu">
        <Button id="clear-all-markers">Clear All Markers</Button>
      </div>
    </div>
  );
};

export default AdminPanel;
