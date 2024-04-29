import {
  Bytes,
  addDoc,
  arrayUnion,
  collection,
  doc,
  getFirestore,
  updateDoc,
} from "firebase/firestore/lite";

function formatForURL(title: string): string {
  let processedTitle = title.toLowerCase();
  processedTitle = processedTitle
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, ""); // remove diacritics
  processedTitle = processedTitle.replace(/[^a-z0-9\s-]/g, "_");
  processedTitle = processedTitle.replace(/[\s-]+/g, "_");
  processedTitle = processedTitle.replace(/_+/g, "_");
  processedTitle = processedTitle.replace(/^_+|_+$/g, "");
  return processedTitle;
}

export const saveMidi = async (link: string) => {
  try {
    const params = new URLSearchParams(window.location.search);

    const link = atob(params.get("link") || "");
    const url = atob(params.get("pageUrl") || "");
    const title = atob(params.get("title") || "");
    const slug = formatForURL(title);

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
      slug,
    });
    console.log("Document written with ID:", docRef.id);

    const indexRef = doc(firestore, "indexes", "midis");
    await updateDoc(indexRef, {
      midis: arrayUnion({ title, slug, id: docRef.id }),
    });
    window.location.href = `/browse/f/${slug}`;
  } catch (error) {
    alert(`Fetching binary file failed: ${JSON.stringify(error)}`);
  }
};
