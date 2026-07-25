"use client";

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (next: boolean) => void;
  size?: "sm" | "md";
  disabled?: boolean;
  ariaLabel?: string;
  className?: string;
}

/**
 * A self-contained on/off toggle switch. Deliberately avoids the classic "absolutely-positioned
 * knob with no explicit left" pattern — that relies on the browser's "static position" fallback,
 * which is measured from the button's *padding box*. Any unreset default browser button padding
 * shifts that fallback away from 0, so a large translateX() in the "on" state can push the knob
 * past the track's visible edge (this bit us in production: see /memories/repo/architecture-notes.md).
 *
 * Instead, the knob is a normal-flow flex child (`inline-flex items-center`, not `position: absolute`),
 * vertically centered by flexbox and horizontally offset purely via `translateX()` from its flow
 * position — no dependency on padding-box quirks at all.
 */
export function ToggleSwitch({ checked, onChange, size = "md", disabled, ariaLabel, className = "" }: ToggleSwitchProps) {
  const track = size === "sm" ? "h-5 w-9" : "h-6 w-11";
  const knob = size === "sm" ? "h-4 w-4" : "h-5 w-5";
  const travel = size === "sm" ? 16 : 20;

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex flex-shrink-0 items-center ${track} rounded-full border-0 p-0.5 transition-colors duration-200 disabled:opacity-40 ${className}`}
      style={{ backgroundColor: checked ? "var(--accent)" : "var(--stroke)" }}
    >
      <span
        className={`inline-block ${knob} rounded-full bg-white shadow transition-transform duration-200`}
        style={{ transform: checked ? `translateX(${travel}px)` : "translateX(0)" }}
      />
    </button>
  );
}
