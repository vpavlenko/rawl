import React from "react";

export const AppContext = React.createContext<{
  handleSongClick: (url: string) => void;
}>({
  handleSongClick: () => {},
});
