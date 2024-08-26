import {
  Bytes,
  addDoc,
  arrayUnion,
  collection,
  doc,
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
    handleSongClick(`f:${urlSlug}`);
  } else {
    const [_, chiptuneUrl] = location.pathname.split("/c/");
    if (chiptuneUrl) {
      handleSongClick(CATALOG_PREFIX + encodeURI(encodeURI(chiptuneUrl)));
    }
  }
};

const saveMidi = async (
  title: string,
  sourceUrl: string,
  midi: ArrayBuffer,
) => {
  const slug = slugify(title);
  const firestoreBlob = Bytes.fromUint8Array(new Uint8Array(midi));
  const firestore = getFirestore();

  const docRef = await addDoc(collection(firestore, "midis"), {
    blob: firestoreBlob,
    url: sourceUrl, // This is correct, we're storing it as 'url' in Firestore
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

export const DropSaveForm: React.FC<{
  midi: ArrayBuffer;
  filename: string;
}> = ({ midi, filename }) => {
  const [title, setTitle] = useState<string>(filename);
  const [sourceUrl, setSourceUrl] = useState<string>("");
  const titleInputRef = React.useRef<HTMLInputElement>(null);

  // Add useEffect hook to focus and select the title input
  React.useEffect(() => {
    if (titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, []);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(event.target.value);
  };

  const handleUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSourceUrl(event.target.value);
  };

  const handleSave = () => {
    if (title.trim() !== "") {
      saveMidi(title, sourceUrl || "drop", midi);
    } else {
      if (titleInputRef.current) {
        titleInputRef.current.style.backgroundColor = "red";
        setTimeout(() => {
          if (titleInputRef.current) {
            titleInputRef.current.style.backgroundColor = "";
          }
        }, 1000);
      }
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleSave();
    }
  };

  return (
    <div>
      <input
        ref={titleInputRef}
        type="text"
        placeholder="Enter a title"
        value={title}
        onChange={handleInputChange}
        onKeyDown={handleKeyPress}
        style={{ width: "30em" }}
      />
      <input
        type="text"
        placeholder="Enter a source URL (optional)"
        value={sourceUrl}
        onChange={handleUrlChange}
        onKeyDown={handleKeyPress}
        style={{ width: "30em", marginTop: "10px" }}
      />
      <button onClick={handleSave} style={{ marginTop: "10px" }}>
        Save
      </button>
    </div>
  );
};
