export function CreateTopicIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className || "h-auto w-[56px]"}
      viewBox="0 0 78 78"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M75 39L3 39"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <path
        d="M39 75L39 3"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinecap="round"
      />
    </svg>
  );
}
