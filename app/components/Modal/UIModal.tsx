"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import styles from "./UIModal.module.css";

const MapPanel = dynamic(() => import("./MapPanel"), { ssr: false });

interface UIModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEnter: () => void;
}

const TABS = [
  {
    id: "about",
    label: "ABOUT US",
    tag: "EST. 2026",
    description: "We are city-17 rebel faction established in 2026 by N9nepenguinz and MihlaLOL",
  },
  {
    id: "join",
    label: "JOIN US",
    tag: "RECRUITING",
    description: "Are you ready for the New World Order? With you on my side, Death to the UU. We will liberate America, once and for all.",
  },
];

export default function UIModal({ isOpen, onClose, onEnter }: UIModalProps) {
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

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
    else { setVisible(false); setActiveTab(0); }
  }, [isOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") handleClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (!isOpen) return null;

  const tab = TABS[activeTab];

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
          <div className={styles.unifiedCard}>
            <div className={styles.tabRow}>
              {TABS.map((t, i) => (
                <button
                  key={t.id}
                  className={[styles.tabBtn, activeTab === i ? styles.tabActive : ""].filter(Boolean).join(" ")}
                  onClick={() => setActiveTab(i)}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className={styles.cardBody}>
              <span className={styles.label}>// {tab.id}</span>
              <span className={styles.detailName}>{tab.label}</span>
              <div className={styles.line} />
              <div className={styles.meta}>
                <span className={styles.key}>status</span>
                <span className={styles.val}>{tab.tag}</span>
              </div>
              <div className={styles.line} />
              <p className={styles.desc}>{tab.description}</p>
            </div>
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