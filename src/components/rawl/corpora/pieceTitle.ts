// Composer headings already provide the credit in grouped corpus views.
export const stripComposerFromTitle = (
  title: string,
  names: string[],
): string => {
  const escape = (value: string) =>
    value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  let result = title;
  const variants = new Set<string>();
  const creditVariants: Record<string, string[]> = {
    Handel: ["Georg Friedrich Handel"],
    "Dmitry Kabalevsky": ["Dmitri Kabalevsky"],
    "Raimonds Pauls": ["Raymond Pauls"],
    "Laura Shigihara": ["Laura Shgihara"],
  };
  names
    .flatMap((name) => [name, ...(creditVariants[name] || [])])
    .filter((name) => name && name !== "Unknown composer")
    .forEach((name) => {
      name.split(/\s*(?:\+|&)\s*/).forEach((person) => {
        const words = person.trim().split(/[\s-]+/);
        variants.add(
          words
            .map((word) =>
              word.length === 2
                ? [...word].map(escape).join("\\s*\\.?\\s*")
                : escape(word),
            )
            .join("[\\s.]+"),
        );
        if (words.length > 1) {
          const surname = words.at(-1)!;
          const surnameWords =
            words.length > 2 && /^(de|di|van|von|del|da)$/i.test(words.at(-2)!)
              ? words.slice(-2)
              : [surname];
          const surnamePattern = surnameWords.map(escape).join("[\\s.]+");
          variants.add(
            escape(words[0]) +
              "(?:[\\s.]+\\p{L}\\s*\\.?)*[\\s.]+" +
              surnamePattern,
          );
          variants.add(escape(words[0][0]) + "\\s*\\.?\\s*" + surnamePattern);
          const initials = words
            .slice(0, -1)
            .map((word) => escape(word[0]) + "\\s*\\.?\\s*")
            .join("");
          variants.add(initials + escape(surname));
          variants.add(escape(words[0][0]) + "\\s*\\.?\\s*" + escape(surname));
          words
            .filter((word) => word.length > 2)
            .forEach((word) => variants.add(escape(word)));
        }
      });
    });
  [...variants]
    .sort((a, b) => b.length - a.length)
    .forEach((variant) => {
      result = result.replace(
        new RegExp(
          `(?<![\\p{L}\\p{N}])${variant}(?:['’]s)?(?![\\p{L}\\p{N}])`,
          "giu",
        ),
        "",
      );
    });
  result = result
    .replace(/\s+/g, " ")
    .replace(/(?:\s*[–—-]\s*){2,}/g, " – ")
    .replace(/^\s*(?:[–—\-.,:]+\s*)+/i, "")
    .replace(/(?:\s+(?:by|from)|[–—\-.,:~])+\s*$/i, "")
    .replace(/\(\s*\)/g, "")
    .trim();
  return result ? result[0].toUpperCase() + result.slice(1) : title;
};
