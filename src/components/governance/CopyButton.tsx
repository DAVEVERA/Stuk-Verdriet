"use client";

import { Check, Copy } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import styles from "./Governance.module.css";

export function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeout.current) clearTimeout(timeout.current);
    };
  }, []);

  async function copy() {
    if (timeout.current) clearTimeout(timeout.current);
    try {
      await navigator.clipboard.writeText(value);
      setFailed(false);
      setCopied(true);
    } catch {
      // Klembord is geblokkeerd (oudere browser of onveilige context): toon de waarde dan gewoon.
      setCopied(false);
      setFailed(true);
    }
    timeout.current = setTimeout(() => {
      setCopied(false);
      setFailed(false);
    }, 2600);
  }

  return (
    <>
      <button className={styles.copyButton} onClick={copy} type="button">
        {copied ? <Check aria-hidden size={15} /> : <Copy aria-hidden size={15} />}
        <span className="sr-only">{`${label} kopiëren`}</span>
      </button>
      <span aria-live="polite" className={styles.copyStatus}>
        {copied ? "Gekopieerd" : failed ? "Kopiëren lukt niet, selecteer de tekst" : ""}
      </span>
    </>
  );
}
