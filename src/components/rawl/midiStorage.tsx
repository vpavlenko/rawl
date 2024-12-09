import {
  Bytes,
  addDoc,
  arrayUnion,
  collection,
  doc,
  getDocs,
  getFirestore,
  query,
  updateDoc,
  where,
} from "firebase/firestore/lite";
import * as React from "react";
import { useState } from "react";
import { slugify } from "transliteration";
import { FOOTER_HEIGHT } from "../AppFooter";

const saveMidi = async (
  title: string,
  sourceUrl: string,
  midi: ArrayBuffer,
) => {
  let slug = slugify(title);
  const firestore = getFirestore();

  // Check if the slug already exists
  const checkSlugExists = async (slugToCheck: string) => {
    const q = query(
      collection(firestore, "midis"),
      where("slug", "==", slugToCheck),
    );
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  };

  // If slug exists, append random characters
  if (await checkSlugExists(slug)) {
    const randomChars = Math.random().toString(16).substring(2, 8);
    slug = `${slug}-${randomChars}`;
  }

  const firestoreBlob = Bytes.fromUint8Array(new Uint8Array(midi));

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

    const response = await fetch(`${link}`, {
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
    <div style={{ position: "fixed", bottom: FOOTER_HEIGHT }}>
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
