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
        Songs
      </Link>
      {" • "}
      <Link className="AppHeader-title" to={{ pathname: "/axes" }}>
        Tags
      </Link>
      {" • "}
      <Link
        className="AppHeader-title"
        to={{ pathname: "/browse/Classical MIDI" }}
      >
        Classical
      </Link>
      {", "}
      <Link className="AppHeader-title" to={{ pathname: "/browse/Demo MIDI" }}>
        Demo
      </Link>
      {", "}
      <Link
        className="AppHeader-title"
        to={{ pathname: "/browse/Contemporary" }}
      >
        Contemp
      </Link>
      {", "}
      <Link className="AppHeader-title" to={{ pathname: "/browse/Game MIDI" }}>
        Game
      </Link>
      {", "}
      <Link className="AppHeader-title" to={{ pathname: "/browse/Jazz MIDI" }}>
        Jazz
      </Link>
      {", "}
      <Link
        className="AppHeader-title"
        to={{ pathname: "/browse/Piano E-Competition MIDI" }}
      >
        Piano
      </Link>
      {", "}
      <Link
        className="AppHeader-title"
        to={{ pathname: "/browse/Roland SMF MIDI Disks" }}
      >
        Roland
      </Link>
      {", "}
      <Link
        className="AppHeader-title"
        to={{ pathname: "/browse/Sound Canvas MIDI Collection" }}
      >
        SC
      </Link>
      {", "}
      <Link
        className="AppHeader-title"
        to={{ pathname: "/browse/Tune 1000 SMF MIDI Disks" }}
      >
        Tune
      </Link>
      {", "}
      <Link
        className="AppHeader-title"
        to={{ pathname: "/browse/vgmusic.com MIDI" }}
      >
        vg
      </Link>
      {", "}
      <Link
        className="AppHeader-title"
        to={{ pathname: "/browse/Nintendo 64 (SoundFont MIDI)" }}
      >
        N64
      </Link>
      {", "}
      <Link className="AppHeader-title" to={{ pathname: "/browse/OnlyMIDIs" }}>
        Only
      </Link>
      {" • "}
      <a href="https://github.com/vpavlenko/rawl" target="_blank">
        <div className="octocat" />
      </a>
    </header>
  );
};

export default AppHeader;
