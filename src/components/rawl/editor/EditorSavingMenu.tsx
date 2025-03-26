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
import { AppContext } from "../../AppContext";
import { Analysis } from "../analysis";

// Constants
const BACKUP_PREFIX = "rawl_backup_";

// Interfaces
interface BackupData {
  code: string;
  timestamp: number;
}

interface EditorSavingMenuProps {
  score: string;
  initialSource: string;
  id?: string;
  slug?: string;
  version?: number;
  history: any;
  setError: (error: string | null) => void;
  analysis?: Analysis;
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

const BackupInfo = styled.div`
  font-size: 12px;
  color: #888;
  margin-bottom: 10px;
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

const EditorSavingMenu: React.FC<EditorSavingMenuProps> = ({
  score,
  initialSource,
  id,
  slug,
  version,
  history,
  setError,
}) => {
  const [backup, setBackup] = useState<BackupData | null>(null);
  const [shortLink, setShortLink] = useState<string | null>(null);
  const [publishTitle, setPublishTitle] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);
  const [versions, setVersions] = useState<number>(version || 0);
  const [allVersionsContent, setAllVersionsContent] = useState<string[]>([]);
  const [documentUpdatedAt, setDocumentUpdatedAt] = useState<Date | null>(null);
  const [showToast, setShowToast] = useState(false);

  // Get user from context instead of directly from Firebase
  const appContext = useContext(AppContext);
  const user = appContext?.user;

  // Get URL key for localStorage
  const getUrlKey = () => {
    return id ? `/ef/${id}` : slug ? `/e/${slug}` : "";
  };

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
            const data = docSnap.data();
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

  // Check for backup once we have document details
  useEffect(() => {
    // Check for backup
    const urlKey = getUrlKey();
    if (urlKey) {
      const backupKey = BACKUP_PREFIX + urlKey;
      const savedBackup = localStorage.getItem(backupKey);
      if (savedBackup) {
        try {
          const parsed = JSON.parse(savedBackup);

          // Don't show backup if it's identical to initial source or current code
          if (parsed.code === initialSource || parsed.code === score) {
            setBackup(null);
            return;
          }

          // Don't show backup if it matches any version of the document
          if (allVersionsContent.some((version) => version === parsed.code)) {
            setBackup(null);
            return;
          }

          // Don't show backup if it was saved before document was last updated
          if (
            documentUpdatedAt &&
            parsed.timestamp < documentUpdatedAt.getTime()
          ) {
            setBackup(null);
            return;
          }

          // If we've passed all checks, show the backup
          setBackup(parsed);
        } catch (e) {
          console.error("Failed to parse backup:", e);
        }
      }
    }
  }, [id, slug, initialSource, score, documentUpdatedAt, allVersionsContent]);

  // Handle restore from backup
  const handleRestore = () => {
    if (backup && backup.code) {
      const confirmed = window.confirm(
        "Are you sure you want to restore from backup? This will replace your current code.",
      );
      if (confirmed) {
        // Dispatch a custom event with the backup code
        const event = new CustomEvent("rawl-restore-backup", {
          detail: { code: backup.code },
        });
        window.dispatchEvent(event);

        // Clear the backup after restoration
        setBackup(null);
      }
    }
  };

  // Handle publish button click - renamed to handleSaveClick
  const handleSaveClick = () => {
    if (!publishTitle.trim()) {
      setError("Please enter a title for your score");
      return;
    }
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
          const data = docSnap.data();
          const versions = data.versions || [];

          // Add the new version
          versions.push(score);

          // Update the document
          await updateDoc(docRef, {
            title: publishTitle.trim(),
            versions,
            updatedAt: serverTimestamp(),
          });

          // Redirect to the new version URL
          const newVersionNumber = versions.length;
          const newShortLink = `/ef/${id}/${newVersionNumber}`;
          setShortLink(newShortLink);
          history.push(newShortLink);
          setVersions(newVersionNumber);
        }
      } else {
        // Create new document with first version
        const docRef = await addDoc(editsCollection, {
          title: publishTitle.trim(),
          versions: [score], // Initialize versions array with current score
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          owner: user ? user.uid : null, // Use user from context
        });

        // Redirect to the new version URL
        const newShortLink = `/ef/${docRef.id}/1`;
        setShortLink(newShortLink);
        history.push(newShortLink);
        setVersions(1);
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

  // Also save backups automatically when the score changes
  useEffect(() => {
    const urlKey = getUrlKey();
    if (!urlKey || score === initialSource) return;

    const backupKey = BACKUP_PREFIX + urlKey;

    // Check if we already have a backup that matches this code
    const existingBackup = localStorage.getItem(backupKey);
    if (existingBackup) {
      try {
        const parsed = JSON.parse(existingBackup);
        // Don't update if the code is the same
        if (parsed.code === score) return;
      } catch (e) {
        // If parsing fails, continue with saving the new backup
        console.error("Failed to parse existing backup:", e);
      }
    }

    // Don't save backup if it matches any version of the document
    if (allVersionsContent.some((version) => version === score)) return;

    const backup: BackupData = {
      code: score,
      timestamp: Date.now(),
    };

    localStorage.setItem(backupKey, JSON.stringify(backup));
  }, [score, initialSource, id, slug, allVersionsContent]);

  return (
    <SavingMenuContainer>
      {backup && backup.timestamp !== null && (
        <BackupInfo>
          Backup from {formatBackupTime(backup.timestamp)}{" "}
          <Button onClick={handleRestore}>Restore</Button>
        </BackupInfo>
      )}

      {user ? (
        <MenuRow>
          <Input
            type="text"
            placeholder="Enter title to save..."
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
          <SignInLink href="#" onClick={appContext?.handleLogin}>
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
