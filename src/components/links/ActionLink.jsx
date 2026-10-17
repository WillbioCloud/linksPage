import React from "react";

/**
 * Renders a link row as an anchor, or as a button when the entry runs an
 * in-page action (salvar contato / compartilhar) instead of navigating.
 */
export default function ActionLink({ link, onAction, className, children }) {
  if (link.action) {
    return (
      <button
        type="button"
        onClick={() => onAction(link.action)}
        className={`cursor-pointer ${className}`}
      >
        {children}
      </button>
    );
  }

  return (
    <a
      href={link.href}
      target={link.external ? "_blank" : undefined}
      rel={link.external ? "noreferrer" : undefined}
      className={className}
    >
      {children}
    </a>
  );
}