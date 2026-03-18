"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import styles from "./UIModal.module.css";

const MapPanel = dynamic(() => import("./MapPanel"), { ssr: false });

interface Item {
  name: string;
  tag: string;
  description: string;
}

interface UIModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEnter: () => void;
}

const ITEMS: Item[] = [
  {
    name: "ABOUT US",
    tag: "Coming soon",
    description: "We are city-17 rebel faction established in 2026 by N9nepenguinz and MihlaLOL",
  },
  {
    name: "JOIN US NOW",
    tag: "Coming soon",
    description:
      "Are you ready for the New World Order? With you on my side, Death to the UU. We will liberate America, once and for all.",
  },
];

export default function UIModal({ isOpen, onClose, onEnter }: UIModalProps) {
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);
  const [active, setActive] = useState<number>(0);

  const handleClose = () => {
    setClosing(true);
    window.dispatchEvent(new Event("close-ui-modal"));
    setTimeout(() => setClosing(false), 500);
    onClose();
  };

  const handleEnter = () => {
    setClosing(true);
    window.dispatchEvent(new Event("close-ui-modal"));
    setTimeout(() => setClosing(false), 500);
    onClose();
    onEnter();
  };

  useEffect(() => {
    if (isOpen) requestAnimationFrame(() => setVisible(true));
    else { setVisible(false); setActive(0); }
  }, [isOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") handleClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (!isOpen) return null;

  return (
    <div
      className={[
        styles.overlay,
        visible ? styles.vis : "",
        closing ? styles.closing : "",
      ].filter(Boolean).join(" ")}
    >
      <div className={styles.container}>

        <div className={styles.panelSection}>
          <div className={styles.panelLeft}>
            <span className={styles.label}>// select entry</span>
            <ul className={styles.list}>
              {ITEMS.map((item, i) => (
                <li
                  key={i}
                  className={[styles.row, active === i ? styles.active : ""].filter(Boolean).join(" ")}
                  onMouseEnter={() => setActive(i)}
                >
                  <div className={styles.bar} />
                  <span className={styles.name}>{item.name}</span>
                  <span className={styles.tag}>{item.tag}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.divider} />

          <div className={styles.panelRight}>
            <span className={styles.label}>// selected entry</span>
            <span className={styles.detailName}>{ITEMS[active].name}</span>
            <div className={styles.line} />
            <div className={styles.meta}>
              <span className={styles.key}>category</span>
              <span className={styles.val}>{ITEMS[active].tag}</span>
            </div>
            <div className={styles.line} />
            <p className={styles.desc}>{ITEMS[active].description}</p>
          </div>
        </div>

        <div className={styles.mapSection}>
          <MapPanel />
        </div>

      </div>

      <div className={styles.btnRow}>
        <button className={styles.enterBtn} onClick={handleEnter}>ENTER</button>
        <button className={styles.closeBtn} onClick={handleClose}>CLOSE</button>
      </div>
      <span className={styles.escHint}>ESC to dismiss</span>
    </div>
  );
}