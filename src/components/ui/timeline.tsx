"use client";

import React, { memo, useCallback, useMemo, useState } from "react";

// ---------------------------------------------------------------------------
// Default icons. Pass your own via `item.icon` (or the `fallbackIcon` prop)
// to override — these only exist so the component works with zero setup.
// Swap for lucide-react icons in a real app if you like.
// ---------------------------------------------------------------------------
const ChevronDown = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m6 9 6 6 6-6" />
  </svg>
);
const ChevronUp = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m18 15-6-6-6 6" />
  </svg>
);
const DefaultMarkerIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 15 15"
    fill="currentColor"
  >
    <path d="M7.5 0 L8.8 5.7 L14.5 7.5 L8.8 9.3 L7.5 15 L6.2 9.3 L0.5 7.5 L6.2 5.7 Z" />
  </svg>
);

// Minimal self-contained Badge. Swap for your own UI library's component
// via the `renderSkill` prop if you have one.
const Badge = ({
  children,
  className = "",
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => (
  <span
    className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold ${className}`}
    {...props}
  >
    {children}
  </span>
);

// --- TYPES -------------------------------------------------------------

export type IconType = React.ComponentType<React.SVGProps<SVGSVGElement>>;

export interface TimelineItemData {
  id: string;
  title: string;
  /** Small subtitle line, e.g. employment type, category, status. */
  type?: string;
  /** Date range or other secondary label shown next to `type`. */
  duration?: string;
  /** Marker icon. Falls back to `fallbackIcon` (or a plain dot) if omitted. */
  icon?: IconType;
  /** Bullet list shown when the item is expanded. */
  responsibilities?: string[];
  /** Tag/skill chips shown below the responsibilities. */
  skills?: string[];
  /** Escape hatch: fully custom expanded content for this one item. */
  content?: React.ReactNode;
}

export type ExpandMode = "multi" | "single";

export interface ProfessionalTimelineProps {
  /** The items to render, in display order. */
  items: TimelineItemData[];
  /** Uncontrolled: which ids start expanded. Defaults to all items. */
  defaultExpandedIds?: string[];
  /** Controlled: pass alongside `onExpandedChange` to own the open state. */
  expandedIds?: string[];
  /** Fires on every toggle. Required for controlled usage. */
  onExpandedChange?: (expandedIds: string[]) => void;
  /** "multi" allows several open items at once; "single" is an accordion. */
  expandMode?: ExpandMode;
  /** Used for any item that doesn't supply its own `icon`. */
  fallbackIcon?: IconType;
  /** Override how a single item's expanded body renders. */
  renderContent?: (item: TimelineItemData) => React.ReactNode;
  /** Override how a single skill chip renders. */
  renderSkill?: (skill: string, item: TimelineItemData) => React.ReactNode;
  /** Shown in place of the list when `items` is empty. */
  emptyState?: React.ReactNode;
  className?: string;
  itemClassName?: string;
  /** Vertical gap between item cards. Any Tailwind `gap-*` class. Defaults to `gap-16`. */
  itemGapClassName?: string;
  lineClassName?: string;
  markerClassName?: string;
  /** aria-label for the outer <ol>. */
  ariaLabel?: string;
}

// --- CONTENT -------------------------------------------------------------

interface TimelineItemContentProps {
  item: TimelineItemData;
  renderSkill?: ProfessionalTimelineProps["renderSkill"];
}

const TimelineItemContent = memo(function TimelineItemContent({
  item,
  renderSkill,
}: TimelineItemContentProps) {
  const hasResponsibilities =
    item.responsibilities && item.responsibilities.length > 0;
  const hasSkills = item.skills && item.skills.length > 0;

  if (!hasResponsibilities && !hasSkills) return null;

  return (
    <div className="mt-6 space-y-4">
      {hasResponsibilities && (
        <ul className="space-y-3">
          {item.responsibilities!.map((responsibility, idx) => (
            <li
              key={`${item.id}-resp-${idx}`}
              className="flex items-start gap-3 font-body text-xs text-neutral-400 leading-relaxed"
            >
              <span className="leading-relaxed">{responsibility}</span>
            </li>
          ))}
        </ul>
      )}

      {hasSkills && (
        <div className="flex flex-wrap gap-1.5 pt-2">
          {item.skills!.map((skill, skillIdx) =>
            renderSkill ? (
              <React.Fragment key={`${item.id}-skill-${skillIdx}`}>
                {renderSkill(skill, item)}
              </React.Fragment>
            ) : (
              <Badge
                key={`${item.id}-skill-${skillIdx}`}
                className="border border-accent text-accent bg-accent-soft px-2 py-0.5 text-[10px] font-body"
              >
                {skill}
              </Badge>
            ),
          )}
        </div>
      )}
    </div>
  );
});
TimelineItemContent.displayName = "TimelineItemContent";

// --- ITEM ------------------------------------------------------------------

interface TimelineItemProps {
  item: TimelineItemData;
  expanded: boolean;
  onToggle: (id: string) => void;
  fallbackIcon?: IconType;
  renderContent?: ProfessionalTimelineProps["renderContent"];
  renderSkill?: ProfessionalTimelineProps["renderSkill"];
  itemClassName?: string;
  markerClassName?: string;
}

const TimelineItem = memo(function TimelineItem({
  item,
  expanded,
  onToggle,
  fallbackIcon,
  renderContent,
  renderSkill,
  itemClassName = "",
  markerClassName = "",
}: TimelineItemProps) {
  const Icon = item.icon ?? fallbackIcon ?? DefaultMarkerIcon;
  const headerId = `timeline-header-${item.id}`;
  const contentId = `timeline-content-${item.id}`;

  return (
    <li className="relative">
      {/* Timeline marker with icon */}
      <div
        className={`absolute left-1 top-5 w-6 h-6 flex items-center justify-center ${markerClassName}`}
      >
        <Icon className="w-5 h-5 text-accent star-pulse" />
      </div>

      {/* Card */}
      <div className={`ml-14 ${itemClassName}`}>
        <div className="rounded-2xl border border-[#faf3e4]/70 bg-[#faf3e4]/60 backdrop-blur-md shadow-[0_8px_30px_rgba(0,0,0,0.06)] p-4 transition-all duration-200">
          <button
            id={headerId}
            type="button"
            className="w-full text-left group cursor-pointer"
            onClick={() => onToggle(item.id)}
            aria-expanded={expanded}
            aria-controls={contentId}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-body text-sm font-medium text-neutral-100 group-hover:text-accent transition-colors">
                  {item.title}
                </h3>
                {(item.type || item.duration) && (
                  <div className="flex items-center gap-2 font-mono text-[10px] text-neutral-500 uppercase tracking-widest mt-1">
                    {item.type && <span>{item.type}</span>}
                    {item.type && item.duration && <span aria-hidden>•</span>}
                    {item.duration && <span>{item.duration}</span>}
                  </div>
                )}
              </div>

              <div className="text-neutral-500 group-hover:text-accent transition-colors flex-shrink-0 pl-4">
                {expanded ? (
                  <ChevronUp className="w-5 h-5" />
                ) : (
                  <ChevronDown className="w-5 h-5" />
                )}
              </div>
            </div>
          </button>

          <div
            className="grid transition-[grid-template-rows] duration-300 ease-in-out"
            style={{ gridTemplateRows: expanded ? "1fr" : "0fr" }}
          >
            <div
              id={contentId}
              role="region"
              aria-labelledby={headerId}
              aria-hidden={!expanded}
              className="overflow-hidden"
            >
              {renderContent ? (
                renderContent(item)
              ) : item.content !== undefined ? (
                item.content
              ) : (
                <TimelineItemContent item={item} renderSkill={renderSkill} />
              )}
            </div>
          </div>
        </div>
      </div>
    </li>
  );
});
TimelineItem.displayName = "TimelineItem";

// --- MAIN TIMELINE -----------------------------------------------------

export function ProfessionalTimeline({
  items,
  defaultExpandedIds,
  expandedIds,
  onExpandedChange,
  expandMode = "multi",
  fallbackIcon,
  renderContent,
  renderSkill,
  emptyState,
  className = "",
  itemClassName,
  itemGapClassName = "gap-8",
  lineClassName = "",
  markerClassName,
  ariaLabel = "Timeline",
}: ProfessionalTimelineProps) {
  const isControlled = expandedIds !== undefined;

  const initial = useMemo(
    () => new Set(defaultExpandedIds ?? items.map((d) => d.id)),
    // Only used as the initial value for uncontrolled state; intentionally
    // not re-derived on every items/defaultExpandedIds change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  const [internalExpanded, setInternalExpanded] =
    useState<Set<string>>(initial);

  const expandedSet = isControlled ? new Set(expandedIds) : internalExpanded;

  const onToggle = useCallback(
    (id: string) => {
      const current = isControlled ? new Set(expandedIds) : internalExpanded;
      const next = new Set(current);

      if (expandMode === "single") {
        next.clear();
        if (!current.has(id)) next.add(id);
      } else if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      if (isControlled) {
        onExpandedChange?.(Array.from(next));
      } else {
        setInternalExpanded(next);
        onExpandedChange?.(Array.from(next));
      }
    },
    [expandMode, isControlled, expandedIds, internalExpanded, onExpandedChange],
  );

  if (items.length === 0) {
    return (
      <>
        {emptyState ?? (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Nothing to show yet.
          </p>
        )}
      </>
    );
  }

  return (
    <ol
      className={`relative flex flex-col ${itemGapClassName} ${className}`}
      aria-label={ariaLabel}
    >
      {/* Vertical timeline line */}
      <div
        className={`absolute left-4 top-0 bottom-0 w-0.5 bg-accent/30 ${lineClassName}`}
        aria-hidden
      />

      {items.map((item) => (
        <TimelineItem
          key={item.id}
          item={item}
          expanded={expandedSet.has(item.id)}
          onToggle={onToggle}
          fallbackIcon={fallbackIcon}
          renderContent={renderContent}
          renderSkill={renderSkill}
          itemClassName={itemClassName}
          markerClassName={markerClassName}
        />
      ))}
    </ol>
  );
}

export default ProfessionalTimeline;
