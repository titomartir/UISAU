import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale, BarElement, Title
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, ChartDataLabels);

// ── Paleta Power BI ────────────────────────────────────────────────────────
const PBI = {
  blue:   '#118DFF',
  navy:   '#12239E',
  orange: '#E66C37',
  teal:   '#00B8D9',
  green:  '#107C10',
  yellow: '#FFC300',
  purple: '#884DFF',
  red:    '#D13438',
  gray:   '#8A8886',
  bg:     '#F3F2F1',
  card:   '#FFFFFF',
  border: '#E1DFDD',
  text:   '#252423',
  sub:    '#605E5C',
};

const PALETTE = [PBI.blue, PBI.orange, PBI.teal, PBI.green, PBI.yellow, PBI.purple, PBI.red, PBI.navy];

const LIKERT_COLORS = ['#D13438', '#E87572', '#A6A6A6', '#54B054', '#107C10'];
const LIKERT_LABELS = ['Muy insatisfecho', 'Insatisfecho', 'Neutral', 'Satisfecho', 'Muy satisfecho'];

// ── Calcula distribución a partir de respuestas crudas ────────────────────
function calcularEstadisticas(tipo, respuestas) {
  if (!respuestas || respuestas.length === 0) return null;

  if (tipo === 'likert_5') {
    const counts = [0, 0, 0, 0, 0]; // índice 0 = puntaje 1
    let suma = 0;
    let validos = 0;
    respuestas.forEach(r => {
      const p = parseInt(r.puntaje);
      if (p >= 1 && p <= 5) {
        counts[p - 1]++;
        suma += p;
        validos++;
      }
    });
    return {
      tipo: 'likert',
      labels: LIKERT_LABELS,
      values: counts,
      total: respuestas.length,
      promedio: validos > 0 ? (suma / validos).toFixed(1) : null,
    };
  }

  if (tipo === 'seleccion_unica' || tipo === 'checkbox' || tipo === 'si_no') {
    const dist = {};
    respuestas.forEach(r => {
      const val = r.valor || '(sin respuesta)';
      dist[val] = (dist[val] || 0) + 1;
    });
    const labels = Object.keys(dist);
    const values = Object.values(dist);
    return { tipo: 'distribucion', labels, values, total: respuestas.length };
  }

  if (tipo === 'texto') {
    const respondidas = respuestas.filter(r => r.valor && r.valor.trim()).length;
    return { tipo: 'texto', respondidas, noRespondidas: respuestas.length - respondidas, total: respuestas.length };
  }

  return null;
}

// ── Opciones base compartidas ─────────────────────────────────────────────
const BASE_OPTS = {
  responsive: true,
  maintainAspectRatio: true,
  animation: { duration: 500 },
  plugins: {
    legend: { display: false },
    datalabels: { display: false },
    tooltip: {
      backgroundColor: PBI.text,
      titleColor: '#fff',
      bodyColor: '#fff',
      padding: 10,
      cornerRadius: 4,
    },
  },
};

// ── Componente principal ──────────────────────────────────────────────────
export default function GraficoRespuesta({ pregunta, numero }) {
  const { texto, tipo, respuestas } = pregunta;
  const stats = useMemo(() => calcularEstadisticas(tipo, respuestas), [tipo, respuestas]);

  if (!stats) return null;

  // ── Gráfico Likert: barras horizontales coloreadas ─────────────────────
  if (stats.tipo === 'likert') {
    const max = Math.max(...stats.values, 1);
    const barData = {
      labels: stats.labels,
      datasets: [{
        data: stats.values,
        backgroundColor: LIKERT_COLORS,
        borderWidth: 0,
        borderRadius: 3,
        barThickness: 22,
      }],
    };
    const barOpts = {
      ...BASE_OPTS,
      indexAxis: 'y',
      plugins: {
        ...BASE_OPTS.plugins,
        datalabels: {
          display: true,
          anchor: 'end',
          align: 'end',
          color: PBI.sub,
          font: { size: 12, weight: '600' },
          formatter: v => v > 0 ? v : '',
        },
      },
      scales: {
        x: {
          beginAtZero: true,
          max: max + Math.ceil(max * 0.15),
          grid: { color: PBI.border, drawTicks: false },
          border: { display: false },
          ticks: { color: PBI.sub, font: { size: 11 }, stepSize: 1 },
        },
        y: {
          grid: { display: false },
          border: { display: false },
          ticks: { color: PBI.text, font: { size: 12 } },
        },
      },
    };

    return (
      <PBICard numero={numero} texto={texto} total={stats.total}>
        <div className="flex items-center gap-6 mb-4">
          {stats.promedio && (
            <div className="flex-shrink-0 text-center">
              <p className="text-4xl font-bold" style={{ color: PBI.blue }}>{stats.promedio}</p>
              <p className="text-xs mt-1" style={{ color: PBI.sub }}>Promedio / 5.0</p>
            </div>
          )}
          <SatisfaccionBar values={stats.values} total={stats.total} />
        </div>
        <div style={{ height: 180 }}>
          <Bar data={barData} options={barOpts} />
        </div>
      </PBICard>
    );
  }

  // ── Gráfico distribución: donut + tabla de leyenda ─────────────────────
  if (stats.tipo === 'distribucion') {
    const colors = PALETTE.slice(0, stats.labels.length);
    const donutData = {
      labels: stats.labels,
      datasets: [{
        data: stats.values,
        backgroundColor: colors,
        borderWidth: 2,
        borderColor: PBI.card,
        hoverOffset: 8,
      }],
    };
    const donutOpts = {
      ...BASE_OPTS,
      cutout: '62%',
      plugins: {
        ...BASE_OPTS.plugins,
        datalabels: {
          display: ctx => ctx.dataset.data[ctx.dataIndex] > 0,
          color: '#fff',
          font: { size: 11, weight: '700' },
          formatter: (v, ctx) => {
            const pct = Math.round((v / stats.total) * 100);
            return pct >= 8 ? `${pct}%` : '';
          },
        },
        tooltip: {
          ...BASE_OPTS.plugins.tooltip,
          callbacks: {
            label: ctx => ` ${ctx.label}: ${ctx.raw} (${Math.round((ctx.raw / stats.total) * 100)}%)`,
          },
        },
      },
    };

    return (
      <PBICard numero={numero} texto={texto} total={stats.total}>
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="flex-shrink-0" style={{ width: 200, height: 200 }}>
            <Doughnut data={donutData} options={donutOpts} />
          </div>
          <div className="flex-1 w-full">
            {stats.labels.map((label, i) => {
              const pct = Math.round((stats.values[i] / stats.total) * 100);
              return (
                <div key={i} className="mb-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="flex items-center gap-2" style={{ color: PBI.text }}>
                      <span className="inline-block w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: colors[i] }} />
                      {label}
                    </span>
                    <span className="font-semibold" style={{ color: PBI.sub }}>{stats.values[i]} <span className="font-normal text-xs">({pct}%)</span></span>
                  </div>
                  <div className="w-full rounded-full" style={{ height: 6, backgroundColor: PBI.bg }}>
                    <div className="rounded-full" style={{ width: `${pct}%`, height: 6, backgroundColor: colors[i] }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </PBICard>
    );
  }

  // ── Pregunta de texto abierto ──────────────────────────────────────────
  if (stats.tipo === 'texto') {
    const pct = stats.total > 0 ? Math.round((stats.respondidas / stats.total) * 100) : 0;
    return (
      <PBICard numero={numero} texto={texto} total={stats.total}>
        <div className="flex items-center gap-6">
          <div className="relative flex-shrink-0" style={{ width: 120, height: 120 }}>
            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
              <circle cx="18" cy="18" r="15.9" fill="none" stroke={PBI.bg} strokeWidth="3.2" />
              <circle cx="18" cy="18" r="15.9" fill="none" stroke={PBI.blue} strokeWidth="3.2"
                strokeDasharray={`${pct} ${100 - pct}`} strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold" style={{ color: PBI.blue }}>{pct}%</span>
              <span className="text-xs" style={{ color: PBI.sub }}>tasa</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 flex-1">
            <MetricBox value={stats.respondidas} label="Respondidas" color={PBI.green} bg="#EFF6EF" />
            <MetricBox value={stats.noRespondidas} label="Sin respuesta" color={PBI.gray} bg={PBI.bg} />
          </div>
        </div>
      </PBICard>
    );
  }

  return null;
}

// ── Sub-componentes ───────────────────────────────────────────────────────
function PBICard({ numero, texto, total, children }) {
  return (
    <div className="rounded" style={{ background: PBI.card, border: `1px solid ${PBI.border}`, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
      {/* Header estilo Power BI */}
      <div className="px-5 py-3 flex justify-between items-start" style={{ borderBottom: `1px solid ${PBI.border}` }}>
        <div className="flex-1 pr-4">
          {numero && <span className="text-xs font-semibold uppercase tracking-widest mr-2" style={{ color: PBI.sub }}>P{numero}</span>}
          <span className="text-sm font-semibold" style={{ color: PBI.text }}>{texto}</span>
        </div>
        <span className="flex-shrink-0 text-xs px-2 py-1 rounded" style={{ background: PBI.bg, color: PBI.sub }}>
          n = {total}
        </span>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function MetricBox({ value, label, color, bg }) {
  return (
    <div className="rounded p-4 text-center" style={{ background: bg }}>
      <p className="text-3xl font-bold" style={{ color }}>{value}</p>
      <p className="text-xs mt-1" style={{ color: PBI.sub }}>{label}</p>
    </div>
  );
}

// Barra de satisfacción compacta (verde-rojo) estilo NPS
function SatisfaccionBar({ values, total }) {
  if (!total) return null;
  const colors = LIKERT_COLORS;
  return (
    <div className="flex-1">
      <div className="flex rounded overflow-hidden" style={{ height: 14 }}>
        {values.map((v, i) => {
          const pct = (v / total) * 100;
          return pct > 0 ? (
            <div key={i} style={{ width: `${pct}%`, background: colors[i] }} title={`${LIKERT_LABELS[i]}: ${v}`} />
          ) : null;
        })}
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-xs" style={{ color: PBI.red }}>Insatisfecho</span>
        <span className="text-xs" style={{ color: PBI.green }}>Satisfecho</span>
      </div>
    </div>
  );
}
