import {
  faBook,
  faClockRotateLeft,
  faCloudArrowUp,
  faCode,
  faCopy,
  faMusic,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useContext, useEffect, useRef, useState } from "react";
import styled from "styled-components";
import editorMajorLayout from "../../../images/editor_major_layout.png";
import editorMinorLayout from "../../../images/editor_minor_layout.png";
import { AppContext } from "../../AppContext";
import { Analysis } from "../analysis";
import { NoteColorLetter } from "./EditorStyles";
import {
  ButtonBar,
  KeyboardLayout,
  ManualContainer,
  PublishButton,
  PublishedUrl,
  RestoreButton,
  TelegramInput,
  ToggleButton,
  ViewToggle,
} from "./ManualStyles";
import { getScaleMapForMode } from "./types";

// Constants for localStorage
const BACKUP_PREFIX = "rawl_backup_";

// Detect if user is on macOS to show Option vs Alt
const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
const altKey = isMac ? "⌥" : "Alt";

// Constants for common terms
const UNSTABLE_PITCHES = [1, 2, 3, 5, 6];

// Add the missing AnalysisView styled component
const AnalysisView = styled.div`
  padding: 16px;
  background-color: #1f1f1f;
  border-radius: 4px;
  height: 100%;
  overflow-y: auto;

  .section-title {
    font-size: 18px;
    margin-bottom: 16px;
    color: #ddd;
  }

  .section-divider {
    font-size: 16px;
    margin: 24px 0 16px;
    color: #ddd;
    border-bottom: 1px solid #333;
    padding-bottom: 8px;
  }

  .analysis-row {
    display: flex;
    margin-bottom: 16px;
  }

  .analysis-key {
    width: 120px;
    color: #888;
    font-weight: bold;
  }

  .analysis-value {
    flex: 1;
  }

  .analysis-explanation {
    margin-top: 8px;
    font-size: 0.9em;
    color: #888;
    font-style: italic;
  }

  .empty-analysis {
    color: #888;
    font-style: italic;
    margin: 20px 0;
    text-align: center;
  }

  .analysis-info {
    margin-top: 24px;
    padding: 12px;
    border-left: 3px solid #444;
    color: #888;
    font-size: 0.9em;
  }

  .analysis-header {
    margin-bottom: 20px;
  }

  .analysis-header h2 {
    margin-bottom: 8px;
    color: #ddd;
  }

  .analysis-description {
    color: #aaa;
    margin-bottom: 20px;
    line-height: 1.5;
  }

  .modulation {
    display: inline-block;
    margin-right: 10px;
    margin-bottom: 5px;
    background-color: #2a2a2a;
    padding: 3px 6px;
    border-radius: 3px;
  }
`;

// Helper for styling musical terms
const mt = (term: string) => <span className="musical-term">{term}</span>;

// MIDI note name conversion utility
const getNoteNameFromMidi = (midiNumber: number): string => {
  const noteNames = [
    "C",
    "C#",
    "D",
    "D#",
    "E",
    "F",
    "F#",
    "G",
    "G#",
    "A",
    "A#",
    "B",
  ];
  const octave = Math.floor(midiNumber / 12) - 1;
  const noteIndex = midiNumber % 12;
  return `${noteNames[noteIndex]}${octave}`;
};

// Function to detect if the first key signature is minor
const isMinorKey = (score: string): boolean => {
  const lines = score.split("\n");
  for (const line of lines) {
    const cleanLine = line.split("%")[0].trim();
    if (cleanLine.match(/^[A-G][b#]?\s+minor$/i)) {
      return true;
    }
    if (cleanLine.match(/^[A-G][b#]?\s+major$/i)) {
      return false;
    }
  }
  return false;
};

// Helper function to decorate scale names with color and monospace
const decorateScale = (scaleName: string) => {
  const scaleMap = getScaleMapForMode(scaleName.toLowerCase() as any);

  // Create colored spans for each letter
  const styledLetters = Array.from(scaleName).map((letter, index) => {
    if (index < 5) {
      const unstablePitch = UNSTABLE_PITCHES[index];
      const colorIndex = scaleMap?.[unstablePitch] || 0;
      // Use the shared styled component with proper color contrasting
      return (
        <NoteColorLetter
          key={index}
          className={`noteColor_${colorIndex}_colors`}
        >
          {letter}
        </NoteColorLetter>
      );
    }
    return <span key={index}>{letter}</span>;
  });

  // Wrap everything in monospace
  return <code className="scale-name">{styledLetters}</code>;
};

const BeatMarker = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  width: 2px;
  background: gray;
`;

// Interface for backup object
interface BackupData {
  code: string;
  timestamp: number;
}

interface NoteExampleProps {
  beats: number;
  style?: { width: string };
}

const NoteExample: React.FC<NoteExampleProps> = ({ beats, style }) => {
  return (
    <div
      style={{
        height: "4px",
        background: "#ccc",
        borderRadius: "4px",
        ...style,
      }}
    />
  );
};

interface ManualProps {
  score: string;
  initialSource: string;
  id?: string;
  slug?: string;
  history: any;
  setError: (error: string | null) => void;
  analysis?: Analysis;
  extractedMidiNotes?: any;
  matchedParsingResult?: any;
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

  if (!analysis) {
    return (
      <AnalysisView>
        <div className="empty-analysis">
          <FontAwesomeIcon
            icon={faMusic}
            style={{ fontSize: "24px", marginBottom: "12px", opacity: 0.5 }}
          />
          <div>This piece doesn't have any analysis data yet.</div>
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

const ParseMidiDisplay: React.FC<{ matchedParsingResult?: any }> = ({
  matchedParsingResult,
}) => {
  if (!matchedParsingResult || !matchedParsingResult.notes) return null;

  // Function to format note objects
  const formatNote = (note: any) => {
    // Check if note or essential properties are missing
    if (!note || !note.note) {
      return (
        <div className="parsed-note unmatched" key={`invalid-${Math.random()}`}>
          Invalid note data
        </div>
      );
    }

    // Safely get MIDI note name
    const baseName =
      note.note.midiNumber !== undefined
        ? getNoteNameFromMidi(note.note.midiNumber)
        : "Unknown";

    // Safely get timing information with fallbacks
    const startTick =
      note.tickSpan && Array.isArray(note.tickSpan) && note.tickSpan.length > 0
        ? note.tickSpan[0]
        : note.matchingMidiWriterNote?.startTick || "?";
    const endTick =
      note.tickSpan && Array.isArray(note.tickSpan) && note.tickSpan.length > 1
        ? note.tickSpan[1]
        : startTick !== "?" && note.matchingMidiWriterNote?.duration
        ? startTick + note.matchingMidiWriterNote.duration
        : "?";
    const durationTicks =
      startTick !== "?" && endTick !== "?" ? endTick - startTick : "?";

    // Get span information for seconds display
    const startSec =
      note.span && Array.isArray(note.span) && note.span.length > 0
        ? note.span[0].toFixed(2)
        : "?";
    const endSec =
      note.span && Array.isArray(note.span) && note.span.length > 1
        ? note.span[1].toFixed(2)
        : "?";
    const durationSec =
      startSec !== "?" && endSec !== "?"
        ? (parseFloat(endSec) - parseFloat(startSec)).toFixed(2)
        : "?";

    return (
      <div
        className={`parsed-note ${note.hasMatch ? "matched" : "unmatched"}`}
        key={`${note.note.midiNumber || "unknown"}-${
          startTick || Math.random()
        }`}
      >
        <div>
          <strong>{baseName}</strong> (
          {note.note.midiNumber !== undefined ? note.note.midiNumber : "?"})
        </div>
        <div>
          <span className="note-timing-info">
            <strong>Ticks:</strong> Start: {startTick}, End: {endTick},
            Duration: {durationTicks}
          </span>
        </div>
        <div>
          <span className="note-timing-info">
            <strong>Seconds:</strong> Start: {startSec}s, End: {endSec}s,
            Duration: {durationSec}s
          </span>
        </div>
        {note.matchingMidiWriterNote && (
          <div className="match-info">
            Matched with MidiWriter note
            {note.matchingMidiWriterNote.sourceLocation && (
              <div className="source-location">
                Source: Line {note.matchingMidiWriterNote.sourceLocation.row},
                Col {note.matchingMidiWriterNote.sourceLocation.col}(
                {note.matchingMidiWriterNote.sourceLocation.command})
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="parse-midi-display">
      <h3>ParseMidi Notes</h3>
      {matchedParsingResult.notes.map(
        (voiceNotes: any[], voiceIndex: number) => {
          // Check if voiceNotes is actually an array
          if (!Array.isArray(voiceNotes)) {
            return (
              <div key={`voice-${voiceIndex}`} className="voice-notes">
                <h4>Voice {voiceIndex}</h4>
                <div>Invalid voice data</div>
              </div>
            );
          }

          return (
            <div key={`voice-${voiceIndex}`} className="voice-notes">
              <h4>Voice {voiceIndex}</h4>
              <div className="notes-grid">{voiceNotes.map(formatNote)}</div>
            </div>
          );
        },
      )}
    </div>
  );
};

const MidiWriterJsDisplay: React.FC<{ extractedMidiNotes: any }> = ({
  extractedMidiNotes,
}) => {
  if (!extractedMidiNotes) return null;

  // Extract the data we need
  const { eventsByChannel, trackNames } = extractedMidiNotes || {};

  // Check if eventsByChannel exists
  if (!eventsByChannel || typeof eventsByChannel.keys !== "function") {
    return <div>No valid MIDI event data available</div>;
  }

  // Get all channel numbers and sort them
  const channels = Array.from(eventsByChannel.keys()).sort();

  // Find the earliest start tick to help with relative positioning
  let earliestTick = Infinity;
  channels.forEach((channel) => {
    const events = eventsByChannel.get(channel) || [];
    events.forEach((event: any) => {
      if (
        event &&
        typeof event.startTick === "number" &&
        event.startTick < earliestTick
      ) {
        earliestTick = event.startTick;
      }
    });
  });

  return (
    <div className="midi-writer-display">
      <h3>MidiWriter.js Events</h3>
      {channels.length === 0 ? (
        <div>No channel data available</div>
      ) : (
        channels.map((channel: number) => {
          const events = eventsByChannel.get(channel) || [];
          const trackName =
            trackNames && trackNames.get
              ? trackNames.get(channel) || `Channel ${channel}`
              : `Channel ${channel}`;

          return (
            <div key={`channel-${channel}`} className="channel-events">
              <h4>{trackName}</h4>
              {events.length === 0 ? (
                <div>No events in this channel</div>
              ) : (
                <table className="events-table">
                  <thead>
                    <tr>
                      <th>Start Tick</th>
                      <th>Pitches</th>
                      <th>Duration</th>
                      <th>Velocity</th>
                      <th>Source Location</th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.map((event: any, idx: number) => {
                      // Check if event has required properties
                      if (!event) {
                        return (
                          <tr key={idx}>
                            <td colSpan={5}>Invalid event data</td>
                          </tr>
                        );
                      }

                      return (
                        <tr key={idx}>
                          <td>
                            {event.startTick !== undefined
                              ? event.startTick
                              : "N/A"}
                          </td>
                          <td>
                            {event.pitches && Array.isArray(event.pitches)
                              ? event.pitches
                                  .map((p: number) => {
                                    const noteName =
                                      typeof p === "number"
                                        ? getNoteNameFromMidi(p)
                                        : "Unknown";
                                    return `${noteName} (${p})`;
                                  })
                                  .join(", ")
                              : "No pitch data"}
                          </td>
                          <td>
                            {event.duration !== undefined
                              ? event.duration
                              : "N/A"}
                          </td>
                          <td>
                            {event.velocity !== undefined
                              ? event.velocity
                              : "N/A"}
                          </td>
                          <td>
                            {event.sourceLocation ? (
                              <div className="source-location">
                                Line {event.sourceLocation.row}, Col{" "}
                                {event.sourceLocation.col}(
                                {event.sourceLocation.command})
                              </div>
                            ) : (
                              "No source info"
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          );
        })
      )}
    </div>
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
  extractedMidiNotes,
  matchedParsingResult,
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
  const [viewMode, setViewMode] = useState<
    "manual" | "parseMidi" | "midiWriterJs"
  >("manual");

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
        localStorage.removeItem(backupKey);
      }
    }
  }, [score, id, slug]);

  // Handler for restoring from backup
  const handleRestore = () => {
    const urlKey = getUrlKey();
    if (!urlKey) return;

    const backupKey = BACKUP_PREFIX + urlKey;
    const backupJson = localStorage.getItem(backupKey);

    if (backupJson) {
      try {
        const backup: BackupData = JSON.parse(backupJson);
        // Dispatch a custom event to notify the editor to restore the backup
        const restoreEvent = new CustomEvent("rawl-restore-backup", {
          detail: { code: backup.code },
        });
        window.dispatchEvent(restoreEvent);
        setHasLocalBackup(false);
      } catch (e) {
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

  // Handler for publish button click
  const handlePublishClick = () => {
    if (!telegramUsername.trim()) {
      setShowUsernameInput(true);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    } else {
      handlePublish();
    }
  };

  // Handler for publishing
  const handlePublish = async () => {
    // This is a placeholder - you would implement the actual publishing logic here
    setIsPublishing(true);
    try {
      // Mock publishing
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Set a mock published URL
      const mockUrl = `https://example.com/shared/${id || slug || "new"}`;
      setPublishedUrl(mockUrl);

      // Store username in localStorage
      if (telegramUsername.trim()) {
        localStorage.setItem("telegramUsername", telegramUsername.trim());
      }

      setShowUsernameInput(false);
    } catch (error) {
      setError("Failed to publish");
    } finally {
      setIsPublishing(false);
    }
  };

  // Handler for keyboard events in the username input
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handlePublish();
    }
  };

  // Handler for copying URL to clipboard
  const handleCopyUrl = () => {
    if (publishedUrl) {
      navigator.clipboard.writeText(publishedUrl).then(() => {
        setShowCopyFeedback(true);
        setTimeout(() => {
          setShowCopyFeedback(false);
        }, 2000);
      });
    }
  };

  // Formatter for backup timestamps
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
    <ManualContainer>
      <style>
        {`
          /* Source location styling */
          .source-location {
            font-size: 0.85em;
            color: #aaa;
            margin-top: 4px;
            background-color: #2a2a2a;
            padding: 2px 6px;
            border-radius: 4px;
            display: inline-block;
          }
          
          /* Keyboard layout image styling */
          .keyboard-layout-image {
            width: 100%;
            height: auto;
            object-fit: contain;
            max-width: 250px;
            display: block;
            margin-bottom: 10px;
            border-radius: 4px;
          }
          
          /* Additional table styling */
          .events-table {
            width: 100%;
            border-collapse: collapse;
          }
          
          .events-table th,
          .events-table td {
            padding: 6px;
            text-align: left;
            border-bottom: 1px solid #444;
          }
          
          .events-table th {
            background-color: #2a2a2a;
          }
          
          /* Additional styles for the Manual component */
          .top-section {
            display: flex;
            gap: 20px;
            margin-bottom: 20px;
          }
          
          .left-column {
            flex: 1;
          }
          
          .right-column {
            flex: 2;
          }
          
          .image-caption {
            font-size: 12px;
            color: #888;
            margin-top: 8px;
          }
          
          .section {
            margin-bottom: 20px;
          }
          
          .grid {
            display: grid;
            grid-template-columns: auto 1fr;
            gap: 8px 16px;
            align-items: center;
          }
          
          .note-col {
            display: flex;
            align-items: center;
            height: 20px;
          }
          
          .full-width-section {
            margin-top: 20px;
          }
          
          .musical-term {
            font-style: italic;
            color: #ddd;
          }
          
          .parsed-note {
            padding: 8px;
            margin: 4px;
            border-radius: 4px;
            background-color: #2a2a2a;
            transition: all 0.2s ease;
          }
          
          .parsed-note:hover {
            background-color: #333;
          }
          
          .matched {
            border-left: 3px solid #28a745;
          }
          
          .unmatched {
            border-left: 3px solid #dc3545;
          }
          
          .match-info {
            margin-top: 4px;
            font-size: 0.85em;
            color: #28a745;
          }
          
          .notes-grid {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin-top: 8px;
          }
          
          .voice-notes {
            margin-bottom: 20px;
          }
          
          .channel-events {
            margin-bottom: 20px;
          }
          
          .no-data-message {
            padding: 20px;
            background-color: #2a2a2a;
            border-radius: 4px;
            text-align: center;
            color: #aaa;
            margin: 20px 0;
          }
          
          .note-timing-info {
            font-size: 0.9em;
            color: #bbb;
            display: block;
            margin: 2px 0;
          }
          
          .note-timing-info strong {
            display: inline-block;
            width: 60px;
            font-weight: normal;
            color: #999;
          }
          
          /* Add a special style to highlight when there's an issue with timing data */
          .note-timing-info:has(+ .note-timing-info:contains("?")) {
            color: #e69500;
          }
        `}
      </style>

      <KeyboardLayout>
        <ButtonBar>
          <div className="left-section">
            {hasLocalBackup && (
              <RestoreButton
                onClick={handleRestore}
                title={`Backup saved ${formatBackupTime(localBackupTimestamp)}`}
              >
                <span>
                  Restore from {formatBackupTime(localBackupTimestamp)}
                </span>
                <FontAwesomeIcon icon={faClockRotateLeft} className="icon" />
              </RestoreButton>
            )}
          </div>

          <div className="center-section">
            <ViewToggle>
              <ToggleButton
                active={viewMode === "manual"}
                onClick={() => setViewMode("manual")}
              >
                <FontAwesomeIcon icon={faBook} />
                Manual
              </ToggleButton>
              <ToggleButton
                active={viewMode === "parseMidi"}
                onClick={() => setViewMode("parseMidi")}
                disabled={!matchedParsingResult || !matchedParsingResult.notes}
              >
                <FontAwesomeIcon icon={faCode} />
                ParseMidi
              </ToggleButton>
              <ToggleButton
                active={viewMode === "midiWriterJs"}
                onClick={() => setViewMode("midiWriterJs")}
                disabled={!extractedMidiNotes}
              >
                <FontAwesomeIcon icon={faMusic} />
                MidiWriterJs
              </ToggleButton>
            </ViewToggle>
          </div>

          <div className="right-section">
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
        </ButtonBar>

        {viewMode === "parseMidi" ? (
          matchedParsingResult && matchedParsingResult.notes ? (
            <ParseMidiDisplay matchedParsingResult={matchedParsingResult} />
          ) : (
            <div className="no-data-message">
              <p>No ParseMidi data available. Try playing some notes first.</p>
            </div>
          )
        ) : viewMode === "midiWriterJs" ? (
          extractedMidiNotes ? (
            <MidiWriterJsDisplay extractedMidiNotes={extractedMidiNotes} />
          ) : (
            <div className="no-data-message">
              <p>
                No MidiWriter.js data available. Try playing some notes first.
              </p>
            </div>
          )
        ) : (
          <>
            <div className="top-section">
              <div className="left-column">
                <img
                  src={
                    isMinorKey(score) ? editorMinorLayout : editorMajorLayout
                  }
                  alt={`${
                    isMinorKey(score) ? "Minor" : "Major"
                  } Scale Keyboard Layout`}
                  className="keyboard-layout-image"
                />
                <div className="image-caption">
                  Prepend note pitch with b and # to lower/raise by semitone,
                  eg. b2, #r
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
                      <code>_.</code> 2 × 3/2 = 3 beats (<code>.</code>{" "}
                      elongates by half)
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
                      <NoteExample
                        beats={0.0625}
                        style={{ width: "1.875px" }}
                      />
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
                  <code>
                    5&nbsp;&nbsp;&nbsp;c 1-4&nbsp;&nbsp;&nbsp;0 -4 x 7
                  </code>
                  <span>
                    Copy measures 1..4 to measure 5 several times. 0 means
                    "verbatim copy, don't shift note pitches", -4 means "shift
                    down 4 scale degrees", x means "rest for the duration of
                    slice", 7 means "shift up 7 scale degrees, i.e. one octave"
                  </span>
                  <code>2&nbsp;&nbsp;&nbsp;c 1&nbsp;&nbsp;&nbsp;0 4h 4e</code>
                  <span>
                    Mode modifiers (after shift numbers): {mt("h")} = harmonic
                    minor,
                    {mt("e")} = melodic minor,
                    {mt("M")} = major,
                    {mt("m")} = natural minor. These change the mode while
                    preserving the tonic.
                  </span>
                  <code>2b2 c 1b2-1b4</code>
                  <span>
                    Copy two beats (measure 1 beats 2 to 3), no target defaults
                    to "0" (one verbatim copy)
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
                    Key signature. Modes:
                    <ul>
                      <li>{decorateScale("lydian")}</li>
                      <li>{decorateScale("major")} (M)</li>
                      <li>{decorateScale("mixolydian")}</li>
                      <li>{decorateScale("dorian")}</li>
                      <li>{decorateScale("minor")} (m)</li>
                      <li>{decorateScale("phrygian")}</li>
                      <li>{decorateScale("harmonic_minor")} (h)</li>
                      <li>{decorateScale("melodic_minor")} (e)</li>
                    </ul>
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
                    Comment using %. Select several lines and press Cmd+/
                    (Ctrl+/) to toggle
                  </span>
                </div>
              </div>

              <div className="section">
                <h3>Analysis commands</h3>
                <div className="grid">
                  <code>phrases 1+1 18+2 36-1</code>
                  <span>
                    Hypermeter adjustments: moves white bar of four-measure
                    phrase defaults left or right. <code>1+1</code> is handy for
                    anacrusis,
                    <code>18+2</code> moves the phrase vertical bar two measures
                    to the right from measure 18 (to measure 20),{" "}
                    <code>36-1</code> moves the bar from measure 36 one measure
                    to the left (to measure 35).
                  </span>
                </div>
              </div>
            </div>
          </>
        )}
      </KeyboardLayout>
    </ManualContainer>
  );
};

export default Manual;
