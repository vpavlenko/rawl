import { faCopy } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useContext, useEffect } from "react";
import { AppContext } from "../../AppContext";

// TODO: rename "stacked" to "split" - semantically
export type SystemLayout = "merged" | "stacked" | "frozen";

interface LayoutSelectorProps {
  systemLayout: SystemLayout;
  setSystemLayout: React.Dispatch<React.SetStateAction<SystemLayout>>;
  onCopyPath: () => void;
}

const LayoutSelector: React.FC<LayoutSelectorProps> = ({
  systemLayout,
  setSystemLayout,
  onCopyPath,
}) => {
  const { registerKeyboardHandler, unregisterKeyboardHandler } =
    useContext(AppContext);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "f") {
        setSystemLayout((prevLayout) => {
          if (prevLayout === "frozen" || prevLayout === "stacked")
            return "merged";
          return "frozen";
        });
      }
    };

    registerKeyboardHandler("frozenLayoutSwitch", handleKeyPress);
    return () => {
      unregisterKeyboardHandler("frozenLayoutSwitch");
    };
  }, [registerKeyboardHandler, unregisterKeyboardHandler, setSystemLayout]);

  return (
    <div
      style={{
        position: "fixed",
        top: 40,
        right: 0,
        zIndex: 1000000,
        backgroundColor: "black",
        marginRight: 0,
        padding: 10,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column" }}>
        <label key={"stacked"} className="inline">
          <input
            onChange={() => setSystemLayout("stacked")}
            type="radio"
            name="system-layout"
            checked={systemLayout === "stacked"}
            value={"stacked"}
          />
          ☰
        </label>
        <label key={"merged"} className="inline">
          <input
            onChange={() => setSystemLayout("merged")}
            type="radio"
            name="system-layout"
            checked={systemLayout === "merged"}
            value={"merged"}
          />
          █
        </label>
        <label key={"frozen"} className="inline">
          <input
            onChange={() => setSystemLayout("frozen")}
            type="radio"
            name="system-layout"
            checked={systemLayout === "frozen"}
            value={"frozen"}
          />
          🧊
        </label>
        <FontAwesomeIcon
          icon={faCopy}
          style={{
            cursor: "pointer",
            width: "15px",
            color: "gray",
            marginLeft: "10px",
            marginTop: "10px",
          }}
          onClick={onCopyPath}
        />
      </div>
    </div>
  );
};

export default LayoutSelector;
