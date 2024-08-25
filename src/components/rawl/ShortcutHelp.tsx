import React from "react";

const shortcuts = {
  Global: {
    h: "Toggle this help modal",
    Space: "Play/Pause",
    "-": "Decrease speed by 0.1",
    _: "Decrease speed by 0.01",
    "=": "Increase speed by 0.1",
    "+": "Increase speed by 0.01",
    ArrowLeft: "Seek backward 5 seconds",
    ArrowRight: "Seek forward 5 seconds",
    f: "Switch to frozen layout",
  },
  "System Layout": {
    a: "Decrease second width",
    d: "Increase second width",
    s: "Increase note height",
    w: "Decrease note height",
  },
};

const styles = {
  container: {
    fontFamily: "Arial, sans-serif",
    backgroundColor: "#1e1e1e",
    color: "#ffffff",
    padding: "20px",
    borderRadius: "5px",
    maxWidth: "600px",
    margin: "0 auto",
  },
  h2: {
    borderBottom: "1px solid #444",
    paddingBottom: "10px",
    marginBottom: "20px",
  },
  category: {
    marginBottom: "20px",
  },
  h3: {
    color: "#bb86fc",
    marginBottom: "10px",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse" as const,
  },
  tr: {
    borderBottom: "1px solid #333",
  },
  td: {
    padding: "8px 0",
  },
  kbd: {
    backgroundColor: "#333",
    color: "#fff",
    padding: "2px 5px",
    borderRadius: "3px",
    fontFamily: "monospace",
    fontSize: "0.9em",
  },
};

export const ShortcutHelp: React.FC = () => (
  <div style={styles.container}>
    <h2 style={styles.h2}>Keyboard Shortcuts</h2>
    {Object.entries(shortcuts).map(([category, categoryShortcuts]) => (
      <div key={category} style={styles.category}>
        <h3 style={styles.h3}>{category}</h3>
        <table style={styles.table}>
          <tbody>
            {Object.entries(categoryShortcuts).map(([key, description]) => (
              <tr key={key} style={styles.tr}>
                <td style={styles.td}>
                  <kbd style={styles.kbd}>{key}</kbd>
                </td>
                <td style={styles.td}>{description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ))}
  </div>
);
