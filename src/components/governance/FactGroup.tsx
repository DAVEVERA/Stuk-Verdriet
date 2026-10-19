import type { GovernanceFact } from "@/lib/governance";
import { CopyButton } from "./CopyButton";
import styles from "./Governance.module.css";

export function FactGroup({ title, facts }: { title: string; facts: GovernanceFact[] }) {
  return (
    <section className={styles.factGroup}>
      <h2 className={styles.factGroupTitle}>{title}</h2>
      <dl className={styles.factList}>
        {facts.map((fact) => (
          <div className={styles.fact} key={fact.label}>
            <dt className={styles.factLabel}>
              {fact.label}
              {fact.hint ? <span className={styles.factHint}>{fact.hint}</span> : null}
            </dt>
            <dd className={styles.factValue}>
              <span className={fact.copy ? styles.factValueText : undefined}>
                {fact.href ? (
                  <a
                    className={styles.factLink}
                    href={fact.href}
                    rel={fact.href.startsWith("http") ? "noopener noreferrer" : undefined}
                    target={fact.href.startsWith("http") ? "_blank" : undefined}
                  >
                    {fact.value}
                  </a>
                ) : (
                  fact.value
                )}
              </span>
              {fact.copy ? <CopyButton label={fact.label} value={fact.copyValue ?? fact.value} /> : null}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
