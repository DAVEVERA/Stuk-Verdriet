import type { GovernanceBlock, GovernanceSection } from "@/lib/governance";
import styles from "./Governance.module.css";

function Block({ block }: { block: GovernanceBlock }) {
  switch (block.kind) {
    case "lead":
      return <p className={styles.blockLead}>{block.text}</p>;
    case "paragraph":
      return <p className={styles.blockParagraph}>{block.text}</p>;
    case "list":
      return (
        <>
          {block.intro ? <p className={styles.blockParagraph}>{block.intro}</p> : null}
          <ul className={styles.blockList}>
            {block.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </>
      );
    case "table":
      return (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <caption className={styles.tableCaption}>{block.caption}</caption>
            <thead>
              <tr>
                {block.columns.map((column) => (
                  <th key={column} scope="col">
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map(([name, role]) => (
                <tr key={name}>
                  <th scope="row">{name}</th>
                  <td>{role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
  }
}

export function GovernanceSections({ sections }: { sections: GovernanceSection[] }) {
  return (
    <div className={styles.sections}>
      {sections.map((section) => (
        <section className={styles.section} key={section.id} id={section.id} aria-labelledby={`${section.id}-title`}>
          <div className={styles.sectionMarker}>
            <span className={styles.sectionNumber} aria-hidden>
              {section.number}
            </span>
          </div>
          <div className={styles.sectionBody}>
            <h2 className={styles.sectionTitle} id={`${section.id}-title`}>
              {section.title}
            </h2>
            {section.blocks.map((block, index) => (
              <Block block={block} key={`${section.id}-${index}`} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
