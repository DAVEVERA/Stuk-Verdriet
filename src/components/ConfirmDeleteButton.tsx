"use client";

type ConfirmDeleteButtonProps = {
  confirmMessage: string;
  className?: string;
  children: React.ReactNode;
};

export function ConfirmDeleteButton({ confirmMessage, className, children }: ConfirmDeleteButtonProps) {
  return (
    <button
      className={className}
      type="submit"
      onClick={(event) => {
        if (!window.confirm(confirmMessage)) event.preventDefault();
      }}
    >
      {children}
    </button>
  );
}
