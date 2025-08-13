import Chart from "chart.js/auto";
import { memo, useEffect, useRef } from "react";

const ChartSection = ({ chartData, TRIBES }) => {
  const chartRef = useRef(null);
  let tribosChartInstance = useRef(null);

  useEffect(() => {
    if (!chartRef.current) return;

    const ctx = chartRef.current.getContext("2d");

    // Se a instância do gráfico já existe, apenas atualiza os dados e o gráfico
    if (tribosChartInstance.current) {
      tribosChartInstance.current.data.datasets[0].data = chartData;
      tribosChartInstance.current.update();
    } else {
      tribosChartInstance.current = new Chart(ctx, {
        type: "bar",
        data: {
          labels: Object.values(TRIBES).map((t) => t.name),
          datasets: [
            {
              label: "Cestas de Alimento Arrecadadas",
              data: chartData,
              backgroundColor: Object.values(TRIBES).map((t) => t.color),
              borderColor: Object.values(TRIBES).map((t) =>
                t.color.replace("0.7", "1")
              ),
              borderWidth: 1,
            },
          ],
        },
        options: {
          indexAxis: "y",
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            title: { display: true, text: "Cestas de Alimento por Tribo" },
            tooltip: {
              callbacks: {
                label: function (context) {
                  return ` ${context.raw.toFixed(0)} Cestas`;
                },
              },
            },
          },
          scales: {
            x: {
              beginAtZero: true,
              title: { display: true, text: "Quantidade (Cestas)" },
            },
          },
        },
      });
    }

    return () => {
      if (tribosChartInstance.current) {
        tribosChartInstance.current.destroy();
        tribosChartInstance.current = null;
      }
    };
  }, [chartData, TRIBES]);

  return (
    <section
      aria-labelledby="chart-heading"
      className="mt-8 bg-white p-6 rounded-xl shadow-lg"
    >
      <h2 id="chart-heading" className="text-xl font-bold mb-1">
        Desempenho das Tribos
      </h2>
      <p className="text-sm text-stone-600 mb-4">
        Acompanhe a competição amigável! Este gráfico compara o total arrecadado
        por cada tribo, atualizado em tempo real. Passe o mouse sobre as barras
        para ver os números das tribos.
      </p>
      <div className="chart-container">
        <canvas ref={chartRef}></canvas>
      </div>
    </section>
  );
};

const arePropsEqual = (prevProps, nextProps) => {
  if (prevProps.TRIBES !== nextProps.TRIBES) {
    return false;
  }

  if (prevProps.chartData.length !== nextProps.chartData.length) {
    return false;
  }

  for (let i = 0; i < prevProps.chartData.length; i++) {
    if (prevProps.chartData[i] !== nextProps.chartData[i]) {
      return false;
    }
  }
  return true;
};

export default memo(ChartSection, arePropsEqual);
