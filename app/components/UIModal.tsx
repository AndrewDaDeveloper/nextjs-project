"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import "./UIModal.css";

interface Item {
  name: string;
  tag: string;
  description: string;
}

interface UIModalProps {
  onEnter: () => void;
}

const ITEMS: Item[] = [
  { name: "ABOUT US", tag: "Coming soon", description: "We are city-17 rebel faction established in 2026 by N9nepenguinz and MihlaLOL" },
  { name: "JOIN US NOW", tag: "Coming soon", description: "Are you ready for the New World Order? With you on my side, Death to the UU. We will liberate America, once and for all." },
];

export default function UIModal({ onEnter }: UIModalProps) {
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);
  const [active, setActive] = useState<number>(0);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleClose = useCallback(() => {
    setClosing(true);
    window.dispatchEvent(new Event("close-ui-modal"));
    closeTimer.current = setTimeout(() => {
      setClosing(false);
      setOpen(false);
    }, 500);
  }, []);

  const handleEnter = useCallback(() => {
    handleClose();
    onEnter();
  }, [handleClose, onEnter]);

  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener("open-ui-modal", handler);
    return () => window.removeEventListener("open-ui-modal", handler);
  }, []);

  useEffect(() => {
    if (open) requestAnimationFrame(() => setVisible(true));
    else { setVisible(false); setActive(0); }
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") handleClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleClose]);

  useEffect(() => {
    return () => { if (closeTimer.current) clearTimeout(closeTimer.current); };
  }, []);

  if (!open) return null;

  return (
    <div className={`overlay${visible ? " vis" : ""}${closing ? " closing" : ""}`}>
      <div className="container">
        <div className="panel-left">
          <span className="label">// select entry</span>
          <ul className="list">
            {ITEMS.map((item, i) => (
              <li
                key={i}
                className={`row${active === i ? " active" : ""}`}
                onMouseEnter={() => setActive(i)}
              >
                <div className="bar" />
                <span className="name">{item.name}</span>
                <span className="tag">{item.tag}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="divider" />

        <div className="panel-right">
          <span className="label">// selected entry</span>
          <span className="detail-name">{ITEMS[active].name}</span>
          <div className="line" />
          <div className="meta">
            <span className="key">category</span>
            <span className="val">{ITEMS[active].tag}</span>
          </div>
          <div className="line" />
          <p className="desc">{ITEMS[active].description}</p>
        </div>
      </div>

      <div className="btn-row">
        <button className="close-btn" onClick={handleEnter}>ENTER</button>
        <button className="close-btn" onClick={handleClose}>CLOSE</button>
      </div>
      <span className="esc-hint">ESC to dismiss</span>
    </div>
  );
}