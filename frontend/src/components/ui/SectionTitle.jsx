const SectionTitle = ({ eyebrow, title, body, action }) => (
  <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
    <div className="max-w-2xl">
      {eyebrow && <p className="mb-2 text-xs font-semibold uppercase tracking-[0.35em] text-stone-500">{eyebrow}</p>}
      <h2 className="text-3xl font-semibold tracking-tight text-ink">{title}</h2>
      {body && <p className="mt-3 text-sm leading-6 text-stone-600">{body}</p>}
    </div>
    {action}
  </div>
);

export default SectionTitle;
