import React from "react";

const SignIn = ({
  user,
  handleLogin,
  handleLogout,
  handleToggleAnalysis,
  analysisEnabled,
}) => {
  return (
    <div>
      {user && (
        <label className="inline">
          <input
            onChange={handleToggleAnalysis}
            type="checkbox"
            checked={analysisEnabled}
            name="analysis-enabled"
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
