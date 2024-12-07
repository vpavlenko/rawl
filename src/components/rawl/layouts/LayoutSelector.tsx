import React, { useContext, useEffect } from "react";
import { AppContext } from "../../AppContext";

export type SystemLayout = "merged" | "frozen";

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
          if (prevLayout === "frozen") return "merged";
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
