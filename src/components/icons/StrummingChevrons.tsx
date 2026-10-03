import React from "react";

export default function StrummingChevrons({ inward }: { inward: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {inward ? (
        <>
          <path d="m7 4 5 5 5-5" />
          <path d="m7 20 5-5 5 5" />
        </>
      ) : (
        <>
          <path d="m7 9 5-5 5 5" />
          <path d="m7 15 5 5 5-5" />
        </>
      )}
    </svg>
  );
}
