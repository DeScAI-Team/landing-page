import { useEffect, useRef, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Team from "./Team";

// ─── True 3D spherical orbit ────────────────────────────────────────────────
// Each node lives on a sphere. We rotate the sphere in 3D (two-axis tilt),
// then project to 2D. This ensures nodes genuinely orbit around the center
// in 3D space — they pass clearly IN FRONT and BEHIND the center node.

const NODES = [
  {
    id: "descai-model",
    label: "DePin Hosting",
    tag: "INFERENCE",
    // spherical coords: theta (longitude), phi (latitude inclination from equator)
    theta0: 0,
    phi0: 0,  // all on same plane for consistent orbit
    description: "Our agent relies on on-chain inference hosted via Akash Network, a decentralized compute network, to provide sovereign, censorship-resistant review generation and claim validation. An inference on demand model combined with our MoE architecture allows for hyper-low overhead and completely autonomous opperation through agent triggered model deployments. No centralized API creates a single point of failure and frees our agent from the whims of big labs. Thank you to Akash network for providing initial integration support.",
    tech: ["Akash Network", "DeScAi-v1.0", "Mixtral"],
  },
  {
    id: "crawler",
    label: "DeScAi Crawler",
    tag: "INGESTION",
    theta0: 90,
    phi0: 0,
    description: "Our autonomous crawler deployed periodically via an Akash Network container caputes and indexes DeSci snapshots including papers, preprints, and protocol documentation, blog/social posts, funding information, and more. It cleans and writes this data to the DKG as structured knowledge assets. The crawler currently covers ResearchHub, Molecule, BioDao, and Pump.Science, and we are always looking to expand it to further platforms. Thank you to Molecule for providing initial integration support.",
    tech: ["Scrapy / Playwright", "NLP Pipeline", "DKG Writer"],
  },
  {
    id: "drag-node",
    label: "dRAG Network",
    tag: "KNOWLEDGE",
    theta0: 180,
    phi0: 0,
    description: "Our agent utilizes the decentralized RAG integrations offered via OriginTrail's Decentralized Knowledge Graph. The DKG is as an on-chain knowledge graph we use to store verifiable DeSci content collected by our crawler, as well as other DeSci content uploaded to the graph. The DeScAi agent queries the dkg whenever suffiecient new content is collected to extract and verify new claims. This system allows for transparent and publicly verifiable citation of all material seen by the agent.",
    tech: ["OriginTrail DKG Edge Node", "DeSci Graph", "RDF/OWL"],
  },
  {
    id: "permaweb",
    label: "PermaWeb",
    tag: "PERMANENCE",
    theta0: 270,
    phi0: 0,
    description: "Every review is immutably written to the Arweave PermaWeb using the AR.IO Turbo SDK. No revisions without record, no takedowns, no tampering. The scientific record stays open and permanent. The agent is able to upload reviews autonomously while the blog pulls them straight from the block-weave. Special thank you to AR.IO for providing initial integration support.",
    tech: ["Arweave Turbo SDK", "PermaWeb"],
  },
];

const CENTER_NODE = {
  id: "agent-blog",
  label: "Agent Blog",
  tag: "LIVE",
  description: "The public face of the DeScAi agent, generated reviews are pulled directly from the Permaweb and published here entirely without human intervention. Each post is a structured review of a DeSci paper or project written autonomously by the agent based on verifiable DKG content. Other information including aggregated DeSci token data and project relationships also displayed here.",
  tech: ["Agent Output", "Arweave Read", "DKG Verified"],
};

// ─── 3D math ─────────────────────────────────────────────────────────────────
// Orbit: rotate a point on a sphere of radius R.
// We tilt the orbit plane by TILT_X and TILT_Z so the orbit is clearly 3D.
// Then animate theta (longitude) over time.
const R = 340;           // orbit radius - scaled up 30%
const TILT_X = 65;       // deg — MUCH steeper tilt for tall vertical orbit
const TILT_Z =15;        // reduced secondary tilt
const SPEED = 10;        // deg/sec - slightly slower for more fluid motion

function rotX(v, a) {
  const c = Math.cos(a), s = Math.sin(a);
  return [v[0], v[1]*c - v[2]*s, v[1]*s + v[2]*c];
}
function rotZ(v, a) {
  const c = Math.cos(a), s = Math.sin(a);
  return [v[0]*c - v[1]*s, v[0]*s + v[1]*c, v[2]];
}

function get3DPos(theta0, phi0, elapsed) {
  const t = ((theta0 + elapsed * SPEED) % 360) * Math.PI / 180;
  const p = phi0 * Math.PI / 180;
  // point on sphere
  let v = [
    R * Math.cos(p) * Math.cos(t),
    R * Math.cos(p) * Math.sin(t),
    R * Math.sin(p),
  ];
  v = rotX(v, TILT_X * Math.PI / 180);
  v = rotZ(v, TILT_Z * Math.PI / 180);
  return { x: v[0], y: v[1], z: v[2] };
}

// ─── Node panel ───────────────────────────────────────────────────────────────
function NodePanel({ node, onClose }) {
  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 1000,
      display: "flex", alignItems: "center", justifyContent: "center",
      background: "rgba(5,3,12,0.65)",
      backdropFilter: "blur(6px)",
      WebkitBackdropFilter: "blur(6px)",
      animation: "pFade 0.18s ease",
    }}>
      {/* Outer border container */}
      <div onClick={e => e.stopPropagation()} style={{
        position: "relative",
        maxWidth: 680, width: "92vw",
        animation: "pSlide 0.26s cubic-bezier(0.16,1,0.3,1) both",
      }}>
        {/* Title bar in top-left - positioned at container level */}
        <div style={{
          position: "absolute",
          top: 20, left: 30,
          height: 42,
          width: 314,
          background: "linear-gradient(135deg, rgba(80,100,140,0.4) 0%, rgba(60,80,120,0.5) 100%), #06040f",
          borderRadius: "0 0 2px 2px",
          padding: "8px 60px 8px 50px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "flex-start",
          zIndex: 50,
          boxShadow: "0 2px 12px rgba(80,100,140,0.3), 0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)",
        }}>
          <span style={{
            fontSize: 9, letterSpacing: 3.5,
            color: "rgba(140,180,220,0.5)",
            fontFamily: "'Courier New', monospace",
            textTransform: "uppercase",
            marginBottom: 3,
          }}>{node.tag}</span>
          <h2 style={{
            fontFamily: "'Courier New', monospace",
            fontWeight: 700, fontSize: 16,
            color: "rgba(200,220,255,0.95)",
            letterSpacing: 2,
            textTransform: "uppercase",
          }}>{node.label}</h2>
        </div>

        {/* Close button - positioned at container level */}
        <button onClick={onClose} style={{
          position: "absolute", top: 17, right: 17,
          background: "rgba(20,25,35,0.8)",
          border: "1px solid rgba(120,150,200,0.3)",
          color: "rgba(140,180,220,0.5)",
          width: 32, height: 32, borderRadius: 2,
          cursor: "pointer", fontSize: 14,
          fontFamily: "'Courier New', monospace",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "all 0.2s",
          zIndex: 60,
        }}
          onMouseEnter={e => { 
            e.currentTarget.style.borderColor = "rgba(140,180,220,0.7)"; 
            e.currentTarget.style.color = "rgba(200,220,255,0.95)";
            e.currentTarget.style.background = "rgba(40,60,90,0.6)";
          }}
          onMouseLeave={e => { 
            e.currentTarget.style.borderColor = "rgba(120,150,200,0.3)"; 
            e.currentTarget.style.color = "rgba(140,180,220,0.5)";
            e.currentTarget.style.background = "rgba(20,25,35,0.8)";
          }}
        >✕</button>

        {/* Main border frame */}
        <div style={{
          position: "relative",
          background: "linear-gradient(135deg, rgba(80,100,140,0.4) 0%, rgba(60,80,120,0.5) 100%)",
          border: "2px solid rgba(120,140,180,0.35)",
          borderRadius: 2,
          padding: 5,
          boxShadow: "0 0 40px rgba(80,100,140,0.12), 0 20px 60px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.08)",
        }}>
          {/* Corner accents */}
          <div style={{
            position: "absolute", top: -2, left: -2,
            width: 20, height: 20,
            borderTop: "3px solid rgba(140,180,220,0.6)",
            borderLeft: "3px solid rgba(140,180,220,0.6)",
          }} />
          <div style={{
            position: "absolute", top: -2, right: -2,
            width: 20, height: 20,
            borderTop: "3px solid rgba(140,180,220,0.6)",
            borderRight: "3px solid rgba(140,180,220,0.6)",
          }} />
          <div style={{
            position: "absolute", bottom: -2, left: -2,
            width: 20, height: 20,
            borderBottom: "3px solid rgba(140,180,220,0.6)",
            borderLeft: "3px solid rgba(140,180,220,0.6)",
          }} />
          <div style={{
            position: "absolute", bottom: -2, right: -2,
            width: 20, height: 20,
            borderBottom: "3px solid rgba(140,180,220,0.6)",
            borderRight: "3px solid rgba(140,180,220,0.6)",
          }} />

          {/* Accent layer */}
          <div style={{
            position: "relative",
            background: "rgba(10,15,25,0.85)",
            border: "2px solid rgba(80,100,140,0.25)",
            borderRadius: 1,
            padding: 3,
          }}>
            {/* Inner content area */}
            <div style={{
              position: "relative",
              background: "rgba(8,10,18,0.92)",
              border: "2px solid rgba(60,80,120,0.2)",
              borderRadius: 1,
              padding: "56px 48px 42px",
              minHeight: 420,
              zIndex: 1,
            }}>
              {/* Description */}
              <p style={{
                fontFamily: "Georgia, serif",
                fontSize: 15, lineHeight: 1.85,
                color: "rgba(180,200,230,0.75)",
                marginBottom: 18,
                textAlign: "justify",
              }}>{node.description}</p>

              {/* Extended description */}
              <p style={{
                fontFamily: "Georgia, serif",
                fontSize: 14, lineHeight: 1.8,
                color: "rgba(160,180,210,0.65)",
                marginBottom: 36,
                textAlign: "justify",
              }}>
                Each component within the DeScAi agentic architecture is built on top of decentralized protocols built for resilience and transparency. Please check our documentation for more details on how we enable and maintain verifiable operations across this distributed system architecture.
              </p>

              {/* Additional details section */}
              <div style={{
                background: "rgba(20,30,50,0.4)",
                border: "1px solid rgba(80,100,140,0.2)",
                borderRadius: 2,
                padding: "18px 22px",
                marginBottom: 28,
              }}>
                <span style={{
                  display: "block",
                  fontSize: 9, letterSpacing: 3,
                  color: "rgba(120,150,200,0.5)",
                  fontFamily: "'Courier New', monospace",
                  marginBottom: 12,
                  textTransform: "uppercase",
                }}>System Components</span>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {node.tech.map(t => (
                    <span key={t} style={{
                      fontSize: 10,
                      fontFamily: "'Courier New', monospace",
                      letterSpacing: 1.2,
                      color: "rgba(160,190,220,0.7)",
                      background: "rgba(40,60,100,0.3)",
                      border: "1px solid rgba(100,130,180,0.25)",
                      padding: "6px 14px", borderRadius: 2,
                    }}>{t}</span>
                  ))}
                </div>
              </div>

              {/* Status indicator */}
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                fontSize: 10,
                fontFamily: "'Courier New', monospace",
                letterSpacing: 2,
                color: "rgba(100,200,150,0.7)",
                textTransform: "uppercase",
              }}>
                <div style={{
                  width: 6, height: 6,
                  borderRadius: "50%",
                  background: "rgba(100,200,150,0.8)",
                  boxShadow: "0 0 8px rgba(100,200,150,0.5)",
                  animation: "blinkLive 2s ease-in-out infinite",
                }} />
                In Development 
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Orbital 3D system ────────────────────────────────────────────────────────
function OrbitalSystem({ onNodeClick }) {
  const [elapsed, setElapsed] = useState(0);
  const rafRef = useRef(null);
  const t0 = useRef(null);
  
  // Generate stars once on mount
  const stars = useRef(
    Array.from({ length: 150 }, () => ({
      x: Math.random() * 1350,
      y: Math.random() * 780,
      size: Math.random() * 1.5 + 0.3,
      opacity: Math.random() * 0.4 + 0.1,
      twinkleSpeed: Math.random() * 2 + 1,
      twinkleOffset: Math.random() * Math.PI * 2,
    }))
  ).current;

  useEffect(() => {
    const loop = ts => {
      if (!t0.current) t0.current = ts;
      setElapsed((ts - t0.current) / 1000);
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const W = 1350, H = 780;
  const CX = W / 2, CY = H / 2;
  const CENTER_R = 115;

  // Compute all node positions using same projection as orbit path
  const withPos = NODES.map(n => {
    const p = get3DPos(n.theta0, n.phi0, elapsed);
    // Use EXACT same perspective projection as orbit path
    const fov = 700;
    const pz = fov / (fov - p.z * 0.5);
    const sx = CX + p.x * pz;
    const sy = CY + p.y * pz;
    const nodeScale = 0.55 + pz * 0.45;
    return { ...n, p3: p, sx, sy, nodeScale, pz, z: p.z };
  });

  // Sort back-to-front for proper occlusion
  const sorted = [...withPos].sort((a, b) => a.z - b.z);
  // center z=0, so nodes with z>0 are in front of center
  const centerZ = 0;

  // Build orbit ellipse by sampling the orbit path in 3D
  const orbitPath = Array.from({ length: 240 }, (_, i) => {
    const t = (i / 240) * 360;
    const phi = 0; // all on same plane
    const ta = t * Math.PI / 180;
    let v = [R * Math.cos(ta), R * Math.sin(ta), 0];
    v = rotX(v, TILT_X * Math.PI / 180);
    v = rotZ(v, TILT_Z * Math.PI / 180);
    const fov = 700;
    const pz2 = fov / (fov - v[2] * 0.5);
    return [CX + v[0] * pz2, CY + v[1] * pz2, v[2]];
  });

  const pathD = orbitPath.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ") + " Z";

  // 6 travel dots on the orbit with smooth interpolation
  const travelDots = Array.from({ length: 6 }, (_, i) => {
    const frac = ((elapsed * SPEED / 360) + i / 6) % 1;
    const idx = frac * orbitPath.length;
    const idx0 = Math.floor(idx);
    const idx1 = (idx0 + 1) % orbitPath.length;
    const t = idx - idx0; // interpolation factor
    
    const pt0 = orbitPath[idx0] || orbitPath[0];
    const pt1 = orbitPath[idx1] || orbitPath[0];
    
    // Smooth interpolation between points
    const x = pt0[0] + (pt1[0] - pt0[0]) * t;
    const y = pt0[1] + (pt1[1] - pt0[1]) * t;
    const depth = pt0[2] + (pt1[2] - pt0[2]) * t;
    
    const depthFactor = (depth + R) / (2 * R);
    const opacity = 0.08 + depthFactor * 0.5;
    const size = 1.2 + depthFactor * 1.2;
    
    return { x, y, opacity, size };
  });

  // Center pulse
  const cp = 1 + Math.sin(elapsed * 2.2) * 0.025;

  return (
    <div style={{ position: "relative", width: W, height: H }}>
      {/* SVG: stars + orbit ring + travel dots (behind everything) */}
      <svg width={W} height={H} style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none", zIndex: 1 }}>
        <defs>
          <filter id="fglow">
            <feGaussianBlur stdDeviation="2.5" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="starglow">
            <feGaussianBlur stdDeviation="0.8" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Twinkling stars */}
        {stars.map((star, i) => {
          const twinkle = Math.sin(elapsed * star.twinkleSpeed + star.twinkleOffset) * 0.5 + 0.5;
          const finalOpacity = star.opacity * (0.3 + twinkle * 0.7);
          return (
            <circle
              key={i}
              cx={star.x}
              cy={star.y}
              r={star.size}
              fill="rgba(255,255,255,0.9)"
              opacity={finalOpacity}
              filter="url(#starglow)"
            />
          );
        })}

        {/* Orbit ring — dashed, very subtle */}
        <path d={pathD} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
        <path d={pathD} fill="none" stroke="rgba(255,255,255,0.12)"
          strokeWidth="0.6" strokeDasharray="6 20"
          strokeDashoffset={-(elapsed * 40)}
        />

        {/* Travel dots */}
        {travelDots.map((d, i) => (
          <circle key={i} cx={d.x} cy={d.y} r={d.size}
            fill="rgba(255,255,255,0.95)" opacity={d.opacity}
            filter="url(#fglow)"
          />
        ))}
      </svg>

      {/* SVG: connection lines (above center ball) */}
      <svg width={W} height={H} style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none", zIndex: 110 }}>
        {/* Connector lines — drawn above center ball */}
        {sorted.map(node => {
          // Calculate line start point between center and edge (60% of radius)
          const dx = node.sx - CX;
          const dy = node.sy - CY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const x1 = CX + (dx / dist) * (CENTER_R * 0.6);
          const y1 = CY + (dy / dist) * (CENTER_R * 0.6);
          
          // Smooth opacity based on depth: 0 at back (-R), 0.8 at front (+R)
          const depthFactor = (node.z + R) / (2 * R); // 0 to 1
          const lineOpacity = depthFactor * 0.8; // 0 to 0.8
          const lineWidth = 0.8 + depthFactor * 0.6; // 0.8 to 1.4
          
          return (
            <line key={node.id + "-l"}
              x1={x1} y1={y1}
              x2={node.sx} y2={node.sy}
              stroke="rgba(255,255,255,1)"
              strokeWidth={lineWidth}
              strokeDasharray="4 8"
              opacity={lineOpacity}
              style={{ transition: 'opacity 0.3s ease-out, stroke-width 0.3s ease-out' }}
            />
          );
        })}
      </svg>

      {/* ── Nodes: rendered in back-to-front z-order ── */}
      {sorted.map(node => {
        const isBehind = node.z < centerZ;
        // Set minimum size to prevent text resizing, scale up by 30%
        const minSize = 110;
        const maxSize = 145;
        const scaledSize = 124 * node.nodeScale; // base size scaled up 30%
        const sz = Math.max(minSize, Math.min(maxSize, Math.round(scaledSize)));
        
        // Smooth depth-based lighting (0 = back, 1 = front)
        const depthFactor = (node.z + R) / (2 * R); // 0 to 1
        const opacity = 0.35 + depthFactor * 0.6; // smooth gradient from 0.35 to 0.95
        const borderOpacity = 0.2 + depthFactor * 0.5; // 0.2 to 0.7
        // Linear glow: 5% at back to 90% at front
        const glowOpacity = 0.05 + depthFactor * 0.40; // linear: 0.05 to 0.45
        const glowSize = sz * (0.05 + depthFactor * 0.85); // linear: 5% to 90% of ball size

        // Nodes with z > CENTER_R * 0.3 are definitely in front — render above center
        // We'll handle center z-index explicitly
        const zIdx = isBehind ? Math.round(10 + (node.z + R) * 0.1) : Math.round(150 + node.z);

        return (
          <div key={node.id} onClick={() => onNodeClick(node)}
            style={{
              position: "absolute",
              left: node.sx - sz / 2,
              top: node.sy - sz / 2,
              width: sz, height: sz,
              borderRadius: "50%",
              background: `rgba(${12 + depthFactor * 4},${10 + depthFactor * 2},${22 + depthFactor * 6},${0.7 + depthFactor * 0.22})`,
              border: `1px solid rgba(255,255,255,${borderOpacity})`,
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              cursor: "pointer",
              opacity,
              zIndex: zIdx,
              boxShadow: `0 0 ${glowSize}px rgba(255,255,255,${glowOpacity}), 0 4px 24px rgba(0,0,0,${0.3 + depthFactor * 0.2})`,
              transition: "border-color 0.2s ease-out",
              backdropFilter: "blur(4px)",
              WebkitBackdropFilter: "blur(4px)",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.boxShadow = `0 0 ${glowSize + 20}px rgba(255,255,255,${Math.min(glowOpacity + 0.25, 0.5)}), 0 4px 24px rgba(0,0,0,0.5)`;
              e.currentTarget.style.borderColor = `rgba(255,255,255,${Math.min(borderOpacity + 0.3, 0.9)})`;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.boxShadow = `0 0 ${glowSize}px rgba(255,255,255,${glowOpacity}), 0 4px 24px rgba(0,0,0,${0.3 + depthFactor * 0.2})`;
              e.currentTarget.style.borderColor = `rgba(255,255,255,${borderOpacity})`;
            }}
          >
            <div style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}>
              {node.label.split(' ').map((word, i) => (
                <span key={i} style={{
                  color: "rgba(255,255,255,0.9)",
                  fontSize: 13,
                  fontFamily: "'Courier New', monospace",
                  fontWeight: 700,
                  textAlign: "center",
                  lineHeight: 1.15,
                  letterSpacing: 0.4,
                  whiteSpace: "nowrap",
                }}>{word}</span>
              ))}
              <span style={{
                color: "rgba(255,255,255,0.3)",
                fontSize: 9.5,
                fontFamily: "'Courier New', monospace",
                letterSpacing: 1.8,
                marginTop: 5,
                whiteSpace: "nowrap",
              }}>{node.tag}</span>
            </div>
          </div>
        );
      })}

      {/* ── Center node — z-index sits between back and front nodes ── */}
      <div onClick={() => onNodeClick(CENTER_NODE)}
        style={{
          position: "absolute",
          left: CX - CENTER_R, top: CY - CENTER_R,
          width: CENTER_R * 2, height: CENTER_R * 2,
          borderRadius: "50%",
          background: "radial-gradient(circle at 40% 35%, rgba(255,255,255,0.06) 0%, rgba(10,8,20,0.98) 70%)",
          border: "1px solid rgba(255,255,255,0.3)",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          cursor: "pointer",
          zIndex: 100,   // middle — front nodes (zIdx 150+) render above it
          boxShadow: `0 0 ${52 * cp}px rgba(255,255,255,0.08), 0 0 ${104 * cp}px rgba(180,100,255,0.06), 0 8px 32px rgba(0,0,0,0.6)`,
          transform: `scale(${cp})`,
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          transition: "box-shadow 0.15s",
        }}
        onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 0 50px rgba(255,255,255,0.18), 0 8px 32px rgba(0,0,0,0.6)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.55)"; }}
        onMouseLeave={e => { e.currentTarget.style.boxShadow = `0 0 ${52 * cp}px rgba(255,255,255,0.08), 0 8px 32px rgba(0,0,0,0.6)`; e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)"; }}
      >
        <span style={{
          color: "#fff", fontSize: 17,
          fontFamily: "'Courier New', monospace",
          fontWeight: 700, letterSpacing: 1.5,
          textAlign: "center",
        }}>Agent{"\n"}Blog</span>
        <span style={{
          color: "rgb(199, 27, 27)",
          fontSize: 12,
          fontFamily: "'Courier New', monospace",
          letterSpacing: 3, marginTop: 7,
          animation: "blinkLive 2.8s ease-in-out infinite",
        }}>● Coming Soon</span>
      </div>
    </div>
  );
}

// ─── Landing page ─────────────────────────────────────────────────────────────
function LandingPage() {
  const [activeNode, setActiveNode] = useState(null);

  return (
    <div style={{ background: "#06040f", minHeight: "100vh", color: "#fff", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=Syne+Mono&family=Figtree:wght@400;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }

        @keyframes pFade { from{opacity:0} to{opacity:1} }
        @keyframes pSlide {
          from{opacity:0;transform:translateY(20px) scale(0.97)}
          to{opacity:1;transform:translateY(0) scale(1)}
        }
        @keyframes blinkLive { 0%,100%{opacity:1} 50%{opacity:0.2} }
        @keyframes fadeUp {
          from{opacity:0;transform:translateY(16px)}
          to{opacity:1;transform:translateY(0)}
        }
        @keyframes scrollDrop {
          0%,100%{opacity:0.3;transform:translateY(0)}
          50%{opacity:0.7;transform:translateY(6px)}
        }
        @keyframes holoShift {
          0% { background-position: 200% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes infiniteScroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-16.666%); }
        }

        body { font-family: 'Syne', sans-serif; }

        .fcard {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 4px;
          padding: 24px 22px;
          cursor: pointer;
          transition: background 0.2s, border-color 0.2s;
        }
        .fcard:hover {
          background: rgba(255,255,255,0.04);
          border-color: rgba(255,255,255,0.14);
        }
      `}</style>

      {/* ── Background ── */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        {/* Very subtle, single radial — no cheap multi-color explosions */}
        <div style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(ellipse 80% 60% at 50% 20%, rgba(80,30,120,0.14) 0%, transparent 70%)",
        }} />
        <div style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(ellipse 50% 50% at 50% 60%, rgba(180,60,80,0.06) 0%, transparent 65%)",
        }} />
      </div>

      {/* ── Floating Blog Link ── */}
      <a href="#" style={{
        position: "fixed",
        top: 24,
        right: 48,
        zIndex: 10,
        color: "rgba(255,255,255,0.35)",
        fontFamily: "'Syne Mono', monospace",
        fontSize: 11,
        letterSpacing: 2,
        textDecoration: "none",
        textTransform: "uppercase",
        transition: "color 0.15s",
      }}
        onMouseEnter={e => e.currentTarget.style.color = "rgba(255,255,255,0.8)"}
        onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.35)"}
      >Blog</a>

      {/* ── Hero ── */}
      <section style={{
        position: "relative", zIndex: 1,
        minHeight: "100vh",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        paddingTop: 0, paddingBottom: 48,
      }}>
        {/* Title — clean, consistent font */}
        <div style={{ textAlign: "center", animation: "fadeUp 0.8s cubic-bezier(0.16,1,0.3,1) both", position: "relative", zIndex: 150 }}>
          <h1 style={{
            fontFamily: "SFMono-Regular, Consolas, \"Liberation Mono\", monospace",
            fontWeight: 800,
            fontSize: "clamp(100px, 16vw, 180px)",
            letterSpacing: "-0.02em",
            lineHeight: 1,
            background: "linear-gradient(90deg, rgba(180,100,255,0.9) 0%, #fff 25%, rgba(100,200,255,0.9) 50%, #fff 75%, rgba(180,100,255,0.9) 100%)",
            backgroundSize: "200% 100%",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            animation: "holoShift 12s linear infinite",
            filter: "drop-shadow(0 0 40px rgba(255,255,255,0.2)) drop-shadow(0 4px 20px rgba(0,0,0,0.4))",
            marginBottom: -20,
            marginTop: 30,
          }}>
            DeScAi
          </h1>
        </div>

        {/* Orbital diagram */}
        <div style={{
          marginTop: -120,
          animation: "fadeUp 1s cubic-bezier(0.16,1,0.3,1) 0.15s both",
        }}>
          <OrbitalSystem onNodeClick={setActiveNode} />
        </div>

        {/* Tagline below orbital */}
        <p style={{
          fontFamily: "'Syne Mono', monospace",
          fontSize: 15, letterSpacing: 4,
          color: "rgba(255,255,255,0.28)",
          textTransform: "uppercase",
          animation: "fadeUp 0.8s ease 0.2s both",
          marginTop: -10,
        }}>
          Independent Review Agent For Decentralized Science
        </p>

        {/* Subline instruction */}
        <p style={{
          fontFamily: "'Syne Mono', monospace",
          fontSize: 12, letterSpacing: 2,
          color: "rgba(255,255,255,0.35)",
          animation: "fadeUp 0.8s ease 0.3s both",
          marginTop: 17,
        }}>
          Click orbitals or Scroll for more details
        </p>

        {/* Scroll hint */}
        <div 
          onClick={() => window.scrollBy({ top: window.innerHeight, behavior: 'smooth' })}
          style={{ 
            marginTop: 14, 
            animation: "scrollDrop 2.4s ease-in-out infinite", 
            fontSize: "30px",
            cursor: "pointer",
            transition: "transform 0.2s, opacity 0.2s"
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = "scale(1.15)";
            e.currentTarget.style.opacity = "1";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.opacity = "0.7";
          }}
        >
          <svg width="32" height="48" viewBox="0 0 12 20" fill="none">
            <path d="M1 9l5 7 5-7" stroke="rgba(255,255,255,0.65)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </section>

      {/* ── How it works — three-panel display ── */}
      <section style={{
        position: "relative", zIndex: 1,
        maxWidth: 1000, margin: "0 auto",
        padding: "60px 32px",
      }}>
        <div style={{ marginBottom: 40, textAlign: "center" }}>
          <span style={{
            display: "block",
            fontFamily: "'Syne Mono', monospace",
            fontSize: 10, letterSpacing: 5,
            color: "rgba(255,255,255,0.25)",
            marginBottom: 12,
          }}>HOW IT WORKS</span>
          <h2 style={{
            fontFamily: "'Syne', sans-serif",
            fontWeight: 700, fontSize: 28,
            color: "#fff", letterSpacing: -0.3,
          }}>Our infrastructure</h2>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 28,
        }}>
          {[
            {
              title: "Our Agent",
              icon: (
                <svg width="64" height="64" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="8" y="6" width="32" height="26" rx="3" stroke="rgba(180,140,255,0.8)" strokeWidth="1.5" fill="none" />
                  <path d="M18 20h12M18 16h8" stroke="rgba(180,140,255,0.6)" strokeWidth="1.2" strokeLinecap="round" />
                  <circle cx="15" cy="16" r="2" fill="rgba(180,140,255,0.6)" />
                  <path d="M16 32v4M32 32v4M12 36h24" stroke="rgba(180,140,255,0.5)" strokeWidth="1.2" strokeLinecap="round" />
                  <circle cx="24" cy="42" r="2.5" stroke="rgba(180,140,255,0.6)" strokeWidth="1" fill="none" />
                  <path d="M22 42h4" stroke="rgba(180,140,255,0.5)" strokeWidth="0.8" />
                </svg>
              ),
              description: "Fully utonomous AI-Agent that collects, analyzes, and reviews DeSci material include research, posts, funding information, and more to produce comprehensive claim anlasyes posted immutably on-chain.",
              link: "https://descai.gitbook.io/descai-docs/",
              linkLabel: "See Documentation",
            },
            {
              title: "Our Model",
              icon: (
                <svg width="64" height="64" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="24" cy="14" r="5" stroke="rgba(100,200,255,0.8)" strokeWidth="1.5" fill="none" />
                  <circle cx="12" cy="30" r="4" stroke="rgba(100,200,255,0.6)" strokeWidth="1.2" fill="none" />
                  <circle cx="36" cy="30" r="4" stroke="rgba(100,200,255,0.6)" strokeWidth="1.2" fill="none" />
                  <circle cx="24" cy="40" r="3.5" stroke="rgba(100,200,255,0.6)" strokeWidth="1.2" fill="none" />
                  <line x1="24" y1="19" x2="14" y2="27" stroke="rgba(100,200,255,0.4)" strokeWidth="1" />
                  <line x1="24" y1="19" x2="34" y2="27" stroke="rgba(100,200,255,0.4)" strokeWidth="1" />
                  <line x1="14" y1="33" x2="22" y2="38" stroke="rgba(100,200,255,0.35)" strokeWidth="1" />
                  <line x1="34" y1="33" x2="26" y2="38" stroke="rgba(100,200,255,0.35)" strokeWidth="1" />
                </svg>
              ),
              description: "Domain-trained on a ~40 Billion token publicly accessible dataset of high-quality scientific material, our model is able to effectively evaluate scientific claims and produce transparent, contextually relevant reviews.",
              link: "https://huggingface.co/DeScAi",
              linkLabel: "Use our model",
            },
            {
              title: "Our Team",
              icon: (
                <svg width="64" height="64" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="24" cy="14" r="5.5" stroke="rgba(100,220,160,0.8)" strokeWidth="1.5" fill="none" />
                  <path d="M14 34c0-5.5 4.5-10 10-10s10 4.5 10 10" stroke="rgba(100,220,160,0.6)" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                  <circle cx="38" cy="18" r="4" stroke="rgba(100,220,160,0.5)" strokeWidth="1.2" fill="none" />
                  <path d="M42 36c0-4-2.8-7-6-7" stroke="rgba(100,220,160,0.4)" strokeWidth="1.2" strokeLinecap="round" fill="none" />
                  <circle cx="10" cy="18" r="4" stroke="rgba(100,220,160,0.5)" strokeWidth="1.2" fill="none" />
                  <path d="M6 36c0-4 2.8-7 6-7" stroke="rgba(100,220,160,0.4)" strokeWidth="1.2" strokeLinecap="round" fill="none" />
                </svg>
              ),
              description: "Based in the Stony Brook University Blockchain Business Lab, our interdisplinary and international team of web3 developers, ML researchers, and data scientists who make this work possible.",
              link: "/team",
              linkLabel: "Learn More",
            },
          ].map((panel, i) => (
            <div key={panel.title} style={{
              position: "relative",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 4,
              padding: "36px 24px 28px",
              animation: `fadeUp 0.5s ease ${i * 0.1}s both`,
              transition: "background 0.2s, border-color 0.2s",
              cursor: "default",
              height: "100%",
            }}
              onMouseEnter={e => {
                e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.14)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = "rgba(255,255,255,0.02)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
              }}
            >
              {/* Icon */}
              <div style={{
                marginBottom: 24,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: 72,
              }}>
                {panel.icon}
              </div>

              {/* Title */}
              <h3 style={{
                fontFamily: "'Syne', sans-serif",
                fontWeight: 700,
                fontSize: 16,
                color: "#fff",
                letterSpacing: 0.2,
                marginBottom: 16,
                textAlign: "center",
              }}>{panel.title}</h3>

              {/* Description text */}
              <p style={{
                fontFamily: "Georgia, serif",
                fontSize: 13,
                lineHeight: 1.68,
                color: "rgba(255,255,255,0.45)",
                textAlign: "center",
                marginBottom: 28,
                flex: "1 1 auto",
              }}>{panel.description}</p>

              {/* Link button */}
              {panel.link.startsWith('/') ? (
                <Link to={panel.link} style={{
                  fontFamily: "'Syne Mono', monospace",
                  fontSize: 9,
                  letterSpacing: 2.5,
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.4)",
                  textDecoration: "none",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 3,
                  padding: "10px 22px",
                  transition: "all 0.15s",
                  display: "inline-block",
                }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)";
                    e.currentTarget.style.color = "rgba(255,255,255,0.75)";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                    e.currentTarget.style.color = "rgba(255,255,255,0.4)";
                  }}
                >{panel.linkLabel} →</Link>
              ) : (
                <a href={panel.link} style={{
                  fontFamily: "'Syne Mono', monospace",
                  fontSize: 9,
                  letterSpacing: 2.5,
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.4)",
                  textDecoration: "none",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 3,
                  padding: "10px 22px",
                  transition: "all 0.15s",
                }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)";
                    e.currentTarget.style.color = "rgba(255,255,255,0.75)";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                    e.currentTarget.style.color = "rgba(255,255,255,0.4)";
                  }}
                >{panel.linkLabel} →</a>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── Supported By Carousel ── */}
      <section style={{
        position: "relative", zIndex: 1,
        padding: "30px 0",
        overflow: "hidden",
      }}>
        <span style={{
          display: "block",
          fontFamily: "'Syne Mono', monospace",
          fontSize: 10, letterSpacing: 5,
          color: "rgba(255,255,255,0.25)",
          marginBottom: 24,
          textAlign: "center",
        }}>SUPPORTED BY</span>

        <div style={{
          position: "relative",
          height: 50,
          maxWidth: 900,
          margin: "0 auto",
          overflow: "hidden",
        }}>
          {/* Left fade */}
          <div style={{
            position: "absolute", left: 0, top: 0, bottom: 0,
            width: 150, zIndex: 2,
            background: "linear-gradient(90deg, #06040f 0%, transparent 100%)",
            pointerEvents: "none",
          }} />

          {/* Right fade */}
          <div style={{
            position: "absolute", right: 0, top: 0, bottom: 0,
            width: 150, zIndex: 2,
            background: "linear-gradient(270deg, #06040f 0%, transparent 100%)",
            pointerEvents: "none",
          }} />

          {/* Carousel wrapper */}
          <div style={{
            display: "flex",
            animation: "infiniteScroll 12s linear infinite",
          }}>
            {/* Repeat content multiple times for seamless loop */}
            {[...Array(6)].map((_, idx) => (
              <div key={idx} style={{
                display: "flex",
                gap: 100,
                paddingRight: 100,
                flexShrink: 0,
              }}>
                {["Akash Network", "AR.IO", "Molecule.XYZ"].map((name) => (
                  <span key={name + idx} style={{
                    fontFamily: "'Syne Mono', monospace",
                    fontSize: 18,
                    fontWeight: 700,
                    letterSpacing: 1,
                    color: "rgba(255,255,255,0.35)",
                    textTransform: "uppercase",
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                  }}>
                    {name}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Quote ── */}
      <section style={{
        position: "relative", zIndex: 1,
        maxWidth: 620, margin: "0 auto",
        padding: "60px 32px 80px",
        textAlign: "center",
        borderTop: "1px solid rgba(255,255,255,0.05)",
      }}>
        <p style={{
          fontFamily: "Georgia, serif",
          fontStyle: "italic",
          fontSize: "clamp(15px, 2.2vw, 20px)",
          lineHeight: 1.8,
          color: "rgba(255,255,255,0.5)",
          marginBottom: 16,
        }}>
          "The scientific record is too important to be hidden behind paywalls and in ivory towers. Science should be open — not only for reading, but also for reusing."
        </p>
        <p style={{
          fontFamily: "'Syne Mono', monospace",
          fontSize: 11,
          letterSpacing: 1,
          color: "rgba(255,255,255,0.35)",
        }}>
          — Brian Armstrong, Co-founder of ResearchHub & CEO of Coinbase
        </p>
      </section>

      {/* ── CTA ── */}
      <section style={{
        position: "relative", zIndex: 1,
        padding: "40px 32px 72px",
        display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap",
      }}>
        {[
          { label: "Read Docs", primary: true, href: "https://descai.gitbook.io/descai-docs" },
          { label: "Explore the DKG", primary: false, href: "https://dkg.origintrail.io/explore?ual=did:dkg:base:8453/0xc28f310a87f7621a087a603e2ce41c22523f11d7/435" },
          { label: "X", primary: false, href: "https://x.com/DeScAiTeam" },
          { label: "GitHub", primary: false, href: "https://github.com/DeScAI-Team" },
        ].map(({ label, primary, href }) => (
          <a key={label} href={href} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
            <button style={{
              background: primary ? "rgba(255,255,255,0.9)" : "transparent",
              border: primary ? "none" : "1px solid rgba(255,255,255,0.12)",
              color: primary ? "#06040f" : "rgba(255,255,255,0.45)",
              fontFamily: "'Syne Mono', monospace",
              fontSize: 10, letterSpacing: 2.5,
              padding: "12px 24px", cursor: "pointer",
              borderRadius: 3, textTransform: "uppercase",
              transition: "all 0.15s",
            }}
              onMouseEnter={e => {
                if (primary) { e.currentTarget.style.background = "#fff"; }
                else { e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)"; e.currentTarget.style.color = "rgba(255,255,255,0.75)"; }
              }}
              onMouseLeave={e => {
                if (primary) { e.currentTarget.style.background = "rgba(255,255,255,0.9)"; }
                else { e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; e.currentTarget.style.color = "rgba(255,255,255,0.45)"; }
              }}
            >{label}</button>
          </a>
        ))}
      </section>

      {/* ── Footer ── */}
      <footer style={{
        position: "relative", zIndex: 1,
        borderTop: "1px solid rgba(255,255,255,0.05)",
        padding: "20px 48px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        flexWrap: "wrap", gap: 8,
      }}>
        <span style={{
          fontFamily: "'Syne Mono', monospace",
          fontSize: 10, letterSpacing: 1.5,
          color: "rgba(255,255,255,0.18)",
        }}>
          DeScAi · Stony Brook University · Blockchain Business Lab
        </span>
        <span style={{
          fontFamily: "'Syne Mono', monospace",
          fontSize: 9, letterSpacing: 2.5,
          color: "rgba(255,255,255,0.12)",
        }}>Akash · OriginTrail · Arweave</span>
      </footer>

      {/* Panel */}
      {activeNode && <NodePanel node={activeNode} onClose={() => setActiveNode(null)} />}
    </div>
  );
}

// ─── App Router ───────────────────────────────────────────────────────────────
export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/team" element={<Team />} />
      </Routes>
    </Router>
  );
}
