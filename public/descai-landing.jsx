import { useEffect, useRef, useState } from "react";

// ─── True 3D spherical orbit ────────────────────────────────────────────────
// Each node lives on a sphere. We rotate the sphere in 3D (two-axis tilt),
// then project to 2D. This ensures nodes genuinely orbit around the center
// in 3D space — they pass clearly IN FRONT and BEHIND the center node.

const NODES = [
  {
    id: "descai-model",
    label: "DeScAi Model",
    tag: "INFERENCE",
    // spherical coords: theta (longitude), phi (latitude inclination from equator)
    theta0: 0,
    phi0: 15,  // slightly above equator
    description: "On-chain LLM inference hosted via the Akash Network — decentralized GPU compute with sovereign, censorship-resistant inference on demand. No centralized API keys. Every review generation is fully reproducible.",
    tech: ["Akash Network", "LLaMA / Mistral", "On-Chain Compute"],
  },
  {
    id: "crawler",
    label: "DeScAi Crawler",
    tag: "INGESTION",
    theta0: 72,
    phi0: -20,
    description: "An autonomous crawler that continuously indexes DeSci papers, preprints, and protocol documentation — cleaning and writing structured knowledge into the Decentralized Knowledge Graph.",
    tech: ["Playwright", "NLP Pipeline", "Beautiful Soup"],
  },
  {
    id: "drag-node",
    label: "Inference",
    tag: "ON DEMAND",
    theta0: 144,
    phi0: 25,
    description: "Decentralized RAG via OriginTrail's DKG edge node. The on-chain knowledge graph stores verifiable scientific claims that DeScAi queries at inference time for grounded, citable reviews.",
    tech: ["OriginTrail DKG", "SPARQL", "Edge Node"],
  },
  {
    id: "permaweb",
    label: "PermaWeb",
    tag: "STORAGE",
    theta0: 216,
    phi0: -15,
    description: "Every review is immutably written to the Arweave PermaWeb. No revisions without record. No takedowns. The scientific record stays open and permanent — forever accessible.",
    tech: ["Arweave", "Bundlr / Irys", "Permanent Storage"],
  },
  {
    id: "webapp",
    label: "DeScAi Webapp",
    tag: "INTERFACE",
    theta0: 288,
    phi0: 10,
    description: "The frontend interface tying the entire protocol together — search reviews, explore project tokens, browse the agent blog, and interact with the knowledge graph from one decentralized app.",
    tech: ["React / Next.js", "Arweave Deploy", "Wallet Connect"],
  },
];

const CENTER_NODE = {
  id: "agent-blog",
  label: "Agent Blog",
  tag: "LIVE",
  description: "The public face of DeScAi. AI-generated, on-chain peer reviews published and read here. Each post is a structured review of a DeSci paper or project — written autonomously and permanently stored on the PermaWeb.",
  tech: ["Agent Output", "Arweave Read", "DKG Verified"],
};

// ─── 3D math ─────────────────────────────────────────────────────────────────
// Orbit: rotate a point on a sphere of radius R.
// We tilt the orbit plane by TILT_X and TILT_Z so the orbit is clearly 3D.
// Then animate theta (longitude) over time.
const R = 220;           // orbit radius
const TILT_X = 62;       // deg — tilt of orbit plane (makes it clearly non-flat)
const TILT_Z = 18;       // secondary tilt adds realism
const SPEED = 12;        // deg/sec

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
      background: "rgba(5,3,12,0.82)",
      backdropFilter: "blur(16px)",
      WebkitBackdropFilter: "blur(16px)",
      animation: "pFade 0.18s ease",
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: "#0c0a16",
        border: "1px solid rgba(255,255,255,0.08)",
        borderTop: "1px solid rgba(255,255,255,0.18)",
        borderRadius: 6,
        padding: "40px 44px 36px",
        maxWidth: 480, width: "90vw",
        position: "relative",
        boxShadow: "0 30px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)",
        animation: "pSlide 0.26s cubic-bezier(0.16,1,0.3,1) both",
      }}>
        <button onClick={onClose} style={{
          position: "absolute", top: 16, right: 16,
          background: "transparent",
          border: "1px solid rgba(255,255,255,0.1)",
          color: "rgba(255,255,255,0.35)",
          width: 28, height: 28, borderRadius: 4,
          cursor: "pointer", fontSize: 12,
          fontFamily: "inherit",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "all 0.15s",
        }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)"; e.currentTarget.style.color = "rgba(255,255,255,0.8)"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "rgba(255,255,255,0.35)"; }}
        >✕</button>

        <span style={{
          display: "inline-block",
          fontSize: 9, letterSpacing: 4,
          color: "rgba(255,255,255,0.35)",
          fontFamily: "'Courier New', monospace",
          marginBottom: 16,
          textTransform: "uppercase",
        }}>{node.tag}</span>

        <h2 style={{
          fontFamily: "'Courier New', monospace",
          fontWeight: 700, fontSize: 20,
          color: "#fff",
          letterSpacing: 1, marginBottom: 6,
        }}>{node.label}</h2>

        <div style={{ height: 1, background: "rgba(255,255,255,0.07)", marginBottom: 20 }} />

        <p style={{
          fontFamily: "Georgia, serif",
          fontSize: 14, lineHeight: 1.78,
          color: "rgba(255,255,255,0.65)",
          marginBottom: 24,
        }}>{node.description}</p>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {node.tech.map(t => (
            <span key={t} style={{
              fontSize: 10,
              fontFamily: "'Courier New', monospace",
              letterSpacing: 1.5,
              color: "rgba(255,255,255,0.45)",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.09)",
              padding: "4px 12px", borderRadius: 3,
            }}>{t}</span>
          ))}
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

  useEffect(() => {
    const loop = ts => {
      if (!t0.current) t0.current = ts;
      setElapsed((ts - t0.current) / 1000);
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const W = 560, H = 440;
  const CX = W / 2, CY = H / 2;
  const CENTER_R = 58;

  // Compute all node positions
  const withPos = NODES.map(n => {
    const p = get3DPos(n.theta0, n.phi0, elapsed);
    // Perspective projection
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
  const orbitPath = Array.from({ length: 180 }, (_, i) => {
    const t = (i / 180) * 360;
    const phi = 12 * Math.PI / 180; // representative latitude
    const ta = t * Math.PI / 180;
    let v = [R * Math.cos(ta), R * Math.sin(ta), R * Math.sin(phi) * 0.3];
    v = rotX(v, TILT_X * Math.PI / 180);
    v = rotZ(v, TILT_Z * Math.PI / 180);
    const fov = 700;
    const pz2 = fov / (fov - v[2] * 0.5);
    return [CX + v[0] * pz2, CY + v[1] * pz2, v[2]];
  });

  const pathD = orbitPath.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ") + " Z";

  // 6 travel dots on the orbit
  const travelDots = Array.from({ length: 6 }, (_, i) => {
    const frac = ((elapsed * SPEED / 360) + i / 6) % 1;
    const idx = Math.floor(frac * orbitPath.length);
    const pt = orbitPath[idx] || orbitPath[0];
    const depth = pt[2];
    const opacity = 0.12 + ((depth + R) / (2 * R)) * 0.45;
    return { x: pt[0], y: pt[1], opacity };
  });

  // Center pulse
  const cp = 1 + Math.sin(elapsed * 2.2) * 0.025;

  return (
    <div style={{ position: "relative", width: W, height: H }}>
      {/* SVG: orbit ring + lines */}
      <svg width={W} height={H} style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none" }}>
        <defs>
          <filter id="fglow">
            <feGaussianBlur stdDeviation="2.5" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Orbit ring — dashed, very subtle */}
        <path d={pathD} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
        <path d={pathD} fill="none" stroke="rgba(255,255,255,0.12)"
          strokeWidth="0.6" strokeDasharray="6 20"
          strokeDashoffset={-(elapsed * 40)}
        />

        {/* Travel dots */}
        {travelDots.map((d, i) => (
          <circle key={i} cx={d.x} cy={d.y} r={1.8}
            fill="rgba(255,255,255,0.9)" opacity={d.opacity}
            filter="url(#fglow)"
          />
        ))}

        {/* Connector lines — drawn in z-order too, clipped by center when behind */}
        {sorted.map(node => {
          const isBehind = node.z < centerZ;
          return (
            <line key={node.id + "-l"}
              x1={CX} y1={CY}
              x2={node.sx} y2={node.sy}
              stroke="rgba(255,255,255,1)"
              strokeWidth={isBehind ? 0.3 : 0.5}
              strokeDasharray="3 9"
              opacity={isBehind ? 0.06 : 0.14}
            />
          );
        })}
      </svg>

      {/* ── Nodes: rendered in back-to-front z-order ── */}
      {sorted.map(node => {
        const isBehind = node.z < centerZ;
        const sz = Math.round(76 * node.nodeScale);
        const opacity = isBehind
          ? 0.28 + ((node.z + R) / (2 * R)) * 0.3
          : 0.7 + (node.z / R) * 0.28;
        const borderOpacity = isBehind ? 0.18 : 0.45;
        const glowOpacity = isBehind ? 0 : (node.z / R) * 0.4;

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
              background: isBehind
                ? "rgba(12,10,22,0.7)"
                : "rgba(16,12,28,0.92)",
              border: `1px solid rgba(255,255,255,${borderOpacity})`,
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              cursor: "pointer",
              opacity,
              zIndex: zIdx,
              boxShadow: isBehind ? "none"
                : `0 0 ${20 * node.nodeScale}px rgba(255,255,255,${glowOpacity}), 0 4px 24px rgba(0,0,0,0.5)`,
              transition: "box-shadow 0.12s, opacity 0.1s",
              backdropFilter: "blur(4px)",
              WebkitBackdropFilter: "blur(4px)",
            }}
            onMouseEnter={e => {
              if (!isBehind) {
                e.currentTarget.style.boxShadow = "0 0 32px rgba(255,255,255,0.3), 0 4px 24px rgba(0,0,0,0.5)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.7)";
              }
            }}
            onMouseLeave={e => {
              e.currentTarget.style.boxShadow = isBehind ? "none"
                : `0 0 ${20 * node.nodeScale}px rgba(255,255,255,${glowOpacity}), 0 4px 24px rgba(0,0,0,0.5)`;
              e.currentTarget.style.borderColor = `rgba(255,255,255,${borderOpacity})`;
            }}
          >
            <span style={{
              color: "rgba(255,255,255,0.9)",
              fontSize: Math.max(7.5, 9.5 * node.nodeScale),
              fontFamily: "'Courier New', monospace",
              fontWeight: 700,
              textAlign: "center",
              lineHeight: 1.25,
              letterSpacing: 0.3,
              padding: "0 5px",
            }}>{node.label}</span>
            {node.nodeScale > 0.8 && (
              <span style={{
                color: "rgba(255,255,255,0.3)",
                fontSize: Math.max(5.5, 7 * node.nodeScale),
                fontFamily: "'Courier New', monospace",
                letterSpacing: 1.5,
                marginTop: 3,
              }}>{node.tag}</span>
            )}
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
          boxShadow: `0 0 ${40 * cp}px rgba(255,255,255,0.08), 0 0 ${80 * cp}px rgba(180,100,255,0.06), 0 8px 32px rgba(0,0,0,0.6)`,
          transform: `scale(${cp})`,
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          transition: "box-shadow 0.15s",
        }}
        onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 0 50px rgba(255,255,255,0.18), 0 8px 32px rgba(0,0,0,0.6)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.55)"; }}
        onMouseLeave={e => { e.currentTarget.style.boxShadow = `0 0 ${40 * cp}px rgba(255,255,255,0.08), 0 8px 32px rgba(0,0,0,0.6)`; e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)"; }}
      >
        <span style={{
          color: "#fff", fontSize: 11,
          fontFamily: "'Courier New', monospace",
          fontWeight: 700, letterSpacing: 1.5,
          textAlign: "center",
        }}>Agent{"\n"}Blog</span>
        <span style={{
          color: "rgba(255,255,255,0.3)",
          fontSize: 7.5,
          fontFamily: "'Courier New', monospace",
          letterSpacing: 3, marginTop: 5,
          animation: "blinkLive 1.8s ease-in-out infinite",
        }}>● LIVE</span>
      </div>
    </div>
  );
}

// ─── Landing page ─────────────────────────────────────────────────────────────
export default function DeScAiLanding() {
  const [activeNode, setActiveNode] = useState(null);

  const FEATURES = [...NODES, CENTER_NODE];

  return (
    <div style={{ background: "#06040f", minHeight: "100vh", color: "#fff", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=Syne+Mono&display=swap');
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

      {/* ── Nav — ultra-minimal ── */}
      <nav style={{
        position: "relative", zIndex: 10,
        padding: "0 48px",
        height: 56,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
      }}>
        <span style={{
          fontFamily: "'Syne', sans-serif",
          fontWeight: 800, fontSize: 17,
          letterSpacing: 2,
          color: "#fff",
        }}>
          De<span style={{ opacity: 0.45 }}>Sc</span>Ai
        </span>
        <div style={{ display: "flex", gap: 32, alignItems: "center" }}>
          {["Protocol", "Research", "Blog"].map(l => (
            <a key={l} href="#" style={{
              color: "rgba(255,255,255,0.35)",
              fontFamily: "'Syne Mono', monospace",
              fontSize: 11, letterSpacing: 2,
              textDecoration: "none",
              textTransform: "uppercase",
              transition: "color 0.15s",
            }}
              onMouseEnter={e => e.currentTarget.style.color = "rgba(255,255,255,0.8)"}
              onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.35)"}
            >{l}</a>
          ))}
          <button style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.12)",
            color: "rgba(255,255,255,0.7)",
            fontFamily: "'Syne Mono', monospace",
            fontSize: 10, letterSpacing: 2,
            padding: "8px 18px", cursor: "pointer",
            borderRadius: 3, textTransform: "uppercase",
            transition: "all 0.15s",
          }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "#fff"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "rgba(255,255,255,0.7)"; }}
          >Connect Wallet</button>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{
        position: "relative", zIndex: 1,
        minHeight: "calc(100vh - 56px)",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        paddingTop: 32, paddingBottom: 48,
      }}>
        {/* Title — embossed outline letting space background through */}
        <div style={{ textAlign: "center", animation: "fadeUp 0.8s cubic-bezier(0.16,1,0.3,1) both" }}>
          <h1 style={{
            fontFamily: "'Syne', sans-serif",
            fontWeight: 800,
            fontSize: "clamp(64px, 12vw, 120px)",
            letterSpacing: "0.02em",
            lineHeight: 1,
            color: "rgba(255,255,255,0.2)",
            WebkitTextStroke: "1.8px rgba(255,255,255,0.7)",
            textShadow: "0 0 30px rgba(180,100,255,0.3), 0 0 60px rgba(100,150,255,0.15), 0 2px 4px rgba(0,0,0,0.5)",
            marginBottom: 12,
            filter: "drop-shadow(0 0 8px rgba(255,255,255,0.1))",
          }}>
            De<span style={{
              WebkitTextStroke: "1.2px rgba(255,255,255,0.35)",
            }}>Sc</span>Ai
          </h1>
          <p style={{
            fontFamily: "'Syne Mono', monospace",
            fontSize: 11, letterSpacing: 4,
            color: "rgba(255,255,255,0.28)",
            textTransform: "uppercase",
            animation: "fadeUp 0.8s ease 0.2s both",
          }}>
            Autonomous AI peer review for decentralized science
          </p>
        </div>

        {/* Orbital diagram */}
        <div style={{
          marginTop: 20,
          animation: "fadeUp 1s cubic-bezier(0.16,1,0.3,1) 0.15s both",
        }}>
          <OrbitalSystem onNodeClick={setActiveNode} />
        </div>

        {/* Scroll hint */}
        <div style={{ marginTop: 4, animation: "scrollDrop 2.4s ease-in-out infinite" }}>
          <svg width="12" height="20" viewBox="0 0 12 20" fill="none">
            <path d="M6 0v14M1 9l5 7 5-7" stroke="rgba(255,255,255,0.22)" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        </div>
      </section>

      {/* ── Protocol section ── */}
      <section style={{
        position: "relative", zIndex: 1,
        maxWidth: 1000, margin: "0 auto",
        padding: "80px 32px",
      }}>
        <div style={{ marginBottom: 48 }}>
          <span style={{
            display: "block",
            fontFamily: "'Syne Mono', monospace",
            fontSize: 10, letterSpacing: 5,
            color: "rgba(255,255,255,0.25)",
            marginBottom: 12,
          }}>ARCHITECTURE</span>
          <h2 style={{
            fontFamily: "'Syne', sans-serif",
            fontWeight: 700, fontSize: 28,
            color: "#fff", letterSpacing: -0.3,
          }}>Protocol Stack</h2>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 8,
        }}>
          {FEATURES.map((node, i) => (
            <div key={node.id}
              className="fcard"
              onClick={() => setActiveNode(node)}
              style={{ animation: `fadeUp 0.5s ease ${i * 0.06}s both` }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <span style={{
                  fontFamily: "'Syne Mono', monospace",
                  fontSize: 9, letterSpacing: 3.5,
                  color: "rgba(255,255,255,0.25)",
                  textTransform: "uppercase",
                }}>{node.tag}</span>
                <span style={{ color: "rgba(255,255,255,0.12)", fontSize: 12 }}>↗</span>
              </div>
              <h3 style={{
                fontFamily: "'Syne', sans-serif",
                fontWeight: 700, fontSize: 14,
                color: "#fff", letterSpacing: 0.2,
                marginBottom: 10,
              }}>{node.label}</h3>
              <p style={{
                fontFamily: "Georgia, serif",
                fontSize: 13, lineHeight: 1.68,
                color: "rgba(255,255,255,0.4)",
              }}>{node.description.slice(0, 90)}…</p>
            </div>
          ))}
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
        }}>
          "Science belongs to everyone. Peer review should be open, verifiable, and permanent —
          without gatekeepers, without censorship, without forgetting."
        </p>
      </section>

      {/* ── CTA ── */}
      <section style={{
        position: "relative", zIndex: 1,
        padding: "40px 32px 72px",
        display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap",
      }}>
        {[
          { label: "Read the Agent Blog", primary: true },
          { label: "Explore the DKG", primary: false },
          { label: "Run a Node", primary: false },
          { label: "GitHub", primary: false },
        ].map(({ label, primary }) => (
          <button key={label} style={{
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
          DeScAi · Zurabi Kochiashvili · Stony Brook University · Blockchain Business Lab
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
