import * as React from "react";
import { Link } from "react-router-dom";

const AppHeader: React.FC = () => {
  return (
    <header className="AppHeader">
      <Link className="AppHeader-title" to={{ pathname: "/" }}>
        Rawl
      </Link>
      {" • "}
      <Link className="AppHeader-title" to={{ pathname: "/browse/MIDI" }}>
        Rock
      </Link>
      {" • "}
      <Link className="AppHeader-title" to={{ pathname: "/browse/Demo MIDI" }}>
        d
      </Link>{" "}
      <Link
        className="AppHeader-title"
        to={{ pathname: "/browse/Roland SMF MIDI Disks" }}
      >
        r
      </Link>{" "}
      <Link
        className="AppHeader-title"
        to={{ pathname: "/browse/Piano E-Competition MIDI" }}
      >
        e
      </Link>{" "}
      <Link
        className="AppHeader-title"
        to={{ pathname: "/browse/vgmusic.com MIDI" }}
      >
        v
      </Link>{" "}
      <Link
        className="AppHeader-title"
        to={{ pathname: "/browse/Nintendo 64 (SoundFont MIDI)" }}
      >
        n
      </Link>{" "}
      <Link className="AppHeader-title" to={{ pathname: "/browse/OnlyMIDIs" }}>
        o
      </Link>{" "}
      <Link
        className="AppHeader-title"
        to={{ pathname: "/browse/Sound Canvas MIDI Collection" }}
      >
        s
      </Link>{" "}
      <Link
        className="AppHeader-title"
        to={{ pathname: "/browse/Tune 1000 SMF MIDI Disks" }}
      >
        t
      </Link>{" "}
      <Link
        className="AppHeader-title"
        to={{ pathname: "/browse/Classical MIDI" }}
      >
        cl
      </Link>{" "}
      <Link
        className="AppHeader-title"
        to={{ pathname: "/browse/Contemporary" }}
      >
        ct
      </Link>{" "}
      <Link className="AppHeader-title" to={{ pathname: "/browse/Game MIDI" }}>
        g
      </Link>{" "}
      <Link className="AppHeader-title" to={{ pathname: "/browse/Jazz MIDI" }}>
        j
      </Link>{" "}
      {" • "}
      <Link className="AppHeader-title" to={{ pathname: "/pages/daw" }}>
        DAW
      </Link>{" "}
      {" • "}
      <a href="https://github.com/vpavlenko/rawl" target="_blank">
        <div className="octocat" />
      </a>
    </header>
  );
};

export default AppHeader;
