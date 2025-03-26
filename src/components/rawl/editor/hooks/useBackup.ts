import { useLocalStorage } from "usehooks-ts";

export interface BackupData {
  score: string;
  timestamp: number;
  sessionTime: number;
}

export function useBackup(effectiveSlug: string) {
  const backupKey = `rawl_backup_${effectiveSlug}`;
  const [backup, setBackup, removeBackup] = useLocalStorage<BackupData | null>(
    backupKey,
    null,
  );

  return {
    backup,
    setBackup,
    removeBackup,
    backupKey,
  };
}
