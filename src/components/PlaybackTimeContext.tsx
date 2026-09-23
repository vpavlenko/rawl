import React, { createContext, useEffect, useState } from "react";

export const PlaybackTimeContext = createContext<number | null>(null);

// Only snippet previews subscribe to this coarse clock. Keep it out of App's
// state/general context so a time tick cannot re-render every score and route.
export const PlaybackTimeProvider: React.FC<{
  getTime: () => number | null;
  children: React.ReactNode;
}> = ({ getTime, children }) => {
  const [time, setTime] = useState<number | null>(null);
  useEffect(() => {
    const update = () => setTime(getTime());
    update();
    const timer = setInterval(update, 100);
    return () => clearInterval(timer);
  }, [getTime]);
  return <PlaybackTimeContext.Provider value={time}>{children}</PlaybackTimeContext.Provider>;
};
