import type { FC } from "react";
import { useEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { useEscape } from "@shared/hooks";
import { LangSwitch } from "./LangSwitch";
import { ThemeToggle } from "./ThemeToggle";
import type { MobileMenuProps } from "./MobileMenu.interfaces";

export const MobileMenu: FC<MobileMenuProps> = ({
  locale,
  path,
  links,
  ctaLabel,
  ctaHref,
  openLabel,
  closeLabel,
  toggleThemeLabel,
}) => {
  const [open, setOpen] = useState<boolean>(false);
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const sheetRef = useRef<HTMLDivElement | null>(null);

  const close = useCallback((): void => {
    setOpen(false);
    triggerRef.current?.focus();
  }, []);

  useEscape(open, close);

  useEffect(() => {
    setPortalRoot(document.body);
  }, []);

  useEffect(() => {
    const body = document.body;
    if (open) {
      body.style.overflow = "hidden";
      sheetRef.current?.querySelector<HTMLAnchorElement>("a")?.focus();
    } else {
      body.style.overflow = "";
    }
    return () => {
      body.style.overflow = "";
    };
  }, [open]);

  const sheet = (
    <div
      id="mobile-menu-sheet"
      ref={sheetRef}
      className={`mobile-menu${open ? " is-open" : ""}`}
      aria-hidden={open ? "false" : "true"}
      role="dialog"
      aria-modal="true"
    >
      <div className="top">
        <span className="brand">Markish.</span>
        <button type="button" className="icon-btn" onClick={close} aria-label={closeLabel}>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true">
            <path d="M5 5l14 14M19 5L5 19" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>
      </div>
      <nav>
        {links.map((link, index) => (
          <a key={link.href} href={link.href} onClick={close}>
            <span className="num">{String(index + 1).padStart(2, "0")}</span>
            {link.label}
          </a>
        ))}
      </nav>
      <div className="foot">
        <LangSwitch current={locale} path={path} />
        <ThemeToggle toggleLabel={toggleThemeLabel} />
        <a className="btn btn-primary" href={ctaHref} onClick={close}>
          {ctaLabel}
        </a>
      </div>
    </div>
  );

  return (
    <>
      <button
        type="button"
        ref={triggerRef}
        className="icon-btn menu-trigger"
        aria-label={open ? closeLabel : openLabel}
        aria-expanded={open ? "true" : "false"}
        aria-controls="mobile-menu-sheet"
        onClick={() => setOpen((value) => !value)}
      >
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
          <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </button>

      {portalRoot ? createPortal(sheet, portalRoot) : null}
    </>
  );
};

export default MobileMenu;
