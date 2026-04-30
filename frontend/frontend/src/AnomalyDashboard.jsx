import React from "react";
import { Line } from "react-chartjs-2";
import "chart.js/auto";

export default function AnomalyDashboard({ data }) {
  const registros = data.registros;

  const labels = registros.map((r) => r.index);
  const latencias = registros.map((r) => r.Latency);
  const bytes = registros.map((r) => r.bytes);

  const latenciaChart = {
    labels,
    datasets: [
      {
        label: "Latência",
        data: latencias,
        borderColor: "red",
      },
    ],
  };

  const bytesChart = {
    labels,
    datasets: [
      {
        label: "Bytes",
        data: bytes,
        borderColor: "blue",
      },
    ],
  };

  return (
    <div className="container">
      <h1>📊 Monitoramento de Anomalias</h1>

      {/* CARDS */}
      <div className="grid">
        <Card title="Total" value={data.total} />
        <Card title="Anomalias" value={data.anomalias} />
        <Card title="Normais" value={data.normais} />
        <Card
          title="Status"
          value={data.alerta ? "⚠ ALERTA" : "OK"}
          alert={data.alerta}
        />
      </div>

      {/* GRÁFICOS */}
      <div className="chart">
        <h3>Latência</h3>
        <Line data={latenciaChart} />
      </div>

      <div className="chart">
        <h3>Bytes</h3>
        <Line data={bytesChart} />
      </div>

      {/* TABELA */}
      <h3>Registros (50 primeiros)</h3>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Elapsed</th>
            <th>Latency</th>
            <th>Bytes</th>
            <th>Resultado</th>
          </tr>
        </thead>
        <tbody>
          {registros.slice(0, 50).map((r) => (
            <tr key={r.index}>
              <td>{r.index}</td>
              <td>{r.elapsed}</td>
              <td>{r.Latency}</td>
              <td>{r.bytes}</td>
              <td>{r.resultado}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Card({ title, value, alert }) {
  return (
    <div className={`card ${alert ? "alert" : ""}`}>
      <span>{title}</span>
      <strong>{value}</strong>
    </div>
  );
}