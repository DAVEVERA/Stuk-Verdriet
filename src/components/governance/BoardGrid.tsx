import Image from "next/image";
import type { BoardMember } from "@/lib/governance";
import styles from "./Governance.module.css";

export function BoardGrid({ members }: { members: BoardMember[] }) {
  return (
    <ul className={styles.boardGrid}>
      {members.map((member) => (
        <li className={styles.boardCard} key={member.name}>
          <div className={styles.boardPhoto}>
            <Image
              alt={member.imageAlt}
              fill
              sizes="(min-width: 860px) 320px, (min-width: 620px) 45vw, 90vw"
              src={member.image}
              style={{ objectPosition: member.objectPosition }}
            />
          </div>
          <div className={styles.boardCardBody}>
            <p className={styles.boardRole}>{member.role}</p>
            <h2 className={styles.boardName}>{member.name}</h2>
            <p className={styles.boardTagline}>{member.tagline}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
