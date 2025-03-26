import { useEffect, useState } from "react";

export interface BackupData {
  score: string;
  timestamp: number;
  sessionTime: number;
}

export function useBackup(effectiveSlug: string) {
  const backupKey = `rawl_backup_${effectiveSlug}`;

  // Initialize state from localStorage or null
  const [backup, setBackupState] = useState<BackupData | null>(() => {
    try {
      const item = localStorage.getItem(backupKey);
      console.log(
        `[Backup] Retrieving backup for ${effectiveSlug}:`,
        item ? "Found" : "Not found",
      );
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error("Error reading from localStorage:", error);
      return null;
    }
  });

  // Update localStorage when backup changes
  useEffect(() => {
    if (backup) {
      try {
        // Check if localStorage already has the same score content
        const existingBackup = localStorage.getItem(backupKey);
        const existingData = existingBackup ? JSON.parse(existingBackup) : null;

        if (!existingData || existingData.score !== backup.score) {
          console.log(`[Backup] Saving backup for ${effectiveSlug}`, {
            timestamp: new Date(backup.timestamp).toLocaleString(),
            sessionTime: backup.sessionTime,
            scoreLength: backup.score.length,
          });
          localStorage.setItem(backupKey, JSON.stringify(backup));
        } else {
          console.log(
            `[Backup] Skipping localStorage save - score content unchanged`,
          );
        }
      } catch (error) {
        console.error("Error checking/saving backup to localStorage:", error);
      }
    }
  }, [backup, backupKey]);

  // Wrapped setBackup function that only saves if the score is different
  const setBackup = (newBackup: BackupData) => {
    // Only update if we don't have a backup yet, or if the score content has changed
    if (!backup || backup.score !== newBackup.score) {
      console.log(
        `[Backup] Updating backup for ${effectiveSlug} - content changed`,
      );
      setBackupState(newBackup);
    } else {
      console.log(
        `[Backup] Skipping backup for ${effectiveSlug} - no content change`,
      );
    }
  };

  // Function to remove backup from state and localStorage
  const removeBackup = () => {
    console.log(`[Backup] Removing backup for ${effectiveSlug}`);
    localStorage.removeItem(backupKey);
    setBackupState(null);
  };

  return {
    backup,
    setBackup,
    removeBackup,
    backupKey,
  };
}
