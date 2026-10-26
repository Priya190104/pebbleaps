const EMOJI_OPTIONS = [
  "🍱", "🚌", "🛍️", "🎮", "💊", "💰", "💼", "🏦",
  "💵", "👛", "📱", "🏠", "🎁", "🐾", "✈️", "📦",
];

export function EmojiPicker({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (emoji: string) => void;
  label: string;
}) {
  return (
    <fieldset className="min-w-0">
      <legend className="mb-1 text-[11px] font-bold text-room-muted">{label}</legend>
      <div role="group" aria-label={label} className="flex flex-wrap gap-1.5">
        {EMOJI_OPTIONS.map((emoji) => (
          <button
            key={emoji}
            type="button"
            aria-pressed={value === emoji}
            aria-label={`${emoji} emoji`}
            onClick={() => onChange(emoji)}
            className={`flex h-9 w-9 items-center justify-center rounded-lg border text-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream-400 ${
              value === emoji
                ? "border-cream-500 bg-cream-100"
                : "border-room-border bg-white hover:bg-cream-50"
            }`}
          >
            {emoji}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
