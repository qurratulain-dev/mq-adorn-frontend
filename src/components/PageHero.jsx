export default function PageHero({ eyebrow = 'MQ Adorn', title, children }) {
  return (
    <header className="border-b border-black/5 bg-blush/60">
      <div className="container-page py-8 sm:py-10">
        <p className="text-xs tracking-[0.22em] text-muted uppercase">{eyebrow}</p>
        <h1 className="mt-2 font-heading text-3xl font-medium sm:text-4xl">{title}</h1>
        {children && <div className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">{children}</div>}
      </div>
    </header>
  )
}
