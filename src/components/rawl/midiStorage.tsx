import {
  Bytes,
  addDoc,
  arrayUnion,
  collection,
  doc,
  getDoc,
  getFirestore,
  updateDoc,
} from "firebase/firestore/lite";
import { Location } from "history";
import * as React from "react";
import { useState } from "react";
import { slugify } from "transliteration";
import { CATALOG_PREFIX } from "../../config";

export const processMidiUrls = (
  location: Location,
  handleSongClick: (url: string) => void,
) => {
  const params = new URLSearchParams(location.search);

  const link = params.get("link");
  if (link) {
    saveMidiFromLink(link);
    // handleSongClick(`https://corsproxy.io/?${atob(link)}`);
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

const saveMidi = async (title: string, url: string, midi: ArrayBuffer) => {
  const slug = slugify(title);
  const firestoreBlob = Bytes.fromUint8Array(new Uint8Array(midi));
  const firestore = getFirestore();

  const docRef = await addDoc(collection(firestore, "midis"), {
    blob: firestoreBlob,
    url,
    title,
    slug,
  });
  console.log("Document written with ID:", docRef.id);

  const indexRef = doc(firestore, "indexes", "midis");
  await updateDoc(indexRef, {
    midis: arrayUnion({ title, slug, id: docRef.id }),
  });
  window.location.href = `/f/${slug}`;
};

export const saveMidiFromLink = async (link: string) => {
  try {
    const params = new URLSearchParams(window.location.search);

    const link = atob(params.get("link") || "");
    const url = atob(params.get("pageUrl") || "");
    debugger;
    const title = decodeURIComponent(
      atob(decodeURIComponent(params.get("title") || ""))
        .split("")
        .map((char) => "%" + ("00" + char.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );

    const response = await fetch(`https://corsproxy.io/?${link}`, {
      method: "GET",
    });
    if (!response.ok) {
      throw new Error(`HTTP error. Status: ${response.status}`);
    }

    const midi = await (await response.blob()).arrayBuffer();
    saveMidi(title, url, midi);
  } catch (error) {
    alert(`Fetching binary file failed: ${JSON.stringify(error)}`);
  }
};

export const DropSaveForm: React.FC<{ midi: ArrayBuffer }> = ({ midi }) => {
  const [title, setTitle] = useState<string>("");

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(event.target.value);
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      saveMidi(title, "drop", midi);
    }
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Enter a title"
        value={title}
        onChange={handleInputChange}
        onKeyDown={handleKeyPress}
        style={{ width: "30em" }}
      />
    </div>
  );
};
