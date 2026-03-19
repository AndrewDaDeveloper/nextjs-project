"use client";
import { useEffect, useRef, useState } from "react";
import styles from "./UIModal.module.css";

export default function MapPanel() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<unknown>(null);
  const deckRef = useRef<unknown>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    let destroyed = false;

    Promise.all([
      import("maplibre-gl"),
      import("@deck.gl/mapbox"),
      import("@deck.gl/layers"),
    ]).then(async ([maplibregl, { MapboxOverlay }, { SolidPolygonLayer }]) => {
      if (destroyed) return;

      const CENTER: [number, number] = [23.3219, 42.6977];
      const LIMIT = 0.018;

      const cx = 23.3239;
      const cy = 42.6987;

      const CORE_W = 0.00028;
      const CORE_D = 0.00028;
      const CORE: [number, number][] = [
        [cx - CORE_W, cy - CORE_D],
        [cx + CORE_W, cy - CORE_D],
        [cx + CORE_W, cy + CORE_D],
        [cx - CORE_W, cy + CORE_D],
        [cx - CORE_W, cy - CORE_D],
      ];

      const WING_L = 0.0009;
      const WING_D = 0.00014;
      const WING_OFFSET = 0.00014;
      const WING_NORTH: [number, number][] = [
        [cx - WING_L, cy + WING_OFFSET],
        [cx + WING_L, cy + WING_OFFSET],
        [cx + WING_L, cy + WING_OFFSET + WING_D],
        [cx - WING_L, cy + WING_OFFSET + WING_D],
        [cx - WING_L, cy + WING_OFFSET],
      ];
      const WING_SOUTH: [number, number][] = [
        [cx - WING_L, cy - WING_OFFSET - WING_D],
        [cx + WING_L, cy - WING_OFFSET - WING_D],
        [cx + WING_L, cy - WING_OFFSET],
        [cx - WING_L, cy - WING_OFFSET],
        [cx - WING_L, cy - WING_OFFSET - WING_D],
      ];

      const OBS_W = 0.00055;
      const OBS_D = 0.00055;
      const OBS_1: [number, number][] = [
        [cx - OBS_W, cy - OBS_D],
        [cx + OBS_W, cy - OBS_D],
        [cx + OBS_W, cy + OBS_D],
        [cx - OBS_W, cy + OBS_D],
        [cx - OBS_W, cy - OBS_D],
      ];
      const OBS_2: [number, number][] = [
        [cx - OBS_W * 0.72, cy - OBS_D * 0.72],
        [cx + OBS_W * 0.72, cy - OBS_D * 0.72],
        [cx + OBS_W * 0.72, cy + OBS_D * 0.72],
        [cx - OBS_W * 0.72, cy + OBS_D * 0.72],
        [cx - OBS_W * 0.72, cy - OBS_D * 0.72],
      ];

      const SPIRE_W = 0.00007;
      const SPIRE: [number, number][] = [
        [cx - SPIRE_W, cy - SPIRE_W],
        [cx + SPIRE_W, cy - SPIRE_W],
        [cx + SPIRE_W, cy + SPIRE_W],
        [cx - SPIRE_W, cy + SPIRE_W],
        [cx - SPIRE_W, cy - SPIRE_W],
      ];

      const layers = [
        new SolidPolygonLayer({
          id: "tower-core",
          data: [{ contour: CORE }],
          extruded: true,
          wireframe: false,
          filled: true,
          getPolygon: (d: any) => d.contour,
          getElevation: () => 1800,
          getFillColor: [18, 36, 90, 248] as [number, number, number, number],
          material: { ambient: 0.25, diffuse: 0.65, shininess: 240, specularColor: [80, 160, 255] as [number, number, number] },
        }),
        new SolidPolygonLayer({
          id: "wing-north",
          data: [{ contour: WING_NORTH }],
          extruded: true,
          wireframe: false,
          filled: true,
          getPolygon: (d: any) => d.contour,
          getElevation: () => 1400,
          getFillColor: [12, 24, 70, 235] as [number, number, number, number],
          material: { ambient: 0.18, diffuse: 0.55, shininess: 180, specularColor: [50, 120, 240] as [number, number, number] },
        }),
        new SolidPolygonLayer({
          id: "wing-south",
          data: [{ contour: WING_SOUTH }],
          extruded: true,
          wireframe: false,
          filled: true,
          getPolygon: (d: any) => d.contour,
          getElevation: () => 1400,
          getFillColor: [12, 24, 70, 235] as [number, number, number, number],
          material: { ambient: 0.18, diffuse: 0.55, shininess: 180, specularColor: [50, 120, 240] as [number, number, number] },
        }),
        new SolidPolygonLayer({
          id: "obs-deck-1",
          data: [{ contour: OBS_1 }],
          extruded: true,
          wireframe: false,
          filled: true,
          getPolygon: (d: any) => d.contour,
          getElevation: () => 1160,
          getFillColor: [22, 48, 110, 252] as [number, number, number, number],
          material: { ambient: 0.3, diffuse: 0.7, shininess: 300, specularColor: [100, 180, 255] as [number, number, number] },
        }),
        new SolidPolygonLayer({
          id: "obs-deck-2",
          data: [{ contour: OBS_2 }],
          extruded: true,
          wireframe: false,
          filled: true,
          getPolygon: (d: any) => d.contour,
          getElevation: () => 1380,
          getFillColor: [28, 58, 130, 252] as [number, number, number, number],
          material: { ambient: 0.3, diffuse: 0.7, shininess: 300, specularColor: [100, 180, 255] as [number, number, number] },
        }),
        new SolidPolygonLayer({
          id: "spire",
          data: [{ contour: SPIRE }],
          extruded: true,
          wireframe: false,
          filled: true,
          getPolygon: (d: any) => d.contour,
          getElevation: () => 2200,
          getFillColor: [40, 100, 220, 255] as [number, number, number, number],
          material: { ambient: 0.4, diffuse: 0.85, shininess: 500, specularColor: [140, 220, 255] as [number, number, number] },
        }),
      ];

      const map = new maplibregl.Map({
        container: containerRef.current!,
        style: {
          version: 8 as const,
          sources: {
            openmaptiles: {
              type: "vector" as const,
              url: "https://tiles.openfreemap.org/planet",
            },
          },
          layers: [
            { id: "background", type: "background" as const, paint: { "background-color": "#000205" } },
            { id: "water",      type: "fill" as const, source: "openmaptiles", "source-layer": "water",    paint: { "fill-color": "#00060d" } },
            { id: "landuse",    type: "fill" as const, source: "openmaptiles", "source-layer": "landuse",  paint: { "fill-color": "#020408" } },
            { id: "building-flat", type: "fill" as const, source: "openmaptiles", "source-layer": "building", paint: { "fill-color": "#03060e", "fill-outline-color": "#080f20" } },
            {
              id: "building-3d",
              type: "fill-extrusion" as const,
              source: "openmaptiles",
              "source-layer": "building",
              minzoom: 13,
              paint: {
                "fill-extrusion-color": [
                  "interpolate", ["linear"], ["get", "render_height"],
                  0,   "#04060f",
                  20,  "#05091a",
                  60,  "#060c20",
                  150, "#07102a",
                ] as maplibregl.ExpressionSpecification,
                "fill-extrusion-height": [
                  "interpolate", ["linear"], ["zoom"],
                  14, 0,
                  14.5, ["*", ["get", "render_height"], 1.6],
                ] as maplibregl.ExpressionSpecification,
                "fill-extrusion-base": ["get", "render_min_height"] as maplibregl.ExpressionSpecification,
                "fill-extrusion-opacity": 0.95,
              },
            },
            { id: "road-base",        type: "line" as const, source: "openmaptiles", "source-layer": "transportation", filter: ["in", ["get", "class"], ["literal", ["motorway","trunk","primary","secondary","tertiary","minor","service"]]] as maplibregl.FilterSpecification, paint: { "line-color": "#000000", "line-width": 2 } },
            { id: "glow-minor-outer", type: "line" as const, source: "openmaptiles", "source-layer": "transportation", filter: ["in", ["get", "class"], ["literal", ["minor","tertiary","service"]]] as maplibregl.FilterSpecification, paint: { "line-color": "#003388", "line-width": 6,   "line-blur": 8,  "line-opacity": 0.18 } },
            { id: "glow-minor-mid",   type: "line" as const, source: "openmaptiles", "source-layer": "transportation", filter: ["in", ["get", "class"], ["literal", ["minor","tertiary","service"]]] as maplibregl.FilterSpecification, paint: { "line-color": "#0055aa", "line-width": 1.5, "line-blur": 2,  "line-opacity": 0.35 } },
            { id: "glow-minor-core",  type: "line" as const, source: "openmaptiles", "source-layer": "transportation", filter: ["in", ["get", "class"], ["literal", ["minor","tertiary","service"]]] as maplibregl.FilterSpecification, paint: { "line-color": "#2277cc", "line-width": 0.6, "line-blur": 0,  "line-opacity": 0.55 } },
            { id: "glow-sec-outer",   type: "line" as const, source: "openmaptiles", "source-layer": "transportation", filter: ["==", ["get", "class"], "secondary"] as maplibregl.FilterSpecification, paint: { "line-color": "#004499", "line-width": 10,  "line-blur": 10, "line-opacity": 0.28 } },
            { id: "glow-sec-mid",     type: "line" as const, source: "openmaptiles", "source-layer": "transportation", filter: ["==", ["get", "class"], "secondary"] as maplibregl.FilterSpecification, paint: { "line-color": "#0066bb", "line-width": 3,   "line-blur": 4,  "line-opacity": 0.5  } },
            { id: "glow-sec-core",    type: "line" as const, source: "openmaptiles", "source-layer": "transportation", filter: ["==", ["get", "class"], "secondary"] as maplibregl.FilterSpecification, paint: { "line-color": "#88ccff", "line-width": 0.8, "line-blur": 0,  "line-opacity": 0.85 } },
            { id: "glow-pri-outer",   type: "line" as const, source: "openmaptiles", "source-layer": "transportation", filter: ["==", ["get", "class"], "primary"]   as maplibregl.FilterSpecification, paint: { "line-color": "#0055bb", "line-width": 14,  "line-blur": 12, "line-opacity": 0.32 } },
            { id: "glow-pri-mid",     type: "line" as const, source: "openmaptiles", "source-layer": "transportation", filter: ["==", ["get", "class"], "primary"]   as maplibregl.FilterSpecification, paint: { "line-color": "#0077dd", "line-width": 4,   "line-blur": 5,  "line-opacity": 0.6  } },
            { id: "glow-pri-core",    type: "line" as const, source: "openmaptiles", "source-layer": "transportation", filter: ["==", ["get", "class"], "primary"]   as maplibregl.FilterSpecification, paint: { "line-color": "#aaddff", "line-width": 1,   "line-blur": 0,  "line-opacity": 1    } },
            { id: "glow-mway-outer",  type: "line" as const, source: "openmaptiles", "source-layer": "transportation", filter: ["in", ["get", "class"], ["literal", ["motorway","trunk"]]] as maplibregl.FilterSpecification, paint: { "line-color": "#0066cc", "line-width": 20,  "line-blur": 16, "line-opacity": 0.38 } },
            { id: "glow-mway-mid",    type: "line" as const, source: "openmaptiles", "source-layer": "transportation", filter: ["in", ["get", "class"], ["literal", ["motorway","trunk"]]] as maplibregl.FilterSpecification, paint: { "line-color": "#0088ee", "line-width": 5,   "line-blur": 6,  "line-opacity": 0.7  } },
            { id: "glow-mway-core",   type: "line" as const, source: "openmaptiles", "source-layer": "transportation", filter: ["in", ["get", "class"], ["literal", ["motorway","trunk"]]] as maplibregl.FilterSpecification, paint: { "line-color": "#cceeff", "line-width": 1.2, "line-blur": 0,  "line-opacity": 1    } },
          ],
        },
        center: CENTER,
        zoom: 14.8,
        minZoom: 12,
        maxZoom: 18,
        pitch: 60,
        bearing: -20,
        attributionControl: false,
        interactive: true,
        dragPan: true,
        dragRotate: true,
        scrollZoom: true,
        boxZoom: false,
        keyboard: true,
        doubleClickZoom: true,
        touchZoomRotate: true,
        touchPitch: true,
        fadeDuration: 0,
      });

      map.getCanvas().style.setProperty("pointer-events", "auto", "important");

      map.on("load", async () => {
        if (destroyed) { map.remove(); return; }

        type OsmEl = { type: string; geometry: { lat: number; lon: number }[]; tags?: Record<string, string> };
        try {
          const res  = await fetch(`https://overpass-api.de/api/interpreter?data=[out:json];way["building"](${CENTER[1]-LIMIT},${CENTER[0]-LIMIT},${CENTER[1]+LIMIT},${CENTER[0]+LIMIT});out geom;`);
          const json = await res.json();
          (json.elements as OsmEl[]).filter(e => e.type === "way" && e.geometry?.length > 2);
        } catch (_) {}

        if (destroyed) { map.remove(); return; }

        const overlay = new MapboxOverlay({ interleaved: true, layers });
        map.addControl(overlay as unknown as maplibregl.IControl);
        deckRef.current = overlay;
        map.getCanvas().style.setProperty("pointer-events", "auto", "important");
        setLoaded(true);
      });

      map.on("idle", () => {
        if (!destroyed) map.getCanvas().style.setProperty("pointer-events", "auto", "important");
      });

      const resizeObserver = new ResizeObserver(() => {
        if (!destroyed) map.resize();
      });
      if (containerRef.current) resizeObserver.observe(containerRef.current);

      mapRef.current = map;
      (mapRef.current as any)._resizeObserver = resizeObserver;
    });

    return () => {
      destroyed = true;
      (mapRef.current as any)?._resizeObserver?.disconnect();
      (deckRef.current as { finalize?: () => void })?.finalize?.();
      deckRef.current = null;
      (mapRef.current as { remove: () => void })?.remove();
      mapRef.current = null;
    };
  }, []);

  return (
    <div
      style={{ position: "relative", width: "100%", height: "100%", cursor: "grab", touchAction: "pan-x pan-y" }}
      onMouseDown={e => e.stopPropagation()}
      onTouchStart={e => e.stopPropagation()}
      onMouseMove={e => e.stopPropagation()}
      onTouchMove={e => e.stopPropagation()}
      onWheel={e => e.stopPropagation()}
    >
      {!loaded && <div className={styles.mapSkeleton} />}
      <div
        ref={containerRef}
        style={{ width: "100%", height: "100%", opacity: loaded ? 1 : 0, transition: "opacity 0.6s ease" }}
      />
    </div>
  );
}