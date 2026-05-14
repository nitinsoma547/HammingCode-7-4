export function TODO({ label }: { label: string }) {
  return (
    <span className="inline-block px-2 py-0.5 rounded border-2 border-red-500 text-red-600 text-xs font-mono align-middle">
      TODO: {label}
    </span>
  );
}
