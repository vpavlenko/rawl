import React from "react";

export default React.memo(SnippetList, (prevProps, nextProps) => {
  // Only re-render if these specific props change
  return (
    prevProps.snippets === nextProps.snippets &&
    prevProps.slugs === nextProps.slugs &&
    prevProps.loadingSnippets === nextProps.loadingSnippets
  );
});
