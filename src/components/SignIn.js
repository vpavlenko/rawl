import React from "react";
import styled from "styled-components";
import { baseLinkStyles } from "./AppHeader";

const HeaderDiv = styled.div`
  ${baseLinkStyles}
  color: #888
`;

const SignIn = ({
  user,
  handleLogin,
  handleLogout,
  handleToggleManualRemeasuring,
  enableManualRemeasuring,
  adminUserId,
}) => {
  // Only show checkbox for admin user
  const isAdmin = user && user.uid === adminUserId;

  return (
    <HeaderDiv>
      {isAdmin && (
        <label className="inline">
          <input
            onChange={handleToggleManualRemeasuring}
            type="checkbox"
            checked={enableManualRemeasuring}
            name="manual-remeasuring"
          />
          Manual remeasuring
        </label>
      )}
      {user ? (
        <>
          {isAdmin && " • "}
          {user.email}
          {"   "}
          <a
            href="#"
            onClick={handleLogout}
            style={{
              marginLeft: "15px",
              textDecoration: "underline dotted #444",
            }}
          >
            Sign out
          </a>
        </>
      ) : (
        <>
          <a href="#" onClick={handleLogin} style={{ color: "#fff" }}>
            Sign in
          </a>{" "}
        </>
      )}
    </HeaderDiv>
  );
};

export default SignIn;
