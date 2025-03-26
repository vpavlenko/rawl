import { useLocalStorage } from "usehooks-ts";

export interface BackupData {
  score: string;
  timestamp: number;
  sessionTime: number;
}

export function useBackup(effectiveSlug: string) {
  const backupKey = `rawl_backup_${effectiveSlug}`;

  const [backup, originalSetBackup, removeBackup] =
    useLocalStorage<BackupData | null>(backupKey, null);

  // Wrapped setBackup function that only saves if the score is different
  const setBackup = (newBackup: BackupData) => {
    // Only update if we don't have a backup yet, or if the score content has changed
    if (!backup || backup.score !== newBackup.score) {
      originalSetBackup(newBackup);
    }
  };

  return {
    backup,
    setBackup,
    removeBackup,
    backupKey,
  };
}
