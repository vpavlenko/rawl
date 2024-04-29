import {
  Bytes,
  addDoc,
  collection,
  getFirestore,
} from "firebase/firestore/lite";

export const saveMidi = async (link: string) => {
  try {
    const params = new URLSearchParams(window.location.search);

    const link = atob(params.get("link") || "");
    const url = atob(params.get("pageUrl") || "");
    const title = atob(params.get("title") || "");

    const response = await fetch(`https://corsproxy.io/?${link}`, {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error(`HTTP error. Status: ${response.status}`);
    }

    const firestoreBlob = Bytes.fromUint8Array(
      new Uint8Array(await (await response.blob()).arrayBuffer()),
    );

    const firestore = getFirestore();

    const docRef = await addDoc(collection(firestore, "midis"), {
      blob: firestoreBlob,
      url,
      title,
    });
    console.log("Document written with ID:", docRef.id);
  } catch (error) {
    alert(`Fetching binary file failed: ${JSON.stringify(error)}`);
  }
};
