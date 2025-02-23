import {
  faCloudArrowUp,
  faCopy,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { addDoc, collection, getFirestore } from "firebase/firestore/lite";
import React, { useState } from "react";
import styled from "styled-components";
import editorMajorLayout from "../../../images/editor_major_layout.png";

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
  justify-content: flex-end;
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
}

const Manual: React.FC<ManualProps> = ({
  score,
  initialSource,
  id,
  slug,
  history,
  setError,
}) => {
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);
  const [showCopyFeedback, setShowCopyFeedback] = useState(false);

  const handlePublish = async () => {
    try {
      setIsPublishing(true);
      setPublishedUrl(null);

      // Check if source has anacrusis
      const hasAnacrusis = score.toLowerCase().includes("anacrusis");

      // Prepend anacrusis if needed
      const finalSource = hasAnacrusis ? score : `anacrusis 4\n${score}`;

      // Get Firestore instance
      const db = getFirestore();

      // Add document to edits collection
      const docRef = await addDoc(collection(db, "edits"), {
        source: finalSource,
        createdAt: new Date(),
        parent: id ? `/ef/${id}` : slug ? `/e/${slug}` : null,
      });

      // Set the published URL
      const newUrl = `/ef/${docRef.id}`;
      setPublishedUrl(newUrl);

      // Redirect to the new document
      history.push(newUrl);
    } catch (error) {
      console.error("Error publishing:", error);
      setError("Failed to publish. Please try again.");
    } finally {
      setIsPublishing(false);
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

  return (
    <KeyboardLayout>
      <ButtonBar>
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
          onClick={handlePublish}
          isPublishing={isPublishing}
          disabled={isPublishing || score === initialSource}
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
      </ButtonBar>
      <div className="top-section">
        <div className="left-column">
          <img src={editorMajorLayout} alt="Keyboard Layout" />
          <div className="image-caption">
            Prepend note pitch with b and # to lower/raise by semitone, eg. b2,
            #r
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
                <code>_.</code> 2 × 3/2 = 3 beats (<code>.</code> elongates by
                half)
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
                <code>_:</code> 2 × ⅔ ≈ 1.33 beats (for triplets, <code>:</code>{" "}
                reduces by 1/3)
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
              Insert at measure 2 beat 2: 1+1/2 beats (,.) of scale degree one
              (tonic) in middle octave, then a rest (x) of 1/2 beats, then a
              beat of a chord 3-5-1, where 1 is in upper octave. Several note
              pitches under one duration is a chord
            </span>
            <code>5&nbsp;&nbsp;&nbsp;c 1-4&nbsp;&nbsp;&nbsp;0 -4 x 7</code>
            <span>
              Copy measures 1..4 to measure 5 several times. 0 means "verbatim
              copy, don't shift note pitches", -4 means "shift down 4 scale
              degrees", x means "rest for the duration of slice", 7 means "shift
              up 7 scale degrees, i.e. one octave"
            </span>
            <code>2b2 c 1b2-1b4</code>
            <span>
              Copy two beats (measure 1 beats 2 to 3), no target defaults to "0"
              (one verbatim copy)
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
              Key signature. Modes: major, minor, lydian, mixolydian, dorian,
              phrygian
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
              Comment using %. Select several lines and press Cmd+/ (Ctrl+/) to
              toggle
            </span>
          </div>
        </div>
      </div>
    </KeyboardLayout>
  );
};

export default Manual;
