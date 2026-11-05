import { ApplyCta } from "./ApplyCta";

const LINKS = [
  { href: "#how", label: "How it works" },
  { href: "#get", label: "What you get" },
  { href: "#faq", label: "FAQ" },
];

export function Nav() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-phosphor">
      <nav aria-label="Main" className="flex h-14 items-center justify-between px-[var(--gutter)] md:h-[60px]">
        <a href="#top" className="flex items-center gap-2" aria-label="Inbetween, back to top">
          <span className="rec-dot !h-[11px] !w-[11px]" aria-hidden />
          <span className="display text-[1.55rem] tracking-[0.04em]">Inbetween</span>
        </a>
        <ul className="hidden items-center gap-7 md:flex">
          {LINKS.map((l) => (
            <li key={l.href}>
              <a href={l.href} className="text-[0.98rem] text-cream/80 transition-colors hover:text-cream">
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        <ApplyCta location="nav" label="Apply →" size="sm" />
      </nav>
    </header>
  );
}
