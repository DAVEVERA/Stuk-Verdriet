"use client";

import { useState } from "react";
import { deleteCommunityAccount } from "@/lib/actions";

export function DeleteAccountForm() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"anonymize" | "erase">("anonymize");
  const [confirmText, setConfirmText] = useState("");
  const canSubmit = confirmText.trim() === "VERWIJDER";

  if (!open) {
    return (
      <button className="community-panel-button danger" type="button" onClick={() => setOpen(true)}>
        Verwijder mijn profiel
      </button>
    );
  }

  return (
    <form className="community-delete-account-form" action={deleteCommunityAccount}>
      <fieldset>
        <legend>Wat moet er gebeuren met je berichten en reacties?</legend>
        <label className="community-checkbox-row">
          <input
            type="radio"
            name="mode"
            value="anonymize"
            checked={mode === "anonymize"}
            onChange={() => setMode("anonymize")}
          />
          Berichten en reacties anonimiseren. Ze blijven staan als &quot;Verwijderde gebruiker&quot; zodat gesprekken heel blijven.
        </label>
        <label className="community-checkbox-row">
          <input
            type="radio"
            name="mode"
            value="erase"
            checked={mode === "erase"}
            onChange={() => setMode("erase")}
          />
          Berichten en reacties ook volledig verwijderen, inclusief reacties van anderen op jouw berichten.
        </label>
      </fieldset>
      <p className="community-delete-account-note">
        Je Aan de Pols-momenten, priveberichten en profiel worden in beide gevallen altijd volledig verwijderd, ongeacht je keuze hierboven. Dit kan niet ongedaan worden gemaakt.
      </p>
      <label>
        Typ <strong>VERWIJDER</strong> om te bevestigen
        <input
          name="confirm_text"
          value={confirmText}
          onChange={(event) => setConfirmText(event.target.value)}
          autoComplete="off"
          required
        />
      </label>
      <div className="community-delete-account-actions">
        <button className="community-panel-button secondary" type="button" onClick={() => setOpen(false)}>
          Annuleren
        </button>
        <button className="community-panel-button danger" type="submit" disabled={!canSubmit}>
          Account definitief verwijderen
        </button>
      </div>
    </form>
  );
}
