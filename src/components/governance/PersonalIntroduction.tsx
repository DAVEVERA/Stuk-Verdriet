import { anitaIntroduction } from "@/lib/governance";
import styles from "./Governance.module.css";

export function PersonalIntroduction() {
  return (
    <section className={styles.intro} aria-labelledby="even-voorstellen">
      <div className={styles.introHeader}>
        <h2 className={styles.introName} id="even-voorstellen">
          {anitaIntroduction.eyebrow}
        </h2>
        <p className={styles.introRole}>
          {anitaIntroduction.name} &middot; {anitaIntroduction.role}
        </p>
      </div>
      <div className={styles.introBody}>
        {anitaIntroduction.paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
      <p className={styles.introClosing}>{anitaIntroduction.closing}</p>
    </section>
  );
}
