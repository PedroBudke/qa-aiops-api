import { useState, useCallback, useRef, useEffect } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceLine, ResponsiveContainer, Legend,
  BarChart, Bar, Cell
} from "recharts";

const API_URL = "http://localhost:8000";

const C = {
  bg: "#0a0e1a",
  panel: "#111827",
  border: "#1f2937",
  accent: "#00d4ff",
  danger: "#ff4444",
  ok: "#00e676",
  warn: "#ffaa00",
  textPri: "#f1f5f9",
  textSec: "#64748b",
  normal: "#00d4ff",
  anomalia: "#ff4444",
};

const fmt = (n, dec = 0) =>
  n == null ? "—" : Number(n).toLocaleString("pt-BR", { maximumFractionDigits: dec });

function StatCard({ label, value, unit = "", color = C.textPri, sub }) {
  return (
    <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
      <div style={{ fontSize: 11, color: C.textSec }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 700, color }}>
        {value} <span style={{ fontSize: 12 }}>{unit}</span>
      </div>
      {sub && <div style={{ fontSize: 11, color: C.textSec }}>{sub}</div>}
    </div>
  );
}

function GraficoLatencia({ dados, baseline }) {
  return (
    <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
      <div>Latência</div>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={dados}>
          <CartesianGrid stroke={C.border} strokeDasharray="3 3" />
          <XAxis dataKey="index" />
          <YAxis />
          <Tooltip />
          <Legend />

          {baseline?.elapsed_mean > 0 && (
            <ReferenceLine y={baseline.elapsed_mean} stroke={C.warn} />
          )}

          <Line
            type="monotone"
            dataKey="elapsed"
            stroke={C.accent}
            strokeWidth={1.5}
            dot={(props) => {
              const { payload, cx, cy } = props;
              if (payload.resultado === "Anomalia") {
                return <circle cx={cx} cy={cy} r={3} fill={C.danger} />;
              }
              return null;
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function GraficoDistribuicao({ n_normais, n_anomalias }) {
  const dados = [
    { name: "Normal", value: n_normais, fill: C.ok },
    { name: "Anomalia", value: n_anomalias, fill: C.danger },
  ];

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={dados}>
        <CartesianGrid stroke={C.border} />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="value">
          {dados.map((d, i) => <Cell key={i} fill={d.fill} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

function GraficoBytes({ dados }) {
  return (
    <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
      <div>Bytes</div>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={dados}>
          <CartesianGrid stroke={C.border} />
          <XAxis dataKey="index" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="bytes" stroke={C.ok} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function App() {
  const [resultado, setResultado] = useState(null);
  const [loading, setLoading] = useState(false);

  const analisar = useCallback(async (file) => {
    setLoading(true);
    try {
      const form = new FormData();
      form.append("arquivo", file);

      const res = await fetch(`${API_URL}/analisar`, {
        method: "POST",
        body: form
      });

      const data = await res.json();

      // NORMALIZAÇÃO
      const normalizado = {
        ...data,
        n_normais: data.normais ?? 0,
        n_anomalias: data.anomalias ?? 0,
        limite_alerta: data.limite_alerta ?? 20,
      };

      setResultado(normalizado);

    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  // KPIs
  const stats = resultado?.registros?.length
    ? {
        media: resultado.registros.reduce((a, r) => a + r.elapsed, 0) / resultado.registros.length,
        max: Math.max(...resultado.registros.map(r => r.elapsed)),
        p95: [...resultado.registros.map(r => r.elapsed)]
          .sort((a, b) => a - b)[Math.floor(resultado.registros.length * 0.95)]
      }
    : null;

  return (
    <div style={{ background: C.bg, color: C.textPri, minHeight: "100vh", padding: 30 }}>

      <input type="file" onChange={(e) => analisar(e.target.files[0])} />

      {loading && <p>Carregando...</p>}

      {resultado && (
        <>
          {/* CARDS */}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <StatCard label="Total" value={resultado.total} />
            <StatCard label="Normais" value={resultado.n_normais} color={C.ok} />
            <StatCard label="Anomalias" value={resultado.n_anomalias} color={C.danger} />

            {stats && (
              <>
                <StatCard label="Média" value={fmt(stats.media)} unit="ms" />
                <StatCard label="P95" value={fmt(stats.p95)} unit="ms" color={C.warn} />
                <StatCard label="Max" value={fmt(stats.max)} unit="ms" color={C.danger} />
              </>
            )}
          </div>

          {/* GRÁFICOS */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginTop: 20 }}>
            <GraficoLatencia dados={resultado.registros} baseline={resultado.baseline} />
            <GraficoDistribuicao
              n_normais={resultado.n_normais}
              n_anomalias={resultado.n_anomalias}
            />
            <GraficoBytes dados={resultado.registros} />
          </div>

          {/* TABELA */}
          <table style={{ width: "100%", marginTop: 20 }}>
            <thead>
              <tr>
                <th>#</th>
                <th>elapsed</th>
                <th>latency</th>
                <th>bytes</th>
              </tr>
            </thead>
            <tbody>
              {resultado.registros
                .filter(r => r.resultado === "Anomalia")
                .sort((a, b) => b.elapsed - a.elapsed)
                .slice(0, 50)
                .map((r, i) => (
                  <tr key={i}>
                    <td>{r.index}</td>
                    <td style={{ color: C.danger }}>{r.elapsed}</td>
                    <td>{r.Latency}</td>
                    <td>{r.bytes}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}