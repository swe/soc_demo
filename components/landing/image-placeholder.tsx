/**
 * Marketing placeholder for photography / UI mockups.
 * Describes what final art direction should show.
 */
export default function ImagePlaceholder({
  label,
  description,
  className = '',
  minHeight = 'min-h-[280px]',
}: {
  label: string
  description: string
  className?: string
  minHeight?: string
}) {
  return (
    <div
      className={`rounded-xl border border-dashed border-gray-600/80 bg-gray-950/60 flex flex-col items-center justify-center text-center p-6 ${minHeight} ${className}`}
    >
      <p className="text-xs font-semibold uppercase tracking-wider text-blue-400 mb-2">{label}</p>
      <p className="text-sm text-gray-400 max-w-md leading-relaxed">{description}</p>
    </div>
  )
}
