import React from "react";

const SignIn = ({
  user,
  handleLogin,
  handleLogout,
  handleToggleManualRemeasuring,
  enableManualRemeasuring,
}) => {
  return (
    <div>
      {user && (
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
          {" • "}
          Logged in as {user.email}.{" "}
          <a href="#" onClick={handleLogout}>
            Logout
          </a>
        </>
      ) : (
        <>
          <a href="#" onClick={handleLogin} style={{ color: "#222" }}>
            {"."}
          </a>{" "}
        </>
      )}
    </div>
  );
};

export default SignIn;
