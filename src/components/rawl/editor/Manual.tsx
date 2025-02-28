import {
  faBook,
  faChartLine,
  faClockRotateLeft,
  faCloudArrowUp,
  faCopy,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { addDoc, collection, getFirestore } from "firebase/firestore/lite";
import React, { useContext, useEffect, useRef, useState } from "react";
import styled from "styled-components";
import editorMajorLayout from "../../../images/editor_major_layout.png";
import editorMinorLayout from "../../../images/editor_minor_layout.png";
import { AppContext } from "../../AppContext";
import { Analysis } from "../analysis";
import { parseKey } from "./commandParser";

// Constants for localStorage
const BACKUP_PREFIX = "rawl_backup_";

// Detect if user is on macOS to show Option vs Alt
const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
const altKey = isMac ? "Option" : "Alt";

// Interface for backup object
interface BackupData {
  code: string;
  timestamp: number;
}

// Function to detect if the first key signature is minor
const isMinorKey = (score: string): boolean => {
  // Split the score into lines and look for key signature declarations
  const lines = score.split("\n");

  for (const line of lines) {
    const cleanLine = line.split("%")[0].trim(); // Remove comments
    if (!cleanLine) continue;

    const key = parseKey(cleanLine);
    if (key) {
      // Found a key signature, check if it's minor
      console.log(
        `Detected key signature: ${key.mode} mode, tonic: ${key.tonic}`,
      );
      return key.mode === "minor";
    }
  }

  // Default to major if no key signature is found
  console.log("No key signature found in score, defaulting to major");
  return false;
};

const KeyboardLayout = styled.div`
  display: flex;
  flex-direction: column;
  padding: 10px;
  background: #1e1e1e;
  border-right: 1px solid #333;
  height: 100%;
  min-height: 0;
  overflow-y: auto;
  flex: 0 0 250px;
  font-size: 12px;
  color: #ccc;
  line-height: 1.6;

  .top-section {
    display: flex;
    flex-direction: row;
    margin-bottom: 20px;
  }

  .left-column {
    flex: 0 0 15vw;
    margin-right: 5px;
  }

  .right-column {
    flex: 1;
  }

  .full-width-section {
    width: 100%;
  }

  img {
    width: 100%;
    height: auto;
    object-fit: contain;
    z-index: 1;
  }

  .image-caption {
    margin-top: 4px;
    width: 100%;
    color: #999;
  }

  code {
    color: white;
    background: #2a2a2a;
    padding: 1px 4px;
    border-radius: 3px;
    white-space: nowrap;
  }

  .grid {
    display: grid;
    grid-template-columns: 190px 1fr;
    gap: 4px 8px;
    margin: 8px 0;
    align-items: center;
  }

  .note-col {
    text-align: right;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 4px;
  }

  .section {
    margin: 24px;
  }

  .section:first-child {
    margin-top: 0;
  }

  .section h3 {
    margin: 0px;
  }

  /* Customize scrollbar */
  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: #1e1e1e;
  }

  &::-webkit-scrollbar-thumb {
    background: #333;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #444;
  }
`;

const ButtonBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px;
  border-bottom: 1px solid #333;
  gap: 12px;
`;

const PublishButton = styled.button<{
  isPublishing?: boolean;
  hasChanges: boolean;
}>`
  background: ${(props) => (props.isPublishing ? "#999" : "#bbb")};
  color: black;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;

  &:hover {
    background: ${(props) => (props.isPublishing ? "#999" : "#ddd")};
  }

  &:active {
    background: ${(props) =>
      props.isPublishing ? "#999" : "rgb(255, 255, 255)"};
  }

  &:disabled {
    background: #666;
    cursor: not-allowed;
    color: black;

    &:hover::after {
      content: "No changes made";
      position: absolute;
      bottom: -30px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      white-space: nowrap;
      pointer-events: none;
    }
  }

  .spinner {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`;

const PublishedUrl = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  background: #2a2a2a;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 14px;
  color: #ddd;
  cursor: pointer;
  user-select: none;
  transition: background-color 0.2s;

  &:hover {
    background: #333;
  }

  .copy-button {
    color: #999;
    transition: color 0.2s;
  }

  &:hover .copy-button {
    color: #fff;
  }
`;

const RestoreButton = styled.button`
  background: #999;
  color: black;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
  max-width: 280px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  &:hover {
    background: #bbb;
  }

  &:active {
    background: #ccc;
  }

  .icon {
    margin-left: 6px;
    flex-shrink: 0;
  }
`;

const TelegramInput = styled.input`
  background: #2a2a2a;
  border: 1px solid #444;
  color: #ddd;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 14px;
  width: 300px;
  margin-right: auto;

  &:focus {
    outline: none;
    border-color: #666;
  }

  &::placeholder {
    color: #888;
  }
`;

const NoteBase = styled.div`
  position: relative;
  height: 6px;
  background: white;
  margin: 0 4px;
  display: inline-block;
  box-shadow: 0 0 0px 0.5px black;
  cursor: pointer;
  vertical-align: middle;
  border-radius: 2px;
`;

const BeatMarker = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  width: 2px;
  background: gray;
`;

const ViewToggle = styled.div`
  display: flex;
  align-items: center;
  background: #2a2a2a;
  border-radius: 4px;
  padding: 2px;
  margin-right: 10px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  position: relative;
  overflow: hidden;

  &:after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.1),
      transparent
    );
  }
`;

const ToggleButton = styled.button<{ active: boolean }>`
  background: ${(props) => (props.active ? "#444" : "transparent")};
  color: ${(props) => (props.active ? "#fff" : "#aaa")};
  border: none;
  padding: 6px 12px;
  border-radius: 3px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;
  position: relative;
  z-index: 2;
  min-width: 80px;
  justify-content: center;
  text-shadow: ${(props) =>
    props.active ? "0 0 8px rgba(255,255,255,0.2)" : "none"};

  &:hover {
    background: ${(props) => (props.active ? "#444" : "#333")};
    color: ${(props) => (props.active ? "#fff" : "#ccc")};
  }

  &:active {
    transform: translateY(1px);
  }

  svg {
    font-size: 14px;
    transition: transform 0.15s ease;
  }

  &:hover svg {
    transform: ${(props) => (props.active ? "scale(1.15)" : "none")};
  }

  &:before {
    content: "";
    position: absolute;
    bottom: 0;
    left: 6px;
    right: 6px;
    height: 1px;
    background: ${(props) =>
      props.active
        ? "linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)"
        : "transparent"};
    transition: opacity 0.2s;
    opacity: ${(props) => (props.active ? 1 : 0)};
  }
`;

const AnalysisView = styled.div`
  padding: 15px;
  height: 100%;
  overflow-y: auto;

  h3 {
    color: #ddd;
    margin: 0 0 15px 0;
    padding-bottom: 8px;
    border-bottom: 1px solid #333;
    font-size: 16px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .analysis-header {
    background: linear-gradient(to right, #1e2430, #2a3241);
    margin: -15px -15px 20px -15px;
    padding: 15px 20px;
    border-bottom: 1px solid #444;
    text-align: center;
  }

  .analysis-header h2 {
    color: #eee;
    font-size: 18px;
    margin: 0 0 8px 0;
    font-weight: 400;
  }

  .analysis-header p {
    color: #aaa;
    font-size: 12px;
    margin: 0;
    line-height: 1.6;
  }

  .musical-term {
    color: #7aafff;
    font-style: italic;
    font-weight: 500;
  }

  .section-divider {
    display: flex;
    align-items: center;
    margin: 25px 0 15px 0;
    color: #999;
    font-size: 14px;
  }

  .section-divider:before,
  .section-divider:after {
    content: "";
    flex: 1;
    border-bottom: 1px solid #444;
  }

  .section-divider:before {
    margin-right: 10px;
  }

  .section-divider:after {
    margin-left: 10px;
  }

  .analysis-section {
    margin-bottom: 24px;
    background: #1a1a1a;
    border-radius: 6px;
    padding: 16px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  .analysis-row {
    display: flex;
    margin: 10px 0;
    align-items: flex-start;
    padding: 8px 0;
    border-bottom: 1px dotted #333;
  }

  .analysis-row:last-child {
    border-bottom: none;
  }

  .analysis-key {
    width: 140px;
    color: #aaa;
    font-weight: 500;
    flex-shrink: 0;
  }

  .analysis-value {
    flex: 1;
    color: #ddd;
    line-height: 1.5;
  }

  .analysis-value > div {
    margin-bottom: 4px;
  }

  .analysis-object {
    margin-left: 20px;
  }

  .analysis-description {
    background: rgba(40, 44, 52, 0.5);
    border-left: 3px solid #555;
    padding: 10px 15px;
    margin-bottom: 20px;
    color: #bbb;
    font-style: italic;
    line-height: 1.6;
    border-radius: 0 4px 4px 0;
  }

  .analysis-explanation {
    font-size: 11px;
    color: #999;
    margin-top: 10px;
    padding-top: 5px;
    font-style: italic;
    line-height: 1.6;
    border-top: 1px dashed #444;
  }

  .analysis-info {
    color: #888;
    font-style: italic;
    margin-top: 15px;
    padding: 12px;
    border-top: 1px solid #333;
    text-align: center;
    background: rgba(40, 44, 52, 0.3);
    border-radius: 4px;
  }

  .modulation {
    display: inline-block;
    margin-right: 10px;
    margin-bottom: 8px;
    background: #2a2a2a;
    padding: 4px 8px;
    border-radius: 3px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  }

  .empty-analysis {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: #888;
    font-style: italic;
    text-align: center;
    line-height: 1.6;
    padding: 20px;
  }
`;

interface NoteExampleProps {
  beats: number;
  style?: { width: string };
}

const NoteExample: React.FC<NoteExampleProps> = ({ beats, style }) => {
  const beatMarkers = [];

  for (let i = 1; i < beats; i++) {
    beatMarkers.push(<BeatMarker key={i} style={{ right: `${i * 30}px` }} />);
  }

  return <NoteBase style={style}>{beatMarkers}</NoteBase>;
};

interface ManualProps {
  score: string;
  initialSource: string;
  id?: string;
  slug?: string;
  history: any;
  setError: (error: string | null) => void;
  analysis?: Analysis;
}

const AnalysisDisplay: React.FC<{ analysis: Analysis }> = ({ analysis }) => {
  // Helper function to convert pitch class number to note name
  const getPitchClassName = (pitchClass: number | null): string => {
    if (pitchClass === null) return "None";

    const noteNames = [
      "C",
      "C♯/D♭",
      "D",
      "D♯/E♭",
      "E",
      "F",
      "F♯/G♭",
      "G",
      "G♯/A♭",
      "A",
      "A♯/B♭",
      "B",
    ];
    return noteNames[pitchClass];
  };

  // Helper to wrap terms in a musical-term span
  const mt = (term: string) => <span className="musical-term">{term}</span>;

  if (!analysis) {
    return (
      <AnalysisView>
        <div className="empty-analysis">
          <FontAwesomeIcon
            icon={faChartLine}
            style={{ fontSize: "24px", marginBottom: "12px", opacity: 0.5 }}
          />
          <div>No analysis data available</div>
          <div style={{ fontSize: "11px", marginTop: "8px" }}>
            Analysis data would appear here when available
          </div>
        </div>
      </AnalysisView>
    );
  }

  const hasModulations =
    analysis.modulations && Object.keys(analysis.modulations).length > 0;
  const hasMeasureRenumbering =
    analysis.measureRenumbering &&
    Object.keys(analysis.measureRenumbering).length > 0;
  const hasForm = analysis.form && Object.keys(analysis.form).length > 0;
  const hasPhrasePatch =
    analysis.phrasePatch && analysis.phrasePatch.length > 0;
  const hasSections = analysis.sections && analysis.sections.length > 0;
  const hasTags = analysis.tags && analysis.tags.length > 0;
  const hasComment = analysis.comment && analysis.comment.trim() !== "";

  return (
    <AnalysisView>
      <div className="analysis-header">
        <h2>Musical Structure Analysis</h2>
        <p>Visual exploration of musical form, harmony, and phrase structure</p>
      </div>

      <div className="analysis-description">
        This visualization uses musical analysis to highlight structural
        elements of the music. Western classical music often follows patterns of
        regular phrasing, typically grouping measures in multiples of 2 or 4.{" "}
        {mt("Four-measure phrases")} are especially common, creating predictable
        musical "sentences" that give music its coherent and balanced feeling.
      </div>

      <div className="analysis-section">
        {(hasModulations || hasMeasureRenumbering) && (
          <>
            <div className="section-divider">Key and Measure Information</div>

            {hasModulations && (
              <div className="analysis-row">
                <div className="analysis-key">Modulations</div>
                <div className="analysis-value">
                  {Object.entries(analysis.modulations).map(
                    ([measure, tonic]) => (
                      <span key={measure} className="modulation">
                        Measure {measure}: white note is{" "}
                        {getPitchClassName(tonic)}
                        {tonic !== null
                          ? ` (pitch class ${tonic} out of 12)`
                          : ""}
                      </span>
                    ),
                  )}
                  <div className="analysis-explanation">
                    {mt("Modulations")} represent key changes throughout the
                    piece. Each modulation indicates when the{" "}
                    {mt("tonal center")} shifts to a new pitch class (0-11,
                    where 0 is C, 1 is C♯/D♭, etc.). In the visualization, white
                    notes highlight the current tonal center.
                  </div>
                </div>
              </div>
            )}

            {hasMeasureRenumbering && (
              <div className="analysis-row">
                <div className="analysis-key">Measure Renumbering</div>
                <div className="analysis-value">
                  {Object.entries(analysis.measureRenumbering).map(
                    ([source, target]) => (
                      <div key={source}>
                        Source {source} → Target {target}
                      </div>
                    ),
                  )}
                  <div className="analysis-explanation">
                    Measure renumbering adjusts the displayed measure numbers,
                    often to account for
                    {mt(" anacrusis")} (pickup measures) or editorial
                    conventions. This helps align the visualization with
                    standard score editions.
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {(hasForm || hasPhrasePatch || hasSections) && (
          <>
            <div className="section-divider">Phrase Structure and Form</div>

            {hasForm && (
              <div className="analysis-row">
                <div className="analysis-key">Form</div>
                <div className="analysis-value">
                  {Object.entries(analysis.form).map(
                    ([measure, sectionName]) => (
                      <div key={measure}>
                        <strong>{sectionName}</strong>: Starting at measure{" "}
                        {measure}
                      </div>
                    ),
                  )}
                  <div className="analysis-explanation">
                    {mt("Form sections")} define the large-scale structure of
                    the piece (like A, B, A', etc.). Each entry marks where a
                    new formal section begins, often corresponding to
                    significant {mt("thematic")} or
                    {mt(" harmonic")} changes.
                  </div>
                </div>
              </div>
            )}

            {hasPhrasePatch && (
              <div className="analysis-row">
                <div className="analysis-key">Phrase Patch</div>
                <div className="analysis-value">
                  {analysis.phrasePatch.map((patch, idx) => {
                    const sign = patch.diff > 0 ? "+" : "";
                    return (
                      <div key={idx}>
                        Measure {patch.measure}
                        {": "}
                        {sign}
                        {patch.diff}
                      </div>
                    );
                  })}
                  <div className="analysis-explanation">
                    Phrase adjustments that affect the musical phrasing
                    structure. Positive numbers indicate extended phrases,{" "}
                    negative indicate shortened ones.
                  </div>
                </div>
              </div>
            )}

            {hasSections && (
              <div className="analysis-row">
                <div className="analysis-key">Sections</div>
                <div className="analysis-value">
                  {analysis.sections.map((section, idx) => (
                    <div key={idx}>
                      A new section (new line) starts at four-measure phrase{" "}
                      {section}
                    </div>
                  ))}
                  <div className="analysis-explanation">
                    {mt("Sections")} indicate where larger structural divisions
                    occur in the music, often creating a new visual line in the
                    phrase visualization. These typically correspond to major
                    thematic groups or formal boundaries.
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {(hasTags || hasComment) && (
          <>
            <div className="section-divider">Additional Information</div>

            {hasTags && (
              <div className="analysis-row">
                <div className="analysis-key">Tags</div>
                <div className="analysis-value">
                  {analysis.tags.join(", ")}
                  <div className="analysis-explanation">
                    Tags categorize the piece by style, composer, period, or
                    other musical characteristics. These help with organizing
                    and finding related pieces.
                  </div>
                </div>
              </div>
            )}

            {hasComment && (
              <div className="analysis-row">
                <div className="analysis-key">Comment</div>
                <div className="analysis-value">
                  {analysis.comment}
                  <div className="analysis-explanation">
                    Additional notes or observations about the piece that don't
                    fit into other categories.
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {!hasModulations &&
          !hasMeasureRenumbering &&
          !hasForm &&
          !hasPhrasePatch &&
          !hasSections &&
          !hasTags &&
          !hasComment && (
            <div className="empty-analysis">
              <div>This piece doesn't have any analysis data yet.</div>
            </div>
          )}

        <div className="analysis-info">
          This analysis data highlights the musical structure typical of Western
          classical tradition, where phrases often come in groups of{" "}
          {mt("four measures")}, creating regular patterns that help listeners
          follow the musical narrative. The visualizer uses this data to
          illuminate these structural relationships.
        </div>
      </div>
    </AnalysisView>
  );
};

const Manual: React.FC<ManualProps> = ({
  score,
  initialSource,
  id,
  slug,
  history,
  setError,
  analysis,
}) => {
  const { user } = useContext(AppContext);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);
  const [showCopyFeedback, setShowCopyFeedback] = useState(false);
  const [telegramUsername, setTelegramUsername] = useState(
    () => localStorage.getItem("telegramUsername") || "",
  );
  const [showUsernameInput, setShowUsernameInput] = useState(false);
  const [hasLocalBackup, setHasLocalBackup] = useState(false);
  const [localBackupTimestamp, setLocalBackupTimestamp] = useState<
    number | null
  >(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);

  // Get the current page URL key for storage
  const getUrlKey = () => {
    let urlKey = "";
    if (id) {
      urlKey = `/ef/${id}`;
    } else if (slug) {
      urlKey = `/e/${slug}`;
    }
    return urlKey;
  };

  // Save backup to localStorage
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

  // Check for existing backup on load
  useEffect(() => {
    const urlKey = getUrlKey();
    if (!urlKey) return;

    const backupKey = BACKUP_PREFIX + urlKey;
    const backupJson = localStorage.getItem(backupKey);

    if (backupJson) {
      try {
        const backup: BackupData = JSON.parse(backupJson);
        // Only show restore button if the backup differs from current score
        if (backup.code !== score) {
          setHasLocalBackup(true);
          setLocalBackupTimestamp(backup.timestamp);
        } else {
          setHasLocalBackup(false);
        }
      } catch (e) {
        console.error("Failed to parse backup:", e);
        localStorage.removeItem(backupKey);
      }
    }
  }, [score, id, slug]);

  // Handle restore from backup
  const handleRestore = () => {
    const urlKey = getUrlKey();
    if (!urlKey) return;

    const backupKey = BACKUP_PREFIX + urlKey;
    const backupJson = localStorage.getItem(backupKey);

    if (backupJson) {
      try {
        const backup: BackupData = JSON.parse(backupJson);
        // We need to modify the parent component's score
        // This will be passed back up to Editor.tsx
        const event = new CustomEvent("rawl-restore-backup", {
          detail: { code: backup.code },
        });
        window.dispatchEvent(event);
        setHasLocalBackup(false);
      } catch (e) {
        console.error("Failed to restore backup:", e);
        setError("Failed to restore backup");
      }
    }
  };

  // Focus the input when it becomes visible
  useEffect(() => {
    if (showUsernameInput && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showUsernameInput]);

  const handlePublishClick = () => {
    if (!telegramUsername) {
      setShowUsernameInput(true);
    } else {
      handlePublish();
    }
  };

  const handlePublish = async () => {
    // Don't proceed if username is required but empty
    if (!telegramUsername) {
      return;
    }

    try {
      setIsPublishing(true);
      setPublishedUrl(null);

      // Store username in localStorage
      localStorage.setItem("telegramUsername", telegramUsername);

      // Use the score as-is without adding anacrusis
      const finalSource = score;

      // Get Firestore instance
      const db = getFirestore();

      // Add document to edits collection with username
      const docRef = await addDoc(collection(db, "edits"), {
        source: finalSource,
        createdAt: new Date(),
        parent: id ? `/ef/${id}` : slug ? `/e/${slug}` : null,
        username: telegramUsername,
      });

      // Set the published URL
      const newUrl = `/ef/${docRef.id}`;
      setPublishedUrl(newUrl);
      setShowUsernameInput(false);

      // Redirect to the new document
      history.push(newUrl);
    } catch (error) {
      console.error("Error publishing:", error);
      setError("Failed to publish. Please try again.");
    } finally {
      setIsPublishing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && telegramUsername.trim()) {
      handlePublish();
    }
  };

  const handleCopyUrl = () => {
    if (publishedUrl) {
      const fullUrl = window.location.origin + publishedUrl;
      navigator.clipboard.writeText(fullUrl);
      setShowCopyFeedback(true);
      setTimeout(() => {
        setShowCopyFeedback(false);
      }, 2000);
    }
  };

  // Format the backup timestamp in a readable format
  const formatBackupTime = (timestamp: number | null) => {
    if (!timestamp) return "";

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
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);

    // Determine relative date text
    let relativeDate = "";

    const isToday =
      now.getDate() === date.getDate() &&
      now.getMonth() === date.getMonth() &&
      now.getFullYear() === date.getFullYear();

    const isYesterday =
      now.getDate() - 1 === date.getDate() &&
      now.getMonth() === date.getMonth() &&
      now.getFullYear() === date.getFullYear();

    if (isToday) {
      relativeDate = "today";
    } else if (isYesterday) {
      relativeDate = "yesterday";
    } else if (diffDays < 30) {
      relativeDate = `${diffDays}d ago`;
    } else if (diffMonths < 12) {
      relativeDate = `${diffMonths}m ago`;
    } else {
      relativeDate = `${diffYears}y ago`;
    }

    return `${timeStr} ${relativeDate}`;
  };

  return (
    <KeyboardLayout>
      <ButtonBar>
        {hasLocalBackup && (
          <RestoreButton
            onClick={handleRestore}
            title={`Backup saved ${formatBackupTime(localBackupTimestamp)}`}
          >
            <span>Restore from {formatBackupTime(localBackupTimestamp)}</span>
            <FontAwesomeIcon icon={faClockRotateLeft} className="icon" />
          </RestoreButton>
        )}

        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          {/* Show toggle for all users if analysis is available */}
          {analysis && (
            <ViewToggle>
              <ToggleButton
                active={!showAnalysis}
                onClick={() => setShowAnalysis(false)}
              >
                <FontAwesomeIcon icon={faBook} />
                Manual
              </ToggleButton>
              <ToggleButton
                active={showAnalysis}
                onClick={() => setShowAnalysis(true)}
              >
                <FontAwesomeIcon icon={faChartLine} />
                Analysis
              </ToggleButton>
            </ViewToggle>
          )}

          <div style={{ display: "flex", gap: "12px" }}>
            {showUsernameInput && (
              <TelegramInput
                ref={inputRef}
                placeholder="What's your Telegram @username or email?"
                value={telegramUsername}
                onChange={(e) => setTelegramUsername(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            )}
            {publishedUrl && (
              <PublishedUrl onClick={handleCopyUrl}>
                {showCopyFeedback
                  ? score !== initialSource
                    ? "Link to last published version is copied to clipboard"
                    : "Link is copied to clipboard"
                  : publishedUrl}
                <FontAwesomeIcon
                  icon={faCopy}
                  className="copy-button"
                  title="Copy URL to clipboard"
                />
              </PublishedUrl>
            )}
            <PublishButton
              onClick={handlePublishClick}
              isPublishing={isPublishing}
              disabled={
                isPublishing ||
                score === initialSource ||
                (showUsernameInput && !telegramUsername.trim())
              }
              hasChanges={score !== initialSource}
            >
              {isPublishing ? (
                <>
                  Publishing
                  <FontAwesomeIcon icon={faSpinner} className="spinner" />
                </>
              ) : (
                <>
                  Publish
                  <FontAwesomeIcon icon={faCloudArrowUp} />
                </>
              )}
            </PublishButton>
          </div>
        </div>
      </ButtonBar>

      {showAnalysis && analysis ? (
        <AnalysisDisplay analysis={analysis} />
      ) : (
        <>
          <div className="top-section">
            <div className="left-column">
              <img
                src={isMinorKey(score) ? editorMinorLayout : editorMajorLayout}
                alt={`${
                  isMinorKey(score) ? "Minor" : "Major"
                } Scale Keyboard Layout`}
              />
              <div className="image-caption">
                Prepend note pitch with b and # to lower/raise by semitone, eg.
                b2, #r
              </div>
              <div
                style={{ marginTop: "12px", color: "#aaa", padding: "0 4px" }}
              >
                <code>Shift+Space</code> Play/Pause while in editor
              </div>
              <div
                style={{ marginTop: "8px", color: "#aaa", padding: "0 4px" }}
              >
                <code>Shift+{altKey}+Space</code> Play from current target
                measure
              </div>
            </div>
            <div className="right-column">
              <div className="section">
                <div className="grid">
                  <div className="note-col">
                    <NoteExample beats={4} style={{ width: "120px" }} />
                  </div>
                  <span>
                    <code>+</code> 4 beats (whole note)
                  </span>

                  <div className="note-col">
                    <NoteExample beats={3} style={{ width: "90px" }} />
                  </div>
                  <span>
                    <code>_.</code> 2 × 3/2 = 3 beats (<code>.</code> elongates
                    by half)
                  </span>

                  <div className="note-col">
                    <NoteExample beats={2} style={{ width: "60px" }} />
                  </div>
                  <span>
                    <code>_</code> 2 beats (half note)
                  </span>

                  <div className="note-col">
                    <NoteExample beats={1.33} style={{ width: "40px" }} />
                  </div>
                  <span>
                    <code>_:</code> 2 × ⅔ ≈ 1.33 beats (for triplets,{" "}
                    <code>:</code> reduces by 1/3)
                  </span>

                  <div className="note-col">
                    <NoteExample beats={1} style={{ width: "30px" }} />
                  </div>
                  <span>
                    <code>,</code> 1 beat (quarter note)
                  </span>

                  <div className="note-col">
                    <NoteExample beats={0.5} style={{ width: "15px" }} />
                  </div>
                  <span>
                    <code>-</code> ½ beat (eighth note)
                  </span>

                  <div className="note-col">
                    <NoteExample beats={0.25} style={{ width: "7.5px" }} />
                  </div>
                  <span>
                    <code>=</code> ¼ beat (sixteenth note)
                  </span>

                  <div className="note-col">
                    <NoteExample beats={0.125} style={{ width: "3.75px" }} />
                  </div>
                  <span>
                    <code>'</code> ⅛ beat (thirty-second note)
                  </span>

                  <div className="note-col">
                    <NoteExample beats={0.0625} style={{ width: "1.875px" }} />
                  </div>
                  <span>
                    <code>"</code> 1/16 beat (sixty-fourth note)
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="full-width-section">
            <div className="section">
              <h3>Insert/copy</h3>
              <div className="grid">
                <code>2b2 i q,.x-eti,</code>
                <span>
                  Insert at measure 2 beat 2: 1+1/2 beats (,.) of scale degree
                  one (tonic) in middle octave, then a rest (x) of 1/2 beats,
                  then a beat of a chord 3-5-1, where 1 is in upper octave.
                  Several note pitches under one duration is a chord
                </span>
                <code>5&nbsp;&nbsp;&nbsp;c 1-4&nbsp;&nbsp;&nbsp;0 -4 x 7</code>
                <span>
                  Copy measures 1..4 to measure 5 several times. 0 means
                  "verbatim copy, don't shift note pitches", -4 means "shift
                  down 4 scale degrees", x means "rest for the duration of
                  slice", 7 means "shift up 7 scale degrees, i.e. one octave"
                </span>
                <code>2b2 c 1b2-1b4</code>
                <span>
                  Copy two beats (measure 1 beats 2 to 3), no target defaults to
                  "0" (one verbatim copy)
                </span>
                <code>9&nbsp;&nbsp;&nbsp;ac 1-8</code>
                <span>All Copy: copy notes in all channels</span>
                <code>1&nbsp;&nbsp;&nbsp;c 1&nbsp;&nbsp;&nbsp;2&5</code>
                <span>
                  Layer multiple shifts at same position - for doubling in
                  thirds/sixths etc.
                </span>
              </div>
            </div>
            <div className="section">
              <h3>Other commands</h3>
              <div className="grid">
                <code>C major, Ab minor</code>
                <span>
                  Key signature. Modes: major, minor, lydian, mixolydian,
                  dorian, phrygian
                </span>
                <code>3/4</code> <span>Time signature</span>
                <code>bpm 120</code> <span>Tempo</span>
                <code>lh</code>{" "}
                <span>Left hand (ch1, velocity 70), octave range 2-4</span>
                <code>rh</code>{" "}
                <span>Right hand (ch0, velocity 100), octave range 4-6</span>
                <code>ch2, ch3, ...</code>
                <span>Channels 2 to 15 (velocity 100), octave range 4-6</span>
                <code>rh 3</code>{" "}
                <span>
                  Change octave range to 3-5, can apply to lh, rh or ch2..15
                </span>
                <code>% line</code>{" "}
                <span>
                  Comment using %. Select several lines and press Cmd+/ (Ctrl+/)
                  to toggle
                </span>
              </div>
            </div>

            <div className="section">
              <h3>Analysis commands</h3>
              <div className="grid">
                <code>phrases 1+1 18+2 36-1</code>
                <span>
                  Hypermeter adjustments: moves white bar of four-measure phrase
                  defaults left or right. <code>1+1</code> is handy for
                  anacrusis,
                  <code>18+2</code> moves the phrase vertical bar two measures
                  to the right from measure 18 (to measure 20),{" "}
                  <code>36-1</code> moves the bar from measure 36 one measure to
                  the left (to measure 35).
                </span>
              </div>
            </div>
          </div>
        </>
      )}
    </KeyboardLayout>
  );
};

export default Manual;
