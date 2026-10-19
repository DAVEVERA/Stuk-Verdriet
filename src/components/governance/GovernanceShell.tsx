import Link from "next/link";
import type { ReactNode } from "react";
import { otherGovernanceLinks } from "@/lib/governance";
import { governanceLinks } from "@/lib/governance";
import styles from "./Governance.module.css";

type GovernanceShellProps = {
  /** Huidige route, bepaalt welke navigatielink actief is. */
  current: string;
  label: string;
  title: string;
  lede: string;
  meta?: string;
  children: ReactNode;
};

export function GovernanceShell({ current, label, title, lede, meta, children }: GovernanceShellProps) {
  const related = otherGovernanceLinks(current);

  return (
    <div className={styles.page}>
      <header className={styles.hero}>
        <p className={styles.label}>
          <span className={styles.labelRule} aria-hidden />
          {label}
        </p>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.lede}>{lede}</p>
        {meta ? <p className={styles.meta}>{meta}</p> : null}
      </header>

      <nav className={styles.sectionNav} aria-label="Over de stichting">
        <ul className={styles.sectionNavList}>
          {governanceLinks.map((link) => {
            const isCurrent = link.href === current;
            return (
              <li key={link.href}>
                <Link
                  className={isCurrent ? `${styles.sectionNavLink} ${styles.sectionNavLinkCurrent}` : styles.sectionNavLink}
                  href={link.href}
                  aria-current={isCurrent ? "page" : undefined}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {children}

      <aside className={styles.related} aria-labelledby="governance-related-title">
        <h2 className={styles.relatedTitle} id="governance-related-title">
          Verder lezen
        </h2>
        <ul className={styles.relatedGrid}>
          {related.map((link) => (
            <li key={link.href}>
              <Link className={styles.relatedCard} href={link.href}>
                <span className={styles.relatedCardTitle}>{link.label}</span>
                <span className={styles.relatedCardText}>{link.description}</span>
                <span className={styles.relatedCardArrow} aria-hidden>
                  &rarr;
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </aside>

      <div className={styles.actions}>
        <Link className="button" href="/">
          Terug naar home
        </Link>
        <Link className="text-link" href="/contact">
          Contact opnemen
        </Link>
      </div>
    </div>
  );
}
