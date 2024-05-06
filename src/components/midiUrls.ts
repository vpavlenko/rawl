import { doc, getDoc, getFirestore } from "firebase/firestore/lite";
import { Location } from "history";
import { CATALOG_PREFIX } from "../config";
import { saveMidi } from "./rawl/midiStorage";

export const processMidiUrlsInApp = (
  location: Location,
  handleSongClick: (url: string) => void,
) => {
  const params = new URLSearchParams(location.search);

  const link = params.get("link");
  if (link) {
    saveMidi(link);
    handleSongClick(`https://corsproxy.io/?${atob(link)}`);
  }

  const [_, urlSlug] = location.pathname.split("/f/");
  if (urlSlug) {
    const playSlug = async () => {
      const firestore = getFirestore();
      const index = await getDoc(doc(firestore, "indexes", "midis"));
      const filteredMidis = index
        .data()
        .midis.filter(({ slug }) => slug === urlSlug);
      if (filteredMidis.length > 1) {
        alert(`More than one midi is found for a slug ${urlSlug}`);
      } else if (filteredMidis.length === 0) {
        alert(`No midi is found for a slug ${urlSlug}`);
      } else {
        const { id } = filteredMidis[0];
        handleSongClick(`f:${id}`);
      }
    };
    playSlug();
  } else {
    const [_, chiptuneUrl] = location.pathname.split("/c/");
    if (chiptuneUrl) {
      handleSongClick(CATALOG_PREFIX + encodeURI(encodeURI(chiptuneUrl)));
    }
  }
};