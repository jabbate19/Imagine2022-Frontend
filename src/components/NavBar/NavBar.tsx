import React from "react";
import {
  Collapse,
  Container,
  Nav,
  Navbar,
  NavbarToggler,
  NavItem,
} from "reactstrap";
import { NavLink } from "react-router-dom";
import Profile from "./Profile";
import "./NavBar.scss";

const NavBar: React.FunctionComponent = () => {
  const [isOpen, setIsOpen] = React.useState<boolean>(false);

  const toggle = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div>
      <Navbar id="navbar" color="primary" dark expand="lg">
        <Container>
          <NavLink to="/" id="brand" className={"navbar-brand"}>
            Sentinel Security
          </NavLink>
          <NavbarToggler onClick={toggle} />
          <Collapse isOpen={isOpen} navbar>
            <Nav navbar>
              <NavItem>
                <NavLink to="/" className={"nav-link"}>
                  Home
                </NavLink>
              </NavItem>

              <NavItem>
                <NavLink to="#" className={"nav-link"}>
                  About
                </NavLink>
              </NavItem>

              <NavItem>
                <NavLink to="#" className={"nav-link"}>
                  Contact
                </NavLink>
              </NavItem>
            </Nav>
            <Nav navbar className="ml-auto">
              <Profile />
            </Nav>
          </Collapse>
        </Container>
      </Navbar>
    </div>
  );
};

export default NavBar;
