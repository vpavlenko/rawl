import {
  addDoc,
  collection,
  doc,
  getDoc,
  getFirestore,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore/lite";
import React, { useContext, useEffect, useState } from "react";
import styled from "styled-components";
import { FirestoreEditDocument } from "../../../types/firestore"; // Import the type definition
import { AppContext } from "../../AppContext";
import { Analysis } from "../analysis";
import { useBackup } from "./hooks/useBackup"; // Import the new hook

interface EditorSavingMenuProps {
  effectiveSlug: string;
  score: string;
  initialSource: string;
  id?: string;
  slug?: string;
  version?: number;
  history: any;
  setError: (error: string | null) => void;
  analysis?: Analysis;
  onRestoreBackup?: (code: string) => void;
  onPreviewBackup?: (code: string) => void;
  onRestorePreview?: (code: string) => void;
}

// Styled components
const SavingMenuContainer = styled.div`
  margin-bottom: 15px;
  padding: 10px;
  border-bottom: 1px solid #444;
`;

const MenuRow = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 10px;
`;

const Button = styled.button`
  background-color: #2a2a2a;
  color: white;
  border: 1px solid #444;
  padding: 5px 10px;
  margin-right: 10px;
  cursor: pointer;
  font-size: 14px;
  &:hover {
    background-color: #444;
  }
`;

const Input = styled.input`
  background-color: #1e1e1e;
  color: white;
  border: 1px solid #444;
  padding: 5px 10px;
  margin-right: 10px;
  flex: 1;
`;

const Label = styled.span`
  color: white;
  margin-right: 8px;
`;

const BackupInfo = styled.div`
  font-size: 12px;
  color: #888;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
`;

// Add new styled component for version links
const VersionLinks = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
`;

const VersionLink = styled.a<{ isActive: boolean }>`
  color: ${(props) => (props.isActive ? "white" : "gray")};
  text-decoration: ${(props) => (props.isActive ? "none" : "underline")};
  font-weight: ${(props) => (props.isActive ? "bold" : "normal")};
  cursor: pointer;

  &:hover {
    opacity: 0.8;
  }
`;

// Add these new styled components
const ClickableLink = styled.div`
  color: #4a9eff;
  cursor: pointer;
  text-decoration: underline;
  display: inline-block;
  margin-bottom: 10px;

  &:hover {
    opacity: 0.8;
  }
`;

const ToastNotification = styled.div`
  background-color: #333;
  color: white;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 12px;
  position: absolute;
  margin-top: 5px;
  animation: fadeIn 0.3s;

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

// Add a new styled component for the sign-in message
const SignInMessage = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  font-size: 14px;
  color: #888;
`;

const SignInLink = styled.a`
  color: #fff;
  cursor: pointer;
  margin-left: 5px;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

// Add new styled component for the interactive backup text
const BackupText = styled.span`
  color: #4a9eff;
  cursor: pointer;
  display: inline-block;
  &:hover {
    text-decoration: underline;
  }
`;

const EditorSavingMenu: React.FC<EditorSavingMenuProps> = ({
  score,
  initialSource,
  id,
  slug,
  effectiveSlug,
  version,
  history,
  setError,
  onRestoreBackup,
  onPreviewBackup,
  onRestorePreview,
}) => {
  // Replace the direct use of getBackupKey and useLocalStorage with the custom hook
  const { backup, removeBackup } = useBackup(effectiveSlug);

  const [shortLink, setShortLink] = useState<string | null>(null);
  // Initialize publishTitle from localStorage if available
  const [publishTitle, setPublishTitle] = useState(() => {
    // If there's a title in localStorage, use it
    const storedTitle = localStorage.getItem("new_editor_title");
    if (storedTitle) {
      // Remove the title from localStorage after retrieving it
      localStorage.removeItem("new_editor_title");
      return storedTitle;
    }
    return "";
  });
  const [isPublishing, setIsPublishing] = useState(false);
  const [versions, setVersions] = useState<number>(version || 0);
  const [allVersionsContent, setAllVersionsContent] = useState<string[]>([]);
  const [documentUpdatedAt, setDocumentUpdatedAt] = useState<Date | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [isHoveringBackup, setIsHoveringBackup] = useState(false);
  const [originalScore, setOriginalScore] = useState<string | null>(null);
  const [editorMountTime, setEditorMountTime] = useState<number | null>(null);

  // Get user from context instead of directly from Firebase
  const appContext = useContext(AppContext);
  const user = appContext?.user;

  // Initialize short link based on current ID and version
  useEffect(() => {
    if (id && version) {
      setShortLink(`/ef/${id}/${version}`);
    } else if (id) {
      setShortLink(`/ef/${id}`);
    } else if (slug) {
      setShortLink(`/e/${slug}`);
    }
  }, [id, slug, version]);

  // Initialize component and fetch document details
  useEffect(() => {
    if (id) {
      // If we have an ID, fetch the document to get versions count, updatedAt and all versions content
      const fetchDocumentDetails = async () => {
        try {
          const db = getFirestore();
          const docRef = doc(db, "edits", id);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const data = docSnap.data() as FirestoreEditDocument;
            // Set the versions count and the title from the existing document
            setVersions(data.versions?.length || 0);
            setPublishTitle(data.title || "");

            // Store all versions content for comparison with backup
            if (data.versions && Array.isArray(data.versions)) {
              setAllVersionsContent(data.versions);
            }

            // Store document's updatedAt timestamp
            if (data.updatedAt) {
              setDocumentUpdatedAt(data.updatedAt.toDate());
            }
          }
        } catch (error) {
          console.error("Error fetching document details:", error);
        }
      };

      fetchDocumentDetails();
    }
  }, [id]);

  // Listen for the editor mount time event
  useEffect(() => {
    const handleEditorMounted = (e: CustomEvent<{ mountTime: number }>) => {
      if (e.detail && e.detail.mountTime) {
        setEditorMountTime(e.detail.mountTime);
      }
    };

    window.addEventListener(
      "rawl-editor-mounted",
      handleEditorMounted as EventListener,
    );

    return () => {
      window.removeEventListener(
        "rawl-editor-mounted",
        handleEditorMounted as EventListener,
      );
    };
  }, []);

  // Update the backup check logic to use the hook and respect preview mode
  useEffect(() => {
    // Skip backup checks while we're hovering/previewing
    if (isHoveringBackup) {
      console.log("DEBUG: Skipping backup removal check during hover preview");
      return;
    }

    // Don't show backup if it's identical to initial source or current code
    if (backup && (backup.score === initialSource || backup.score === score)) {
      console.log(
        "DEBUG: Removing backup - matches current code or initial source",
      );
      removeBackup();
      return;
    }

    // Don't show backup if it matches any version of the document
    if (
      backup &&
      allVersionsContent.some((version) => version === backup.score)
    ) {
      console.log("DEBUG: Removing backup - matches a saved version");
      removeBackup();
      return;
    }

    // Don't show backup if it was saved before document was last updated
    if (
      backup &&
      documentUpdatedAt &&
      backup.timestamp < documentUpdatedAt.getTime()
    ) {
      console.log("DEBUG: Removing backup - older than document update time");
      removeBackup();
      return;
    }

    // Don't show backup if it was created in this editing session
    if (
      backup &&
      editorMountTime &&
      backup.sessionTime &&
      backup.sessionTime >= editorMountTime
    ) {
      console.log("DEBUG: Removing backup - created in current session");
      removeBackup();
      return;
    }
  }, [
    backup,
    removeBackup,
    initialSource,
    score,
    documentUpdatedAt,
    allVersionsContent,
    editorMountTime,
    isHoveringBackup,
  ]);

  // Handle restore from backup
  const handleRestore = () => {
    if (backup && backup.score) {
      // Use callback instead of dispatching event
      if (onRestoreBackup) {
        onRestoreBackup(backup.score);
      }

      // Clear the backup after restoration
      removeBackup();
    }
  };

  // Update handleDiscardBackup to use removeBackup
  const handleDiscardBackup = () => {
    removeBackup();
  };

  // Add handlers for hover events
  const handleBackupMouseEnter = () => {
    if (backup && backup.score) {
      console.log("DEBUG: Backup mouse enter triggered");
      setIsHoveringBackup(true);
      setOriginalScore(score);

      // Use callback instead of dispatching event
      if (onPreviewBackup) {
        console.log("DEBUG: Calling onPreviewBackup with backup score");
        onPreviewBackup(backup.score);
      }
    }
  };

  const handleBackupMouseLeave = () => {
    console.log("DEBUG: Backup mouse leave triggered", {
      isHoveringBackup,
      hasOriginalScore: Boolean(originalScore),
    });

    if (isHoveringBackup) {
      setIsHoveringBackup(false);

      // Only restore preview if we have an original score saved
      if (originalScore && onRestorePreview) {
        console.log("DEBUG: Calling onRestorePreview with original score");
        onRestorePreview(originalScore);
        setOriginalScore(null);
      }
    }
  };

  // Calculate diff length between current score and backup
  const calculateDiffLength = () => {
    if (!backup || !backup.score) return 0;

    const backupLength = backup.score.length;
    const currentLength = score.length;

    return backupLength - currentLength;
  };

  // Format diff length as a string
  const formatDiffLength = () => {
    const diff = calculateDiffLength();
    if (diff === 0) return "same length";
    return diff > 0 ? `+${diff} chars` : `${diff} chars`;
  };

  // Handle publish button click - renamed to handleSaveClick
  const handleSaveClick = () => {
    // Remove validation that requires a title
    handleSave();
  };

  // Handle saving to firestore with versions
  const handleSave = async () => {
    if (!score.trim()) {
      setError("Cannot save empty score");
      return;
    }

    setIsPublishing(true);
    try {
      const db = getFirestore();
      const editsCollection = collection(db, "edits");

      if (id) {
        // Update existing document with new version
        const docRef = doc(db, "edits", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data() as FirestoreEditDocument;
          const versions = data.versions || [];

          // Add the new version
          versions.push(score);

          // Update the document - use title or empty string
          await updateDoc(docRef, {
            title: publishTitle.trim(), // This can be empty now
            versions,
            updatedAt: serverTimestamp(),
          });

          // Redirect to the new version URL
          const newVersionNumber = versions.length;
          const newShortLink = `/ef/${id}/${newVersionNumber}`;
          setShortLink(newShortLink);
          setVersions(newVersionNumber);
          history.push(newShortLink); // never remove this statement
        }
      } else {
        // Create new document with first version
        const newDoc: Omit<FirestoreEditDocument, "createdAt" | "updatedAt"> = {
          title: publishTitle.trim(), // This can be empty now
          versions: [score], // Initialize versions array with current score
          owner: user ? user.uid : null, // Use user from context
        };

        const docRef = await addDoc(editsCollection, {
          ...newDoc,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        // Redirect to the new version URL
        const newShortLink = `/ef/${docRef.id}/1`;
        setShortLink(newShortLink);
        setVersions(1);
        history.push(newShortLink); // never remove this statement
      }

      setError(null);
    } catch (error) {
      console.error("Error saving score:", error);
      setError("Failed to save score");
    } finally {
      setIsPublishing(false);
    }
  };

  // Handle key down for publish input
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSaveClick();
    }
  };

  // New function to handle version navigation
  const handleVersionClick = (versionNumber: number) => {
    if (id) {
      const versionLink = `/ef/${id}/${versionNumber}`;
      history.push(versionLink);
    }
  };

  // Handle copy URL to clipboard
  const handleCopyUrl = () => {
    if (shortLink) {
      const fullUrl = window.location.origin + shortLink;
      navigator.clipboard.writeText(fullUrl);
      setShowToast(true);

      // Hide toast after 1 second
      setTimeout(() => {
        setShowToast(false);
      }, 1000);
    }
  };

  // Format backup time
  const formatBackupTime = (timestamp: number | null) => {
    if (!timestamp) return "unknown time";

    const date = new Date(timestamp);
    const now = new Date();

    // Format the time part (3:12am)
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? "pm" : "am";
    const formattedHours = hours % 12 || 12; // Convert 0 to 12 for 12am
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    const timeStr = `${formattedHours}:${formattedMinutes}${ampm}`;

    // Calculate relative date
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    // Determine relative date text
    const isToday =
      now.getDate() === date.getDate() &&
      now.getMonth() === date.getMonth() &&
      now.getFullYear() === date.getFullYear();

    const isYesterday =
      now.getDate() - 1 === date.getDate() &&
      now.getMonth() === date.getMonth() &&
      now.getFullYear() === date.getFullYear();

    let relativeDate = "";

    if (isToday) {
      if (diffHours < 1) {
        relativeDate = diffMins < 2 ? "just now" : `${diffMins}m ago`;
      } else {
        relativeDate = `${diffHours}h ago`;
      }
    } else if (isYesterday) {
      relativeDate = "yesterday";
    } else if (diffDays < 7) {
      relativeDate = `${diffDays}d ago`;
    } else {
      relativeDate = date.toLocaleDateString();
    }

    return `${timeStr} ${relativeDate}`;
  };

  return (
    <SavingMenuContainer>
      {backup && backup.timestamp !== null && (
        <BackupInfo>
          <BackupText
            onMouseEnter={handleBackupMouseEnter}
            onMouseLeave={handleBackupMouseLeave}
          >
            Backup
          </BackupText>
          {" from "}
          {formatBackupTime(backup.timestamp)} ({formatDiffLength()})
          <Button onClick={handleRestore}>Restore</Button>
          <Button onClick={handleDiscardBackup}>Discard</Button>
        </BackupInfo>
      )}

      {user ? (
        <MenuRow>
          <Label>Title:</Label>
          <Input
            type="text"
            placeholder="(optional)"
            value={publishTitle}
            onChange={(e) => setPublishTitle(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <Button onClick={handleSaveClick} disabled={isPublishing}>
            {isPublishing ? "Saving..." : "Save"}
          </Button>
        </MenuRow>
      ) : (
        <SignInMessage>
          <SignInLink href="#" onClick={() => appContext?.handleLogin()}>
            Sign in
          </SignInLink>
          &nbsp;to save scores
        </SignInMessage>
      )}

      {id && versions > 1 && (
        <VersionLinks>
          Versions:
          {Array.from({ length: versions }, (_, i) => i + 1).map(
            (versionNumber) => (
              <VersionLink
                key={versionNumber}
                isActive={version === versionNumber}
                onClick={() => handleVersionClick(versionNumber)}
              >
                {versionNumber}
              </VersionLink>
            ),
          )}
        </VersionLinks>
      )}

      {shortLink && id && versions > 0 && (
        <div style={{ position: "relative" }}>
          <ClickableLink onClick={handleCopyUrl}>
            {window.location.origin + shortLink}
          </ClickableLink>
          {showToast && (
            <ToastNotification>Copied to clipboard</ToastNotification>
          )}
        </div>
      )}
    </SavingMenuContainer>
  );
};

export default EditorSavingMenu;
