import * as React from "react";
import { Link } from "react-router-dom";
import { corpora } from "./corpora";

const Corpus: React.FC<{ slug: string }> = ({ slug }) => {
  const [searchTerm, setSearchTerm] = React.useState("");
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  const highlightMatch = (text: string, term: string) => {
    if (!term) return text;
    const regex = new RegExp(
      `(${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
      "gi",
    );
    const parts = text.split(regex);
    return parts.map((part, index) =>
      regex.test(part) ? <mark key={index}>{part}</mark> : part,
    );
  };

  const filteredCorpora = corpora.filter(
    (corpus) =>
      corpus.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
      corpus.midis.some((midi) =>
        midi.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
  );

  if (!slug) {
    return (
      <div>
        <input
          ref={searchInputRef}
          type="text"
          placeholder="Search composers or songs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: "100%", padding: "10px", marginBottom: "20px" }}
        />
        {filteredCorpora.map(({ slug, midis }) => {
          const composerMatched =
            searchTerm && slug.toLowerCase().includes(searchTerm.toLowerCase());
          const matchingMidis = searchTerm
            ? midis.filter((midi) =>
                midi.toLowerCase().includes(searchTerm.toLowerCase()),
              )
            : midis;
          return (
            <div
              key={slug}
              style={
                composerMatched
                  ? {
                      borderLeft: "3px solid yellow",
                      paddingLeft: "10px",
                      marginBottom: "15px",
                    }
                  : {}
              }
            >
              <Link to={`/corpus/${slug}`}>
                {highlightMatch(slug.replace(/_/g, " "), searchTerm)}{" "}
                <span style={{ color: "white", fontSize: "0.6em" }}>
                  {midis.length}
                </span>
              </Link>
              {(composerMatched || searchTerm) &&
                matchingMidis.map((midi) => (
                  <div key={midi} style={{ paddingLeft: "20px" }}>
                    <a
                      href={`/f/${midi}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {highlightMatch(
                        midi.replace(/---/g, " – ").replace(/-/g, " "),
                        searchTerm,
                      )}
                    </a>
                  </div>
                ))}
            </div>
          );
        })}
      </div>
    );
  }

  const corpus = corpora.filter((corpus) => corpus.slug === slug)?.[0];
  if (!corpus) {
    return <div>Corpus {slug} not found</div>;
  }

  return (
    <div>
      <h1>{slug}</h1>
      {corpus.midis.map((midiSlug) => (
        <div>
          <a href={`/f/${midiSlug}`} target="_blank">
            {midiSlug.replace(/---/g, " – ").replace(/-/g, " ")}
          </a>
        </div>
      ))}
    </div>
  );
};

export default Corpus;
