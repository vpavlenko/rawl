import { faClipboard } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getFirestore,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore/lite";
import React, { useEffect, useState } from "react";
import styled from "styled-components";
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
  color: white;
  text-decoration: ${(props) => (props.isActive ? "none" : "underline")};
  font-weight: ${(props) => (props.isActive ? "bold" : "normal")};
  cursor: pointer;

  &:hover {
    opacity: 0.8;
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

  // Get URL key for localStorage
  const getUrlKey = () => {
    return id ? `/ef/${id}` : slug ? `/e/${slug}` : "";
  };

  // Initialize component
  useEffect(() => {
    // Check for backup
    const urlKey = getUrlKey();
    if (urlKey) {
      const backupKey = BACKUP_PREFIX + urlKey;
      const savedBackup = localStorage.getItem(backupKey);
      if (savedBackup) {
        try {
          const parsed = JSON.parse(savedBackup);
          // Only show if backup is different from both initial source and current code
          if (parsed.code !== initialSource && parsed.code !== score) {
            setBackup(parsed);
          } else {
            setBackup(null);
          }
        } catch (e) {
          console.error("Failed to parse backup:", e);
        }
      }
    }
  }, [id, slug, initialSource, score]);

  // Update to load existing versions if id is provided
  useEffect(() => {
    if (id) {
      // If we have an ID, fetch the document to get versions count
      const fetchVersions = async () => {
        try {
          const db = getFirestore();
          const docRef = doc(db, "edits", id);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const data = docSnap.data();
            // Set the versions count and the title from the existing document
            setVersions(data.versions?.length || 0);
            setPublishTitle(data.title || "");
          }
        } catch (error) {
          console.error("Error fetching versions:", error);
        }
      };

      fetchVersions();
    }
  }, [id]);

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
      alert("URL copied to clipboard!");
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
    const backup: BackupData = {
      code: score,
      timestamp: Date.now(),
    };

    localStorage.setItem(backupKey, JSON.stringify(backup));
  }, [score, initialSource, id, slug]);

  return (
    <SavingMenuContainer>
      {backup &&
        backup.timestamp !== null &&
        backup.code !== initialSource &&
        backup.code !== score && (
          <BackupInfo>
            Backup from {formatBackupTime(backup.timestamp)}{" "}
            <Button onClick={handleRestore}>Restore</Button>
          </BackupInfo>
        )}

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

      {id && versions > 0 && (
        <VersionLinks>
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

      {shortLink && (
        <MenuRow>
          <Input type="text" value={shortLink} readOnly />
          <Button onClick={handleCopyUrl}>
            <FontAwesomeIcon icon={faClipboard} /> Copy
          </Button>
        </MenuRow>
      )}
    </SavingMenuContainer>
  );
};

export default EditorSavingMenu;
