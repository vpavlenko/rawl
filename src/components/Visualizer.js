import React from "react";

const Visualizer = ({
  user,
  handleLogin,
  handleLogout,
  handleToggleAnalysis,
  analysisEnabled,
}) => {
  return (
    <div className="Visualizer">
      <div className="Visualizer-toggle">
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
            <a href="#" onClick={handleLogin}>
              {"."}
            </a>{" "}
          </>
        )}
      </div>
    </div>
  );
};

export default Visualizer;
