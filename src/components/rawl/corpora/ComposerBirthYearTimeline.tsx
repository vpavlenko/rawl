import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { formatComposerName } from "../corpusUtils";
import type { CorpusEntry } from "./corpora";

export type ComposerTimelineEntry = {
  slug: string;
  composer: CorpusEntry | null;
  categoryId?: string;
  title?: string;
  href?: string;
};

export type ComposerTimelineCategory = {
  id: string;
  label: string;
  color: string;
};

const TimelineHeading = styled.div`
  padding: 8px 0 6px;
  color: #999;
  font-size: 12px;
`;

const TimelineScroll = styled.div`
  position: relative;
  z-index: 2;
  width: 100%;
`;

const TimelineTrack = styled.div<{ $height: number; $axisY: number }>`
  position: relative;
  width: calc(100% - 48px);
  height: ${({ $height }) => $height}px;
  margin: 0 24px;

  &::before {
    content: "";
    position: absolute;
    top: ${({ $axisY }) => $axisY}px;
    left: 0;
    right: 0;
    border-top: 1px solid #555;
  }
`;

const TimelineTick = styled.div<{
  $position: number;
  $axisY: number;
  $emphasis: number;
}>`
  position: absolute;
  top: ${({ $axisY }) => $axisY}px;
  left: ${({ $position }) => $position}%;
  height: ${({ $emphasis }) => 7 + $emphasis * 3}px;
  border-left: ${({ $emphasis }) => 1 + $emphasis}px solid
    ${({ $emphasis }) =>
      $emphasis === 2 ? "#ddd" : $emphasis === 1 ? "#aaa" : "#555"};

  span {
    position: absolute;
    top: ${({ $emphasis }) => 11 + $emphasis * 3}px;
    left: 0;
    transform: translateX(-50%);
    color: ${({ $emphasis }) =>
      $emphasis === 2 ? "#eee" : $emphasis === 1 ? "#bbb" : "#888"};
    font-size: ${({ $emphasis }) => 11 + $emphasis * 2}px;
    font-weight: ${({ $emphasis }) =>
      $emphasis === 2 ? 700 : $emphasis === 1 ? 600 : 400};
    line-height: 1;
    font-variant-numeric: tabular-nums;
  }
`;

const TimelineComposerNames = styled.div<{
  $left: number;
  $width: number;
  $highlighted: boolean;
}>`
  position: absolute;
  left: ${({ $left }) => $left}px;
  top: 5px;
  width: ${({ $width }) => $width}px;
  color: ${({ $highlighted }) => ($highlighted ? "#fff" : "#bbb")};
  font-family: Arial, Helvetica, sans-serif;
  font-size: 11px;
  line-height: 14px;
  text-align: center;
  white-space: nowrap;
`;

const TimelineDot = styled.span<{
  $dimmed: boolean;
  $position: number;
  $size: number;
  $axisY: number;
  $color: string;
}>`
  position: absolute;
  z-index: 1;
  top: ${({ $axisY }) => $axisY}px;
  left: ${({ $position }) => $position}%;
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
  transform: translate(-50%, -50%);
  border: 1px solid black;
  border-radius: 50%;
  background: ${({ $color }) => $color};
  box-sizing: border-box;
  padding: 0;
  cursor: pointer;
  opacity: ${({ $dimmed }) => ($dimmed ? 0.15 : 1)};
  transition: opacity 120ms ease;
  &:focus-visible {
    outline: 2px solid white;
    outline-offset: 2px;
  }
`;

const TimelineDotTooltip = styled.div<{
  $left: number;
  $top: number;
  $width: number;
  $wrap: boolean;
}>`
  position: absolute;
  z-index: 3;
  left: ${({ $left }) => $left}px;
  top: ${({ $top }) => $top}px;
  transform: translateY(-100%);
  width: ${({ $width }) => $width}px;
  box-sizing: border-box;
  padding: 2px 6px;
  color: #fff;
  background: #000;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 11px;
  line-height: 14px;
  text-align: center;
  white-space: ${({ $wrap }) => ($wrap ? "normal" : "nowrap")};
  pointer-events: none;
`;

const TimelinePiecePopup = styled.div<{
  $left: number;
  $top: number;
  $width: number;
}>`
  position: absolute;
  z-index: 4;
  left: ${({ $left }) => $left}px;
  top: ${({ $top }) => $top}px;
  width: ${({ $width }) => $width}px;
  box-sizing: border-box;
  padding: 8px;
  background: #000;
  border: 1px solid #555;
  border-radius: 4px;
  box-shadow: 0 4px 16px #000;
  max-height: 260px;
  overflow-y: auto;
  font-size: 12px;
  line-height: 1.4;
  h3 {
    margin: 10px 4px 2px;
    color: #fff;
    font-size: 12px;
    font-weight: 600;
  }
  h3:first-child {
    margin-top: 0;
  }
  a {
    display: block;
    padding: 2px 4px;
    color: #ffaa00;
    text-decoration: none;
    overflow-wrap: anywhere;
  }
  a:hover,
  a:focus-visible {
    text-decoration: underline;
  }
`;

const TimelineNote = styled.div`
  padding: 0 0 12px;
  color: #777;
  font-size: 11px;
`;

const TimelineLane = styled.div<{ $axisY: number; $color: string }>`
  position: absolute;
  top: ${({ $axisY }) => $axisY}px;
  left: 0;
  right: 0;
  border-top: 1px solid ${({ $color }) => $color};
  opacity: 0.2;
  pointer-events: none;
`;

const ComposerBirthYearTimeline: React.FC<{
  entries: ComposerTimelineEntry[];
  categories?: ComposerTimelineCategory[];
  highlightedCategoryId?: string | null;
  itemLabel?: string;
  ariaLabel?: string;
}> = ({
  entries,
  categories = [],
  highlightedCategoryId = null,
  itemLabel = "snippet",
  ariaLabel = "Structure composer birth year timeline",
}) => {
  const timelineRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cancelClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = null;
  };
  const closePopup = () => {
    cancelClose();
    setHoveredYear(null);
    setHoveredPoint(null);
    setFocusedYear(null);
    setFocusedPoint(null);
  };
  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = setTimeout(() => {
      setHoveredYear(null);
      setHoveredPoint(null);
    }, 200);
  };
  useEffect(() => () => cancelClose(), []);
  const [timelineWidth, setTimelineWidth] = useState(0);
  const [hoveredYear, setHoveredYear] = useState<number | null>(null);
  const [focusedYear, setFocusedYear] = useState<number | null>(null);
  const composersByYear = new Map<number, Map<string, number>>();
  const composerNames = new Map<string, string>();
  const composerKey = (composer: CorpusEntry) =>
    composer.composerName || composer.slug;
  const nameForComposer = (slug: string) =>
    composerNames.get(slug) || formatComposerName(slug);
  let undatedCount = 0;
  entries.forEach((entry) => {
    const composer = entry.composer;
    if (composer)
      composerNames.set(
        composerKey(composer),
        composer.composerName || formatComposerName(composer.slug),
      );
    const year = composer?.composerBirthYear;
    if (typeof year !== "number") {
      undatedCount++;
      return;
    }
    const composers = composersByYear.get(year) || new Map<string, number>();
    const key = composerKey(composer);
    composers.set(key, (composers.get(key) || 0) + 1);
    composersByYear.set(year, composers);
  });

  const categoryRows = categories.length
    ? categories
    : [{ id: "default", label: "", color: "#ddd" }];
  const points = categoryRows.flatMap((category, row) => {
    const byYear = new Map<number, ComposerTimelineEntry[]>();
    entries.forEach((entry) => {
      const year = entry.composer?.composerBirthYear;
      if (
        typeof year !== "number" ||
        (categories.length && entry.categoryId !== category.id)
      )
        return;
      byYear.set(year, [...(byYear.get(year) || []), entry]);
    });
    return [...byYear].map(([year, items]) => ({
      key: `${year}:${category.id}`,
      year,
      items,
      category,
      row,
      composers: [...new Set(items.map((item) => composerKey(item.composer!)))],
    }));
  });
  const [hoveredPoint, setHoveredPoint] = useState<string | null>(null);
  const [focusedPoint, setFocusedPoint] = useState<string | null>(null);
  const years = [...composersByYear.keys()];
  const hasYears = years.length > 0;
  useEffect(() => {
    const timeline = timelineRef.current;
    if (!timeline) return;
    const updateWidth = () => setTimelineWidth(timeline.clientWidth);
    updateWidth();
    const observer = new ResizeObserver(updateWidth);
    observer.observe(timeline);
    window.addEventListener("resize", updateWidth);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateWidth);
    };
  }, [hasYears]);

  if (years.length === 0) {
    return (
      <>
        <TimelineHeading>Composer birth years</TimelineHeading>
        <TimelineNote>No composer birth years available.</TimelineNote>
      </>
    );
  }

  const firstYear = Math.floor(Math.min(...years) / 10) * 10;
  const lastYear = Math.max(
    firstYear + 10,
    Math.ceil(Math.max(...years) / 10) * 10,
  );
  const span = lastYear - firstYear;
  const desiredTickSpacing =
    span / Math.max(2, Math.floor((timelineWidth || 800) / 52) - 1);
  const tickInterval =
    [10, 20, 50, 100, 200, 500, 1000].find(
      (interval) => interval >= desiredTickSpacing,
    ) || 1000;
  const firstTick = Math.ceil(firstYear / tickInterval) * tickInterval;
  const ticks = Array.from(
    { length: Math.floor((lastYear - firstTick) / tickInterval) + 1 },
    (_, index) => firstTick + index * tickInterval,
  );
  const trackWidth = Math.max((timelineWidth || 800) - 48, 1);
  const measure =
    typeof document === "undefined"
      ? null
      : document.createElement("canvas").getContext("2d");
  if (measure) measure.font = "11px Arial";
  const candidates = [...composersByYear]
    .flatMap(([year, composers]) =>
      [...composers].map(([slug, count]) => {
        const name = nameForComposer(slug);
        const width = Math.ceil(
          (measure?.measureText(name).width || name.length * 7) + 10,
        );
        return { year, slug, name, count, width };
      }),
    )
    .sort((a, b) => b.count - a.count || a.width - b.width || a.year - b.year);
  const labels: {
    year: number;
    slug: string;
    name: string;
    left: number;
    width: number;
  }[] = [];
  candidates.forEach(({ year, slug, name, width }) => {
    if (width > trackWidth) return;
    const x = ((year - firstYear) / span) * trackWidth;
    const preferredLeft = Math.min(
      Math.max(x - width / 2, 0),
      trackWidth - width,
    );
    const minLeft = Math.max(0, x - width);
    const maxLeft = Math.min(trackWidth - width, x);
    const options = [
      preferredLeft,
      minLeft,
      maxLeft,
      ...labels.flatMap((label) => [
        label.left - width - 8,
        label.left + label.width + 8,
      ]),
    ]
      .filter((left) => left >= minLeft && left <= maxLeft)
      .sort(
        (a, b) => Math.abs(a - preferredLeft) - Math.abs(b - preferredLeft),
      );
    const left = options.find((option) =>
      labels.every(
        (label) =>
          option >= label.left + label.width + 8 ||
          label.left >= option + width + 8,
      ),
    );
    if (left === undefined) return;
    labels.push({ year, slug, name, left, width });
  });
  const activePoint = points.find(
    (point) => point.key === (hoveredPoint ?? focusedPoint),
  );
  const axisY = 32 + (categoryRows.length - 1) * 20;
  const activeYear = activePoint?.year ?? hoveredYear ?? focusedYear;
  const linkedItems = activePoint?.items.filter((item) => item.href) || [];
  const tooltipText = linkedItems.length
    ? ""
    : activeYear === null
    ? ""
    : [...(composersByYear.get(activeYear)?.keys() ?? [])]
        .filter(
          (slug) =>
            !labels.some(
              (label) => label.year === activeYear && label.slug === slug,
            ),
        )
        .map(nameForComposer)
        .join(", ");
  const tooltipContentWidth = Math.ceil(
    (measure?.measureText(tooltipText).width ?? tooltipText.length * 7) + 12,
  );
  const tooltipWidth = Math.min(
    trackWidth,
    categories.length ? 360 : tooltipContentWidth,
  );
  const tooltipX =
    activeYear === null ? 0 : ((activeYear - firstYear) / span) * trackWidth;
  const tooltipLeft = Math.max(
    0,
    Math.min(trackWidth - tooltipWidth, tooltipX - tooltipWidth / 2),
  );
  const activeDotSize = Math.min(
    8 + 3 * Math.sqrt((composersByYear.get(activeYear ?? -1)?.size ?? 1) - 1),
    24,
  );

  return (
    <>
      <TimelineHeading>Composer birth years</TimelineHeading>
      <TimelineScroll
        ref={timelineRef}
        aria-label={ariaLabel}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            const trigger =
              event.currentTarget.querySelector<HTMLButtonElement>(
                'button[aria-expanded="true"]',
              );
            trigger?.focus();
            closePopup();
          }
        }}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node))
            closePopup();
        }}
      >
        <TimelineTrack $height={axisY + 40} $axisY={axisY}>
          {labels.map(({ year, slug, name, left, width }) => (
            <TimelineComposerNames
              key={`${year}:${slug}`}
              $left={left}
              $width={width}
              $highlighted={year === activeYear}
              data-timeline-label-year={year}
            >
              {name}
            </TimelineComposerNames>
          ))}
          {ticks.map((year) => (
            <TimelineTick
              key={year}
              $position={((year - firstYear) / span) * 100}
              $axisY={axisY}
              $emphasis={year % 100 === 0 ? 2 : year % 50 === 0 ? 1 : 0}
            >
              <span>{year}</span>
            </TimelineTick>
          ))}
          {categories.length > 0 &&
            categoryRows.map((category, row) => (
              <TimelineLane
                key={category.id}
                $axisY={32 + row * 20}
                $color={category.color}
              />
            ))}
          {points.map((point) => (
            <TimelineDot
              key={point.key}
              data-timeline-category={point.category.id}
              $dimmed={
                highlightedCategoryId !== null &&
                point.category.id !== highlightedCategoryId
              }
              as={point.items.some((item) => item.href) ? "button" : "span"}
              aria-haspopup={
                point.items.some((item) => item.href) ? "dialog" : undefined
              }
              aria-expanded={
                point.items.some((item) => item.href)
                  ? activePoint?.key === point.key
                  : undefined
              }
              $position={((point.year - firstYear) / span) * 100}
              $size={Math.min(
                8 + 3 * Math.sqrt(point.composers.length - 1),
                24,
              )}
              $axisY={32 + point.row * 20}
              $color={point.category.color}
              aria-label={`${point.year}: ${point.composers
                .map(nameForComposer)
                .join(", ")}${
                categories.length
                  ? `; ${point.category.label}; ${
                      point.items.length
                    } ${itemLabel}${point.items.length === 1 ? "" : "s"}`
                  : ""
              }`}
              role={point.items.some((item) => item.href) ? undefined : "img"}
              tabIndex={0}
              onKeyDown={(event) => {
                if (
                  linkedItems.length &&
                  activePoint?.key === point.key &&
                  (event.key === "ArrowDown" ||
                    (event.key === "Tab" && !event.shiftKey))
                ) {
                  event.preventDefault();
                  popupRef.current?.querySelector("a")?.focus();
                }
              }}
              onMouseEnter={() => {
                cancelClose();
                setHoveredYear(point.year);
                setHoveredPoint(point.key);
              }}
              onMouseLeave={scheduleClose}
              onClick={() => {
                cancelClose();
                setFocusedYear(point.year);
                setFocusedPoint(point.key);
              }}
              onFocus={() => {
                setFocusedYear(point.year);
                setFocusedPoint(point.key);
              }}
            />
          ))}
          {linkedItems.length > 0 && activePoint && (
            <TimelinePiecePopup
              ref={popupRef}
              $left={tooltipLeft}
              $top={32 + activePoint.row * 20 + 8}
              $width={tooltipWidth}
              role="dialog"
              aria-label={`Pieces by ${activePoint.composers
                .map(nameForComposer)
                .join(", ")}`}
              onMouseEnter={cancelClose}
              onMouseLeave={scheduleClose}
            >
              {activePoint.composers.map((composer) => (
                <React.Fragment key={composer}>
                  <h3>{nameForComposer(composer)}</h3>
                  {linkedItems
                    .filter(
                      (item) =>
                        item.composer &&
                        composerKey(item.composer) === composer,
                    )
                    .map((item) => (
                      <a key={item.slug} href={item.href}>
                        {item.title || item.slug}
                      </a>
                    ))}
                </React.Fragment>
              ))}
            </TimelinePiecePopup>
          )}
          {tooltipText && (
            <TimelineDotTooltip
              $left={tooltipLeft}
              $top={
                (activePoint ? 32 + activePoint.row * 20 : axisY) -
                activeDotSize / 2 -
                2
              }
              $width={tooltipWidth}
              $wrap={tooltipContentWidth > tooltipWidth}
              role="tooltip"
            >
              {tooltipText}
            </TimelineDotTooltip>
          )}
        </TimelineTrack>
      </TimelineScroll>
      {undatedCount > 0 && (
        <TimelineNote>
          {undatedCount} {itemLabel}
          {undatedCount === 1 ? "" : "s"} without a known birth year
        </TimelineNote>
      )}
    </>
  );
};

export default ComposerBirthYearTimeline;
