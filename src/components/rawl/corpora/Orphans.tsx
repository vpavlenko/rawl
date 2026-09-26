import * as React from "react";
import styled from "styled-components";
import snapshot from "./orphans.json";

const Page = styled.div`
  max-width: 960px;
  margin: 0 auto 100px;
  padding: 24px;

  p {
    color: #aaa;
    line-height: 1.5;
  }

  input {
    box-sizing: border-box;
    width: 100%;
    padding: 12px;
    border: 1px solid #666;
    border-radius: 4px;
    background: #222;
    color: white;
    font: inherit;
  }

  li {
    padding: 8px 0;
    overflow-wrap: anywhere;
  }

  a {
    color: #ffaa00;
  }

  small {
    display: block;
    margin-top: 4px;
    color: #999;
  }
`;

const Orphans: React.FC = () => {
  const [search, setSearch] = React.useState("");
  const query = search.trim().toLowerCase();
  const midis = React.useMemo(
    () =>
      snapshot.midis.filter((midi) =>
        `${midi.title} ${midi.slug || ""} ${midi.id}`
          .toLowerCase()
          .includes(query),
      ),
    [query],
  );

  return (
    <Page>
      <h1>Orphaned MIDIs</h1>
      <p>
        {snapshot.midis.length.toLocaleString()} MIDIs in Firebase that were not
        included in any corpus when this list was saved on{" "}
        <time dateTime={snapshot.generatedAt}>
          {snapshot.generatedAt.slice(0, 10)}
        </time>
        . This is a static snapshot.
      </p>
      <input
        type="search"
        aria-label="Search orphaned MIDIs"
        placeholder="Search by title or slug"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
      />
      <p aria-live="polite">
        Showing {midis.length.toLocaleString()} of{" "}
        {snapshot.midis.length.toLocaleString()}
      </p>
      {midis.length ? (
        <ol>
          {midis.map((midi) => (
            <li key={midi.id}>
              {midi.playerPath ? (
                <a
                  href={midi.playerPath}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {midi.title}
                </a>
              ) : (
                <span>{midi.title}</span>
              )}
              <small>
                {midi.slug || midi.id}
                {!midi.playerPath && " · Missing from the player index"}
              </small>
            </li>
          ))}
        </ol>
      ) : (
        <p>No orphaned MIDIs match your search.</p>
      )}
    </Page>
  );
};

export default Orphans;
