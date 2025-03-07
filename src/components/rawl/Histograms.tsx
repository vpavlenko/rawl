import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import styled from "styled-components";
import { AppContext } from "../AppContext";
import { corpora } from "./corpora/corpora";
import InlineRawlPlayer from "./InlineRawlPlayer";

// Styled components
const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  padding: 20px;
  box-sizing: border-box;
`;

const ProgressSection = styled.div`
  flex: 1;
  margin-bottom: 20px;
  overflow-y: auto;
  border: 1px solid #ddd;
  border-radius: 5px;
  padding: 20px;
`;

const RawlSection = styled.div`
  flex: 2;
  position: relative;
  border: 1px solid #ddd;
  border-radius: 5px;
`;

const Stats = styled.div`
  margin-bottom: 20px;
`;

const ProgressBar = styled.div`
  height: 20px;
  background-color: #f0f0f0;
  border-radius: 10px;
  margin: 10px 0;
  overflow: hidden;
`;

const ProgressFill = styled.div<{ percent: number }>`
  height: 100%;
  width: ${(props) => props.percent}%;
  background-color: #4a90e2;
  transition: width 0.3s ease;
`;

const HistogramList = styled.div`
  max-height: 300px;
  overflow-y: auto;
  margin-bottom: 20px;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
`;

const Button = styled.button`
  padding: 10px 15px;
  background-color: #4a90e2;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;

  &:hover {
    background-color: #3a7bc8;
  }

  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;

const PlayPauseButton = styled(Button)<{ isPlaying: boolean }>`
  background-color: ${(props) => (props.isPlaying ? "#e74c3c" : "#2ecc71")};

  &:hover {
    background-color: ${(props) => (props.isPlaying ? "#c0392b" : "#27ae60")};
  }
`;

const SkipButton = styled(Button)`
  background-color: #f39c12;

  &:hover {
    background-color: #e67e22;
  }
`;

// Helper function to flatten all midis
const getAllMidis = () => {
  const allMidis = [];
  const seenSlugs = new Set<string>(); // Track seen slugs to avoid duplicates

  corpora.forEach((corpus) => {
    corpus.midis.forEach((midi) => {
      // Only add the midi if we haven't seen it before
      if (!seenSlugs.has(midi)) {
        allMidis.push({ slug: midi, corpusSlug: corpus.slug });
        seenSlugs.add(midi); // Mark this slug as seen
      }
    });
  });

  console.log(
    `Total unique midis: ${allMidis.length} (filtered from ${seenSlugs.size} total)`,
  );
  return allMidis;
};

const Histograms: React.FC = () => {
  const { handleSongClick, rawlProps, currentMidi, eject } =
    useContext(AppContext);

  // State
  const [calculatedCount, setCalculatedCount] = useState<number>(0);
  const [recentHistograms, setRecentHistograms] = useState<
    Array<{ slug: string; data: number[] }>
  >([]);
  const [allMidis] = useState(getAllMidis());
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [autoBatchEnabled, setAutoBatchEnabled] = useState<boolean>(false);
  const [lastCalculationTime, setLastCalculationTime] = useState<number>(0);
  const [skippedSongs, setSkippedSongs] = useState<Array<string>>([]);

  // Refs
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Skip to the next song without loading
  const skipSong = useCallback(() => {
    // Clear any loading timeout
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
      loadingTimeoutRef.current = null;
    }

    if (currentIndex < allMidis.length) {
      const skippedSlug = allMidis[currentIndex].slug;
      console.log(`Skipping song: ${skippedSlug}`);

      // Add to skipped songs list
      setSkippedSongs((prev) => [...prev, skippedSlug]);

      // Move to next index
      setCurrentIndex((prev) => prev + 1);
      setIsLoading(false);
    }
  }, [currentIndex, allMidis]);

  // Load next song
  const loadNextSong = useCallback(async () => {
    if (currentIndex >= allMidis.length) {
      // We've gone through all midis
      alert("All midis have been processed!");
      setAutoBatchEnabled(false); // Stop auto mode when done
      return;
    }

    // Clear any existing loading timeout
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
    }

    setIsLoading(true);
    try {
      const nextMidi = allMidis[currentIndex];
      console.log(
        `Loading midi: ${nextMidi.slug} from corpus: ${nextMidi.corpusSlug}`,
      );

      // Set a timeout to auto-skip if loading takes too long (15 seconds)
      loadingTimeoutRef.current = setTimeout(() => {
        console.error(`Loading timeout for ${nextMidi.slug}. Auto-skipping.`);
        skipSong();
      }, 3000);

      await handleSongClick(nextMidi.slug);

      // Clear timeout if loading succeeds
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }

      setCurrentIndex((prev) => prev + 1);
    } catch (error) {
      console.error("Error loading next song:", error);
      // If loading fails, skip to the next song
      skipSong();
    } finally {
      setIsLoading(false);
    }
  }, [currentIndex, allMidis, handleSongClick, skipSong]);

  // Toggle auto batch mode
  const toggleAutoBatch = useCallback(() => {
    setAutoBatchEnabled((prev) => !prev);
  }, []);

  // Copy histograms to clipboard
  const copyHistogramsToClipboard = useCallback(() => {
    try {
      const histogramsJSON = localStorage.getItem("NOTE_HISTOGRAMS") || "{}";
      navigator.clipboard.writeText(histogramsJSON);
      alert("Histograms copied to clipboard!");
    } catch (error) {
      console.error("Error copying to clipboard:", error);
      alert("Failed to copy to clipboard");
    }
  }, []);

  // Load current progress from localStorage on initial render
  useEffect(() => {
    try {
      // Get current index from localStorage
      const savedIndex = localStorage.getItem("HISTOGRAM_CURRENT_INDEX");
      if (savedIndex) {
        setCurrentIndex(parseInt(savedIndex, 10));
      }

      // Count calculated histograms
      const histogramsJSON = localStorage.getItem("NOTE_HISTOGRAMS") || "{}";
      const histograms = JSON.parse(histogramsJSON);
      setCalculatedCount(Object.keys(histograms).length);

      // Get recent histograms
      const recent = Object.entries(histograms)
        .slice(-10)
        .map(([slug, data]) => ({ slug, data: data as number[] }));
      setRecentHistograms(recent);
    } catch (error) {
      console.error("Error loading progress from localStorage:", error);
    }
  }, []);

  // Update localStorage when currentIndex changes
  useEffect(() => {
    localStorage.setItem("HISTOGRAM_CURRENT_INDEX", currentIndex.toString());
  }, [currentIndex]);

  // Effect to monitor histogram changes and trigger auto-loading
  useEffect(() => {
    const checkHistogramUpdates = () => {
      try {
        const histogramsJSON = localStorage.getItem("NOTE_HISTOGRAMS") || "{}";
        const histograms = JSON.parse(histogramsJSON);
        const count = Object.keys(histograms).length;

        if (count !== calculatedCount) {
          setCalculatedCount(count);
          setLastCalculationTime(Date.now());

          const recent = Object.entries(histograms)
            .slice(-10)
            .map(([slug, data]) => ({ slug, data: data as number[] }));
          setRecentHistograms(recent);
        }
      } catch (error) {
        console.error("Error checking histogram updates:", error);
      }
    };

    const intervalId = setInterval(checkHistogramUpdates, 2000);
    return () => clearInterval(intervalId);
  }, [calculatedCount]);

  // Effect to handle automatic loading of next song
  useEffect(() => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    // If auto batch is enabled and we've recently calculated a histogram
    if (autoBatchEnabled && lastCalculationTime > 0 && !isLoading) {
      timeoutRef.current = setTimeout(() => {
        // Only proceed if we're still in auto mode and not already loading
        if (autoBatchEnabled && !isLoading) {
          loadNextSong();
        }
      }, 1000); // 1 second delay after histogram calculation
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [autoBatchEnabled, lastCalculationTime, isLoading, loadNextSong]);

  // Effect to clean up timeouts on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, []);

  return (
    <Container>
      <ProgressSection>
        <h1>Histogram Calculator</h1>

        <Stats>
          <h2>Progress</h2>
          <p>
            Calculated: {calculatedCount} / {allMidis.length} midis (
            {Math.round((calculatedCount / allMidis.length) * 100)}%)
          </p>
          <ProgressBar>
            <ProgressFill percent={(calculatedCount / allMidis.length) * 100} />
          </ProgressBar>
          <p>
            Current index: {currentIndex} / {allMidis.length}
          </p>
          {currentMidi && <p>Current midi: {currentMidi.slug}</p>}
          <p>Auto batch mode: {autoBatchEnabled ? "ON" : "OFF"}</p>
          <p>Skipped songs: {skippedSongs.length}</p>
        </Stats>

        <ButtonContainer>
          <PlayPauseButton
            isPlaying={autoBatchEnabled}
            onClick={toggleAutoBatch}
            disabled={currentIndex >= allMidis.length}
          >
            {autoBatchEnabled ? "Pause Batch" : "Play Batch"}
          </PlayPauseButton>
          <Button
            onClick={loadNextSong}
            disabled={
              isLoading || currentIndex >= allMidis.length || autoBatchEnabled
            }
          >
            {isLoading ? "Loading..." : "Load Next Song"}
          </Button>
          <SkipButton
            onClick={skipSong}
            disabled={currentIndex >= allMidis.length}
          >
            Skip Song
          </SkipButton>
          <Button onClick={copyHistogramsToClipboard}>
            Copy All Histograms to Clipboard
          </Button>
        </ButtonContainer>

        <h2>Recent Histograms</h2>
        <HistogramList>
          {recentHistograms.map((item, index) => (
            <div key={index}>
              <strong>{item.slug}:</strong> {JSON.stringify(item.data)}
            </div>
          ))}
        </HistogramList>

        {skippedSongs.length > 0 && (
          <>
            <h2>Skipped Songs ({skippedSongs.length})</h2>
            <HistogramList>
              {skippedSongs.map((slug, index) => (
                <div key={index}>{slug}</div>
              ))}
            </HistogramList>
          </>
        )}
      </ProgressSection>

      <RawlSection>
        {rawlProps && currentMidi && (
          <InlineRawlPlayer {...rawlProps}>
            <div style={{ padding: 20 }}>
              <h3>Currently Loading: {currentMidi.slug}</h3>
              <p>
                This Rawl player is automatically calculating and saving
                histograms.
              </p>
            </div>
          </InlineRawlPlayer>
        )}
      </RawlSection>
    </Container>
  );
};

export default Histograms;
