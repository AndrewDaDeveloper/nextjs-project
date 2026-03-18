"use client";
import { useEffect, useRef, useState } from "react";
import styles from "./UIModal.module.css";

export default function MapPanel() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<unknown>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    import("maplibre-gl").then((maplibregl) => {
      const CENTER: [number, number] = [-0.0922, 51.5155];
      const LIMIT = 0.02;

      const CYBER_STYLE = {
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
            paint: { "background-color": "#000305" },
          },
          {
            id: "water",
            type: "fill" as const,
            source: "openmaptiles",
            "source-layer": "water",
            paint: { "fill-color": "#00080f" },
          },
          {
            id: "landuse",
            type: "fill" as const,
            source: "openmaptiles",
            "source-layer": "landuse",
            paint: { "fill-color": "#03050a" },
          },
          {
            id: "building-flat",
            type: "fill" as const,
            source: "openmaptiles",
            "source-layer": "building",
            paint: {
              "fill-color": "#05080f",
              "fill-outline-color": "#0a1020",
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
                0,   "#060810",
                20,  "#080c18",
                60,  "#0a1020",
                150, "#0d1528",
              ] as maplibregl.ExpressionSpecification,
              "fill-extrusion-height": [
                "interpolate", ["linear"], ["zoom"],
                14, 0,
                14.5, ["get", "render_height"],
              ] as maplibregl.ExpressionSpecification,
              "fill-extrusion-base": ["get", "render_min_height"] as maplibregl.ExpressionSpecification,
              "fill-extrusion-opacity": 0.95,
            },
          },

          {
            id: "road-base",
            type: "line" as const,
            source: "openmaptiles",
            "source-layer": "transportation",
            filter: ["in", ["get", "class"], ["literal", ["motorway","trunk","primary","secondary","tertiary","minor","service"]]] as maplibregl.FilterSpecification,
            paint: { "line-color": "#000000", "line-width": 2 },
          },

          {
            id: "glow-minor-outer",
            type: "line" as const,
            source: "openmaptiles",
            "source-layer": "transportation",
            filter: ["in", ["get", "class"], ["literal", ["minor","tertiary","service"]]] as maplibregl.FilterSpecification,
            paint: { "line-color": "#0066aa", "line-width": 6, "line-blur": 8, "line-opacity": 0.2 },
          },
          {
            id: "glow-minor-mid",
            type: "line" as const,
            source: "openmaptiles",
            "source-layer": "transportation",
            filter: ["in", ["get", "class"], ["literal", ["minor","tertiary","service"]]] as maplibregl.FilterSpecification,
            paint: { "line-color": "#0088cc", "line-width": 1.5, "line-blur": 2, "line-opacity": 0.4 },
          },
          {
            id: "glow-minor-core",
            type: "line" as const,
            source: "openmaptiles",
            "source-layer": "transportation",
            filter: ["in", ["get", "class"], ["literal", ["minor","tertiary","service"]]] as maplibregl.FilterSpecification,
            paint: { "line-color": "#44aadd", "line-width": 0.6, "line-blur": 0, "line-opacity": 0.6 },
          },

          {
            id: "glow-secondary-outer",
            type: "line" as const,
            source: "openmaptiles",
            "source-layer": "transportation",
            filter: ["==", ["get", "class"], "secondary"] as maplibregl.FilterSpecification,
            paint: { "line-color": "#0099cc", "line-width": 10, "line-blur": 10, "line-opacity": 0.3 },
          },
          {
            id: "glow-secondary-mid",
            type: "line" as const,
            source: "openmaptiles",
            "source-layer": "transportation",
            filter: ["==", ["get", "class"], "secondary"] as maplibregl.FilterSpecification,
            paint: { "line-color": "#00bbee", "line-width": 3, "line-blur": 4, "line-opacity": 0.55 },
          },
          {
            id: "glow-secondary-core",
            type: "line" as const,
            source: "openmaptiles",
            "source-layer": "transportation",
            filter: ["==", ["get", "class"], "secondary"] as maplibregl.FilterSpecification,
            paint: { "line-color": "#aaeeff", "line-width": 0.8, "line-blur": 0, "line-opacity": 0.9 },
          },

          {
            id: "glow-primary-outer",
            type: "line" as const,
            source: "openmaptiles",
            "source-layer": "transportation",
            filter: ["==", ["get", "class"], "primary"] as maplibregl.FilterSpecification,
            paint: { "line-color": "#00ccff", "line-width": 14, "line-blur": 12, "line-opacity": 0.35 },
          },
          {
            id: "glow-primary-mid",
            type: "line" as const,
            source: "openmaptiles",
            "source-layer": "transportation",
            filter: ["==", ["get", "class"], "primary"] as maplibregl.FilterSpecification,
            paint: { "line-color": "#00ddff", "line-width": 4, "line-blur": 5, "line-opacity": 0.65 },
          },
          {
            id: "glow-primary-core",
            type: "line" as const,
            source: "openmaptiles",
            "source-layer": "transportation",
            filter: ["==", ["get", "class"], "primary"] as maplibregl.FilterSpecification,
            paint: { "line-color": "#ccf8ff", "line-width": 1, "line-blur": 0, "line-opacity": 1 },
          },

          {
            id: "glow-motorway-outer",
            type: "line" as const,
            source: "openmaptiles",
            "source-layer": "transportation",
            filter: ["in", ["get", "class"], ["literal", ["motorway","trunk"]]] as maplibregl.FilterSpecification,
            paint: { "line-color": "#00e5ff", "line-width": 20, "line-blur": 16, "line-opacity": 0.4 },
          },
          {
            id: "glow-motorway-mid",
            type: "line" as const,
            source: "openmaptiles",
            "source-layer": "transportation",
            filter: ["in", ["get", "class"], ["literal", ["motorway","trunk"]]] as maplibregl.FilterSpecification,
            paint: { "line-color": "#00eeff", "line-width": 5, "line-blur": 6, "line-opacity": 0.75 },
          },
          {
            id: "glow-motorway-core",
            type: "line" as const,
            source: "openmaptiles",
            "source-layer": "transportation",
            filter: ["in", ["get", "class"], ["literal", ["motorway","trunk"]]] as maplibregl.FilterSpecification,
            paint: { "line-color": "#ffffff", "line-width": 1.2, "line-blur": 0, "line-opacity": 1 },
          },
        ],
      };

      const map = new maplibregl.Map({
        container: containerRef.current!,
        style: CYBER_STYLE,
        center: CENTER,
        zoom: 14.8,
        minZoom: 14.8,
        maxZoom: 14.8,
        pitch: 55,
        bearing: -20,
        attributionControl: false,
        interactive: true,
        dragPan: true,
        dragRotate: false,
        scrollZoom: false,
        boxZoom: false,
        keyboard: false,
        doubleClickZoom: false,
        touchZoomRotate: false,
        touchPitch: false,
        maxBounds: [
          [CENTER[0] - LIMIT, CENTER[1] - LIMIT],
          [CENTER[0] + LIMIT, CENTER[1] + LIMIT],
        ],
        maxTileCacheSize: 16,
        fadeDuration: 0,
      });

      map.getCanvas().style.setProperty("pointer-events", "auto", "important");

      map.on("idle", () => {
        map.getCanvas().style.setProperty("pointer-events", "auto", "important");
        setLoaded(true);
      });

      mapRef.current = map;
    });

    return () => {
      if (mapRef.current) {
        (mapRef.current as { remove: () => void }).remove();
        mapRef.current = null;
      }
    };
  }, []);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        cursor: "grab",
        touchAction: "none",
      }}
      onMouseDown={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
      onMouseMove={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
    >
      {!loaded && <div className={styles.mapSkeleton} />}
      <div
        ref={containerRef}
        style={{
          width: "100%",
          height: "100%",
          opacity: loaded ? 1 : 0,
          transition: "opacity 0.5s ease",
        }}
      />
    </div>
  );
}