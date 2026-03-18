"use client";
import { useEffect, useRef } from "react";
import styles from "./UIModal.module.css";

export default function MapPanel() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<unknown>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    import("maplibre-gl").then((maplibregl) => {
      const map = new maplibregl.Map({
        container: containerRef.current!,
        style: "https://tiles.openfreemap.org/styles/liberty",
        center: [-0.1195, 51.5033],
        zoom: 14.2,
        pitch: 65,
        bearing: -20,
        attributionControl: false,
        interactive: false,
        dragPan: false,
        dragRotate: false,
        scrollZoom: false,
        boxZoom: false,
        keyboard: false,
        doubleClickZoom: false,
        touchZoomRotate: false,
        touchPitch: false,
      });

      map.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-right");

      map.on("load", () => {
        const allLayers = map.getStyle().layers;

        allLayers.forEach((layer) => {
          if (layer.type === "symbol") {
            map.setLayoutProperty(layer.id, "visibility", "none");
            return;
          }

          const sl = (layer as { "source-layer"?: string })["source-layer"];

          if (layer.id === "background") {
            map.setPaintProperty(layer.id, "background-color", "#000000");
          }
          if (sl === "water" && layer.type === "fill") {
            map.setPaintProperty(layer.id, "fill-color", "#03080f");
            map.setPaintProperty(layer.id, "fill-opacity", 1);
          }
          if (sl === "waterway" && layer.type === "line") {
            map.setPaintProperty(layer.id, "line-color", "#050d18");
          }
          if ((sl === "landcover" || sl === "landuse" || sl === "park") && layer.type === "fill") {
            map.setPaintProperty(layer.id, "fill-color", "#010101");
          }
          if (sl === "building" && layer.type === "fill") {
            map.setPaintProperty(layer.id, "fill-color", "#070707");
            map.setPaintProperty(layer.id, "fill-opacity", 1);
          }
          if (sl === "transportation" && layer.type === "line") {
            map.setPaintProperty(layer.id, "line-color", "#111111");
            map.setPaintProperty(layer.id, "line-width", 1);
          }
          if (sl === "boundary" && layer.type === "line") {
            map.setPaintProperty(layer.id, "line-color", "#050505");
          }
        });

        if (!map.getLayer("3d-buildings-dark")) {
          map.addLayer({
            id: "3d-buildings-dark",
            source: "openmaptiles",
            "source-layer": "building",
            type: "fill-extrusion",
            minzoom: 12,
            paint: {
              "fill-extrusion-color": [
                "interpolate", ["linear"], ["get", "render_height"],
                0,   "#0a0a0a",
                20,  "#111116",
                60,  "#16161e",
                150, "#1c1c28",
                300, "#202030",
              ],
              "fill-extrusion-height": [
                "interpolate", ["linear"], ["zoom"],
                12, 0,
                12.5, ["get", "render_height"],
              ],
              "fill-extrusion-base": ["get", "render_min_height"],
              "fill-extrusion-opacity": 1,
            },
          });
        }

        const glowLayers = [
          {
            id: "glow-motorway-outer",
            filter: ["in", ["get", "class"], ["literal", ["motorway", "trunk"]]],
            color: "#ffffff",
            width: 20,
            blur: 16,
            opacity: 0.18,
          },
          {
            id: "glow-motorway-inner",
            filter: ["in", ["get", "class"], ["literal", ["motorway", "trunk"]]],
            color: "#00e5ff",
            width: 3,
            blur: 2,
            opacity: 0.9,
          },
          {
            id: "glow-primary-outer",
            filter: ["==", ["get", "class"], "primary"],
            color: "#ffffff",
            width: 14,
            blur: 12,
            opacity: 0.15,
          },
          {
            id: "glow-primary-inner",
            filter: ["==", ["get", "class"], "primary"],
            color: "#00cfff",
            width: 2,
            blur: 1,
            opacity: 0.85,
          },
          {
            id: "glow-secondary-outer",
            filter: ["==", ["get", "class"], "secondary"],
            color: "#ffffff",
            width: 10,
            blur: 9,
            opacity: 0.12,
          },
          {
            id: "glow-secondary-inner",
            filter: ["==", ["get", "class"], "secondary"],
            color: "#e0f0ff",
            width: 1.5,
            blur: 0.5,
            opacity: 0.7,
          },
          {
            id: "glow-minor-outer",
            filter: ["in", ["get", "class"], ["literal", ["minor", "service", "tertiary"]]],
            color: "#aaccff",
            width: 7,
            blur: 7,
            opacity: 0.1,
          },
          {
            id: "glow-minor-inner",
            filter: ["in", ["get", "class"], ["literal", ["minor", "service", "tertiary"]]],
            color: "#c8e0ff",
            width: 1,
            blur: 0.5,
            opacity: 0.5,
          },
        ];

        glowLayers.forEach(({ id, filter, color, width, blur, opacity }) => {
          if (!map.getLayer(id)) {
            map.addLayer({
              id,
              type: "line",
              source: "openmaptiles",
              "source-layer": "transportation",
              filter: filter as maplibregl.FilterSpecification,
              paint: {
                "line-color": color,
                "line-width": width,
                "line-blur": blur,
                "line-opacity": opacity,
              },
            });
          }
        });

        let bearing = -20;
        const animate = () => {
          bearing += 0.012;
          map.setBearing(bearing);
          rafRef.current = requestAnimationFrame(animate);
        };
        animate();
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

  return <div ref={containerRef} className={styles.mapViewport} />;
}