import { useNavigate } from "react-router-dom";

const TEAM_MEMBERS = [
  {
    name: "Coby Nunberg",
    role: "Team Lead",
    degree: "B.S. Economics & Blockchain Development",
    description: "Founding member and developer of DeScAi. Built the team designed agentic architecture.",
  },
  {
    name: "Joshua Suwanto",
    role: "Data Scientist",
    degree: "B.S. Applied Mathematics & Statistics",
    description: "DeScAi-v.1 model training and dataset development, Building the DeScAi crawler.",
  },
  {
    name: "Yaswanth Bhuma",
    role: "ML Engineer",
    degree: "M.S. Computer Science & AMS",
    description: "Engineering inference pipeline and review generation process optimized for decentralized compute.",
  },
  {
    name: "Zurabi Kochiashvili",
    role: "Web3 Developer",
    degree: "B.S. Computer Science",
    description: "Building the agent blog user interface and features.",
  },
  {
    name: "Vinod Prakash",
    role: "Technical Manager",
    degree: "M.S. Distributed Systems",
    description: "Developing decentralized backend infrastructure for agent deployment and component integration.",
  },
  {
    name: "Tianming Sha",
    role: "ML Engineer",
    degree: "B.S. Applied Mathematics & Statistics",
    description: "Leading ongoing model post-training and evaluation on scientific and reasoning benchmarks",
  },
  {
    name: "Andrew Orfin",
    role: "Junior Web3 Developer",
    degree: "B.S. Computer Science",
    description: "Integrates Arweave permanence layer and building features for the immutable blog.",
  },
];

export default function Team() {
  const navigate = useNavigate();

  return (
    <div style={{ background: "#06040f", minHeight: "100vh", color: "#fff", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=Syne+Mono&family=Figtree:wght@400;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }

        @keyframes fadeUp {
          from{opacity:0;transform:translateY(16px)}
          to{opacity:1;transform:translateY(0)}
        }
        @keyframes holoShift {
          0% { background-position: 200% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>

      {/* Background */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <div style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(ellipse 80% 60% at 50% 20%, rgba(80,30,120,0.06) 0%, transparent 70%)",
        }} />
        <div style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(ellipse 50% 50% at 50% 60%, rgba(180,60,80,0.03) 0%, transparent 65%)",
        }} />
      </div>

      {/* Back button */}
      <button onClick={() => navigate("/")} style={{
        position: "fixed",
        top: 24,
        left: 48,
        zIndex: 10,
        background: "transparent",
        border: "1px solid rgba(255,255,255,0.12)",
        color: "rgba(255,255,255,0.45)",
        fontFamily: "'Syne Mono', monospace",
        fontSize: 10,
        letterSpacing: 2.5,
        padding: "10px 20px",
        cursor: "pointer",
        borderRadius: 3,
        textTransform: "uppercase",
        transition: "all 0.15s",
      }}
        onMouseEnter={e => {
          e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)";
          e.currentTarget.style.color = "rgba(255,255,255,0.75)";
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)";
          e.currentTarget.style.color = "rgba(255,255,255,0.45)";
        }}
      >← Back</button>

      {/* Main content */}
      <section style={{
        position: "relative",
        zIndex: 1,
        maxWidth: 1000,
        margin: "0 auto",
        padding: "120px 32px 80px",
      }}>
        {/* Simple centered header */}
        <div style={{ textAlign: "center", marginBottom: 100 }}>
          <h1 style={{
            fontFamily: "'Syne', sans-serif",
            fontWeight: 500,
            fontSize: 38,
            color: "rgba(255,255,255,0.8)",
            letterSpacing: 0.5,
          }}>Our Team</h1>
        </div>

        {/* Team grid - 2 columns wide, 3 rows + 1 centered */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "90px 30px",
        }}>
          {TEAM_MEMBERS.map((member, i) => (
            <div key={member.name} style={{
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gridColumn: i === 6 ? "1 / -1" : "auto",
            }}>
              {/* Name */}
              <h3 style={{
                fontFamily: "'Syne', sans-serif",
                fontWeight: 600,
                fontSize: 22,
                color: "#fff",
                marginBottom: 12,
              }}>{member.name}</h3>

              {/* Role - yellowish accent color */}
              <div style={{
                fontFamily: "'Syne Mono', monospace",
                fontSize: 11,
                letterSpacing: 1.8,
                color: "rgba(220,200,140,0.8)",
                textTransform: "uppercase",
                marginBottom: 10,
              }}>{member.role}</div>

              {/* Degree */}
              <div style={{
                fontFamily: "Georgia, serif",
                fontSize: 12,
                color: "rgba(255,255,255,0.3)",
                marginBottom: 18,
              }}>{member.degree}</div>

              {/* Description */}
              <p style={{
                fontFamily: "Georgia, serif",
                fontSize: 14,
                lineHeight: 1.7,
                color: "rgba(255,255,255,0.45)",
                maxWidth: 360,
              }}>{member.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        position: "relative",
        zIndex: 1,
        borderTop: "1px solid rgba(255,255,255,0.05)",
        padding: "20px 48px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 8,
      }}>
        <span style={{
          fontFamily: "'Syne Mono', monospace",
          fontSize: 10,
          letterSpacing: 1.5,
          color: "rgba(255,255,255,0.18)",
        }}>
          DeScAi · Stony Brook University · Blockchain Business Lab
        </span>
        <span style={{
          fontFamily: "'Syne Mono', monospace",
          fontSize: 9,
          letterSpacing: 2.5,
          color: "rgba(255,255,255,0.12)",
        }}>Akash · OriginTrail · Arweave</span>
      </footer>
    </div>
  );
}
