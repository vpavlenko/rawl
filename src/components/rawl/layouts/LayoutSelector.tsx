import React, { useContext, useEffect } from "react";
import { AppContext } from "../../AppContext";

// TODO: rename "stacked" to "split" - semantically
export type SystemLayout = "merged" | "stacked" | "frozen";

interface LayoutSelectorProps {
  setSystemLayout: React.Dispatch<React.SetStateAction<SystemLayout>>;
}

const LayoutSelector: React.FC<LayoutSelectorProps> = ({ setSystemLayout }) => {
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

  return <></>;
};

export default LayoutSelector;
