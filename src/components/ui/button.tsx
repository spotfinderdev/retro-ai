import React from "react";

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

export function Button({ children, onClick, disabled, className }: ButtonProps) {
  return (
    <button
      className={`px-4 py-2 rounded-md transition-all ${className} ${
        disabled ? "opacity-50 cursor-not-allowed" : "hover:shadow-lg"
      }`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
