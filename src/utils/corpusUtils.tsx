import { flag } from "country-emoji";
import * as React from "react";
import { ReactNode } from "react";
import styled from "styled-components";

export const Flags = styled.span`
  display: inline-flex;
  align-items: center;
  margin-right: 4px;
`;

export const GenreList = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #999;
`;

export const GenreItem = styled.span`
  cursor: default;
`;

export const getUniqueStyles = (genre?: string, style?: string): string[] => {
  const styles = new Set<string>();
  if (genre) {
    genre
      .split(",")
      .map((s) => s.trim())
      .forEach((s) => styles.add(s));
  }
  if (style) {
    style
      .split(",")
      .map((s) => s.trim())
      .forEach((s) => styles.add(s));
  }
  return Array.from(styles);
};

export const getEmojis = (country?: string): ReactNode[] => {
  if (!country) return [];
  const countries = country.split(",").map((c) => c.trim());
  return countries.map((c) => <Flags key={c}>{flag(c)}</Flags>);
};

export interface HasMetadata {
  composerBirthYear?: number;
  country?: string;
  genre?: string;
  style?: string;
}

export const hasMetadata = (corpus: HasMetadata): boolean => {
  return Boolean(
    corpus.composerBirthYear || corpus.country || corpus.genre || corpus.style,
  );
};
