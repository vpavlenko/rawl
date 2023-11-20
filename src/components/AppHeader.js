import React from "react";
import { Link } from "react-router-dom";
import {
  TWELVE_CHORD_TONES,
  TWELVE_TONE_COLORS,
  getTextColorForBackground,
} from "./chiptheory/romanNumerals";

const BLACK_KEYS = [1, 3, -1, 6, 8, 10, -1];
const WHITE_KEYS = [0, 2, 4, 5, 7, 9, 11];

const KEY_WIDTH = 10;
const KEY_HEIGHT = 15;
const PADDING = 1;
const ROW_DISTANCE = 10;
const RawlPalette = () => {
  return (
    <div
      style={{
        position: "relative",
        width: 100,
        height: KEY_HEIGHT + ROW_DISTANCE,
      }}
    >
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <>
          <div
            key={`w_${i}`}
            style={{
              backgroundColor: TWELVE_TONE_COLORS[WHITE_KEYS[i]],
              position: "absolute",
              left: (KEY_WIDTH + PADDING) * i,
              top: ROW_DISTANCE,
              width: KEY_WIDTH,
              height: KEY_HEIGHT,
              textAlign: "center",
              color: getTextColorForBackground(
                TWELVE_TONE_COLORS[WHITE_KEYS[i]],
              ),
              fontFamily: "sans-serif",
              fontSize: "8px",
              userSelect: "none",
            }}
          >
            {TWELVE_CHORD_TONES[WHITE_KEYS[i]]}
          </div>
          {BLACK_KEYS[i] !== -1 ? (
            <div
              style={{
                position: "absolute",
                top: 0,
                left: (KEY_WIDTH + PADDING) * (i + 0.5),
                zIndex: 2,
                backgroundColor: TWELVE_TONE_COLORS[BLACK_KEYS[i]],
                width: KEY_WIDTH,
                height: KEY_HEIGHT,
                textAlign: "center",
                color: getTextColorForBackground(
                  TWELVE_TONE_COLORS[BLACK_KEYS[i]],
                ),
                fontFamily: "sans-serif",
                fontSize: "8px",
                userSelect: "none",
              }}
            >
              {TWELVE_CHORD_TONES[BLACK_KEYS[i]]}
            </div>
          ) : null}
        </>
      ))}
    </div>
  );
};

export default class AppHeader extends React.PureComponent {
  render() {
    return (
      <header className="AppHeader">
        <Link className="AppHeader-title" to={{ pathname: "/" }}>
          Rawl
        </Link>
        {" • "}
        <Link className="AppHeader-title" to={{ pathname: "/browse/MIDI" }}>
          MIDI
        </Link>
        {this.props.user ? (
          <>
            {" • "}
            Logged in as {this.props.user.displayName}.{" "}
            <a href="#" onClick={this.props.handleLogout}>
              Logout
            </a>
          </>
        ) : (
          <>
            {" • "}
            <a href="#" onClick={this.props.handleLogin}>
              .
            </a>{" "}
          </>
        )}
        {" • "}
        Built on top of{" "}
        <a
          href="https://chiptune.app/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Chip Player JS
        </a>
        {" • "}
        <div style={{ display: "inline-block" }}>
          <a
            href="https://github.com/vpavlenko/12-colors/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <RawlPalette />
          </a>
        </div>
      </header>
    );
  }
}
