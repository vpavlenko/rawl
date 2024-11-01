export const beautifySlug = (slug: string): string => {
  return slug.replace(/---/g, " – ").replace(/-/g, " ").replace(/_/g, " ");
};
