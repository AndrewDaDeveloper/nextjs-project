"use client";
import { useEffect, useRef, useState } from "react";
import styles from "./UIModal.module.css";

export default function MapPanel() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<unknown>(null);
  const rafRef = useRef<number>(0);
  const isDragging = useRef(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    import("maplibre-gl").then((maplibregl) => {
      const DARK_STYLE = {
        version: 8 as const,
        sources: {
          openmaptiles: {
            type: "vector" as const,
            url: "https://tiles.openfreemap.org/planet",
          },
        },
        layers: [
          {
            id: "background",
            type: "background" as const,
            paint: { "background-color": "#000000" },
          },
          {
            id: "water",
            type: "fill" as const,
            source: "openmaptiles",
            "source-layer": "water",
            paint: { "fill-color": "#02060c" },
          },
          {
            id: "landuse",
            type: "fill" as const,
            source: "openmaptiles",
            "source-layer": "landuse",
            paint: { "fill-color": "#080808" },
          },
          {
            id: "building-flat",
            type: "fill" as const,
            source: "openmaptiles",
            "source-layer": "building",
            paint: {
              "fill-color": "#0a0a0a",
              "fill-outline-color": "#141414",
            },
          },
          {
            id: "building-3d",
            type: "fill-extrusion" as const,
            source: "openmaptiles",
            "source-layer": "building",
            minzoom: 14,
            paint: {
              "fill-extrusion-color": [
                "interpolate", ["linear"], ["get", "render_height"],
                0,   "#0d0d0d",
                20,  "#111118",
                60,  "#15151e",
                150, "#1a1a26",
              ] as maplibregl.ExpressionSpecification,
              "fill-extrusion-height": [
                "interpolate", ["linear"], ["zoom"],
                14, 0,
                14.5, ["get", "render_height"],
              ] as maplibregl.ExpressionSpecification,
              "fill-extrusion-base": ["get", "render_min_height"] as maplibregl.ExpressionSpecification,
              "fill-extrusion-opacity": 0.9,
            },
          },
          {
            id: "road-base",
            type: "line" as const,
            source: "openmaptiles",
            "source-layer": "transportation",
            filter: ["in", ["get", "class"], ["literal", ["motorway","trunk","primary","secondary","tertiary","minor","service"]]] as maplibregl.FilterSpecification,
            paint: { "line-color": "#0a0a0a", "line-width": 1 },
          },
          {
            id: "glow-motorway",
            type: "line" as const,
            source: "openmaptiles",
            "source-layer": "transportation",
            filter: ["in", ["get", "class"], ["literal", ["motorway","trunk"]]] as maplibregl.FilterSpecification,
            paint: { "line-color": "#00e5ff", "line-width": 2, "line-blur": 3, "line-opacity": 0.9 },
          },
          {
            id: "glow-primary",
            type: "line" as const,
            source: "openmaptiles",
            "source-layer": "transportation",
            filter: ["==", ["get", "class"], "primary"] as maplibregl.FilterSpecification,
            paint: { "line-color": "#00cfff", "line-width": 1.2, "line-blur": 2, "line-opacity": 0.75 },
          },
          {
            id: "glow-secondary",
            type: "line" as const,
            source: "openmaptiles",
            "source-layer": "transportation",
            filter: ["==", ["get", "class"], "secondary"] as maplibregl.FilterSpecification,
            paint: { "line-color": "#7ac8e8", "line-width": 0.8, "line-blur": 1, "line-opacity": 0.55 },
          },
          {
            id: "glow-minor",
            type: "line" as const,
            source: "openmaptiles",
            "source-layer": "transportation",
            filter: ["in", ["get", "class"], ["literal", ["minor","tertiary","service"]]] as maplibregl.FilterSpecification,
            paint: { "line-color": "#3a6878", "line-width": 0.5, "line-blur": 0.5, "line-opacity": 0.35 },
          },
        ],
      };

      const map = new maplibregl.Map({
        container: containerRef.current!,
        style: DARK_STYLE,
        center: [-0.0922, 51.5155],
        zoom: 14.8,
        pitch: 55,
        bearing: -20,
        attributionControl: false,
        interactive: false,
        dragPan: true,
        dragRotate: false,
        scrollZoom: false,
        boxZoom: false,
        keyboard: false,
        doubleClickZoom: false,
        touchZoomRotate: false,
        touchPitch: false,
        maxTileCacheSize: 16,
        fadeDuration: 0,
      });

      map.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-right");

      map.on("mousedown", () => { isDragging.current = true; });
      map.on("mouseup",   () => { isDragging.current = false; });
      map.on("touchstart",() => { isDragging.current = true; });
      map.on("touchend",  () => { isDragging.current = false; });

      let animStarted = false;
      map.on("idle", () => {
        if (!animStarted) {
          animStarted = true;
          setLoaded(true);

          let bearing = -20;
          let lastTime = 0;
          const animate = (time: number) => {
            if (!isDragging.current && time - lastTime > 50) {
              bearing += 0.005;
              map.setBearing(bearing);
              lastTime = time;
            }
            rafRef.current = requestAnimationFrame(animate);
          };
          rafRef.current = requestAnimationFrame(animate);
        }
      });

      mapRef.current = map;
    });

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (mapRef.current) {
        (mapRef.current as { remove: () => void }).remove();
        mapRef.current = null;
      }
    };
  }, []);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%", cursor: "grab" }}>
      {!loaded && <div className={styles.mapSkeleton} />}
      <div
        ref={containerRef}
        className={styles.mapViewport}
        style={{ opacity: loaded ? 1 : 0, transition: "opacity 0.5s ease" }}
      />
    </div>
  );
}