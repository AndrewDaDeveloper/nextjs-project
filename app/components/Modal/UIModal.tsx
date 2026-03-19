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
    sector: "CITY-17",
    description: "We are city-17 rebel faction established in 2026 by N9nepenguinz and MihlaLOL",
  },
  {
    id: "join",
    label: "JOIN US",
    tag: "RECRUITING",
    sector: "OPEN",
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
    <div className={[styles.overlay, visible ? styles.vis : "", closing ? styles.closing : ""].filter(Boolean).join(" ")}>
      <div className={styles.wrapper}>

        <div className={styles.topBar} />
        <div className={styles.cornerTL} />
        <div className={styles.cornerTR} />
        <div className={styles.cornerBL} />
        <div className={styles.cornerBR} />
        <span className={styles.sysLabel}>SSM·OS·V2.4.1 — SECTOR·DELTA·17</span>

        <div className={styles.container}>

          <div className={styles.panelSection}>
            <div className={styles.panelHeader}>
              <span className={styles.panelEyebrow}>// SOVEREIGN STATES MILITIA</span>
              <span className={styles.panelTitle}>REBEL<br />FACTION</span>
            </div>

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
              <div className={styles.divider} />
              <div className={styles.metaGrid}>
                <div className={styles.metaItem}>
                  <span className={styles.key}>STATUS</span>
                  <span className={styles.val}>{tab.tag}</span>
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.key}>SECTOR</span>
                  <span className={styles.val}>{tab.sector}</span>
                </div>
              </div>
              <div className={styles.divider} />
              <p className={styles.desc}>{tab.description}</p>

              <div className={styles.statusBar}>
                <div className={styles.statusDot} />
                <span className={styles.statusText}>UPLINK·ACTIVE — NODE·0x4A3F</span>
              </div>
            </div>
          </div>

          <div className={styles.mapSection}>
            <span className={styles.mapOverlayLabel}>CITY·17 — SECTOR·DELTA</span>
            <div className={styles.mapCoords}>
              <span className={styles.mapCoordLine}>LAT 42.6977°N</span>
              <span className={styles.mapCoordLine}>LON 23.3219°E</span>
            </div>
            <div className={styles.mapScanline} />
            <div className={styles.mapVignette} />
            <div className={styles.mapViewport}>
              <MapPanel />
            </div>
          </div>

        </div>

        <div className={styles.bottomBar}>
          <div className={styles.btnRow}>
            <button className={styles.enterBtn} onClick={handleEnter}>ENTER</button>
            <button className={styles.closeBtn} onClick={handleClose}>CLOSE</button>
          </div>
          <span className={styles.escHint}>ESC TO DISMISS</span>
        </div>

      </div>
    </div>
  );
}