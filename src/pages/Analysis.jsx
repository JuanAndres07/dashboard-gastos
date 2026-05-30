import { useState, useEffect, useMemo } from "react";
import { useAnalytics } from "../hooks/useAnalytics";
import { useTheme } from "../contexts/ThemeContext";
import { formatCurrency, formatLocalDate } from "../utilities/formatters";
import iconDictionary from "../utilities/iconDictionary";
import { Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
);

const CATEGORY_COLORS = [
  "#3b82f6", // Azul
  "#8b5cf6", // Morado
  "#ec4899", // Rosado
  "#f59e0b", // Ámbar
  "#14b8a6", // Turquesa
  "#f97316", // Naranja
  "#06b6d4", // Celeste
  "#10b981", // Esmeralda
  "#6366f1", // Índigo
  "#eab308", // Amarillo
];

export default function Analysis({ user }) {
  const { theme } = useTheme();
  const {
    sixMonthsData,
    loadingSixMonths,
    errorSixMonths,
    expensesByCategory,
    loadingExpenses,
    errorExpenses,
    dateFilters,
    setManualFilters,
    handleFilterChange,
    refetchAll,
  } = useAnalytics(user);

  const [rangePreset, setRangePreset] = useState("este-mes");

  // Al cambiar el preset de fechas
  const handlePresetChange = (preset) => {
    setRangePreset(preset);
    if (preset === "personalizado") return;

    const now = new Date();
    let start, end;

    switch (preset) {
      case "este-mes":
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
      case "mes-anterior":
        start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        end = new Date(now.getFullYear(), now.getMonth(), 0);
        break;
      case "ultimos-3-meses":
        start = new Date(now.getFullYear(), now.getMonth() - 2, 1);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
      case "ultimos-6-meses":
        start = new Date(now.getFullYear(), now.getMonth() - 5, 1);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
      case "este-ano":
        start = new Date(now.getFullYear(), 0, 1);
        end = new Date(now.getFullYear(), 11, 31);
        break;
      default:
        return;
    }

    setManualFilters(formatLocalDate(start), formatLocalDate(end));
  };

  // Al cambiar manualmente un input de tipo fecha
  const onDateInputChange = (e) => {
    setRangePreset("personalizado");
    handleFilterChange(e);
  };

  // Formateador de nombres de meses en español
  const formatMonthLabel = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const formatted = new Intl.DateTimeFormat("es-ES", {
      month: "short",
      year: "numeric",
    }).format(date);
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  };

  // --- CÁLCULOS DE LOS KPIS ---
  const totalExpensesPeriod = useMemo(() => {
    return expensesByCategory.reduce(
      (sum, item) => sum + Number(item.total_amount),
      0,
    );
  }, [expensesByCategory]);

  const sixMonthsKpis = useMemo(() => {
    const totalIncome = sixMonthsData.reduce(
      (sum, item) => sum + Number(item.income),
      0,
    );
    const totalExpense = sixMonthsData.reduce(
      (sum, item) => sum + Number(item.expense),
      0,
    );
    const netSavings = totalIncome - totalExpense;
    const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;

    return {
      totalIncome,
      totalExpense,
      netSavings,
      savingsRate,
    };
  }, [sixMonthsData]);

  // --- CONFIGURACIÓN DE COLORES Y ESTILOS SEGÚN TEMA ---
  const themeStyles = useMemo(() => {
    const isDark = theme === "dark";
    return {
      textColor: isDark ? "#94a3b8" : "#64748b",
      gridColor: isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.05)",
      tooltipBg: isDark ? "#1e293b" : "#ffffff",
      tooltipBorder: isDark
        ? "rgba(255, 255, 255, 0.15)"
        : "rgba(0, 0, 0, 0.08)",
      tooltipText: isDark ? "#f8fafc" : "#0f172a",
      cardBg: isDark ? "#1e293b" : "#ffffff",
      borderColor: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.08)",
    };
  }, [theme]);

  // --- DATA PARA EL GRÁFICO 1: EVOLUCIÓN MENSUAL ---
  const sortedEvolutionData = useMemo(() => {
    return [...sixMonthsData].sort(
      (a, b) => new Date(a.month) - new Date(b.month),
    );
  }, [sixMonthsData]);

  const evolutionChartData = useMemo(() => {
    return {
      labels: sortedEvolutionData.map((d) => formatMonthLabel(d.month)),
      datasets: [
        {
          label: "Ingresos",
          data: sortedEvolutionData.map((d) => Number(d.income)),
          backgroundColor: "#10b981", // Verde esmeralda
          borderRadius: 6,
        },
        {
          label: "Gastos",
          data: sortedEvolutionData.map((d) => Number(d.expense)),
          backgroundColor: "#ef4444", // Rojo / Rose
          borderRadius: 6,
        },
      ],
    };
  }, [sortedEvolutionData]);

  const evolutionChartOptions = useMemo(() => {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "top",
          labels: {
            color: themeStyles.textColor,
            font: { family: "Inter", weight: "500" },
          },
        },
        tooltip: {
          backgroundColor: themeStyles.tooltipBg,
          titleColor: themeStyles.tooltipText,
          bodyColor: themeStyles.tooltipText,
          borderColor: themeStyles.tooltipBorder,
          borderWidth: 1,
          padding: 10,
          cornerRadius: 8,
        },
      },
      scales: {
        x: {
          grid: { color: themeStyles.gridColor },
          ticks: { color: themeStyles.textColor, font: { family: "Inter" } },
        },
        y: {
          grid: { color: themeStyles.gridColor },
          ticks: { color: themeStyles.textColor, font: { family: "Inter" } },
        },
      },
    };
  }, [themeStyles]);

  // --- DATA PARA EL GRÁFICO 2: GASTOS POR CATEGORÍA ---
  const categoryChartData = useMemo(() => {
    return {
      labels: expensesByCategory.map((c) => c.category_name),
      datasets: [
        {
          data: expensesByCategory.map((c) => Number(c.total_amount)),
          backgroundColor: expensesByCategory.map(
            (_, idx) => CATEGORY_COLORS[idx % CATEGORY_COLORS.length],
          ),
          borderColor: theme === "dark" ? "#1e293b" : "#ffffff",
          borderWidth: 2,
          hoverOffset: 6,
        },
      ],
    };
  }, [expensesByCategory, theme]);

  const categoryChartOptions = useMemo(() => {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false, // Ocultamos la leyenda predeterminada para usar nuestra leyenda HTML interactiva
        },
        tooltip: {
          backgroundColor: themeStyles.tooltipBg,
          titleColor: themeStyles.tooltipText,
          bodyColor: themeStyles.tooltipText,
          borderColor: themeStyles.tooltipBorder,
          borderWidth: 1,
          padding: 10,
          cornerRadius: 8,
          callbacks: {
            label: function (context) {
              const value = context.raw || 0;
              const percentage =
                totalExpensesPeriod > 0
                  ? ((value / totalExpensesPeriod) * 100).toFixed(1)
                  : 0;
              return `${context.label}: ${formatCurrency(value)} (${percentage}%)`;
            },
          },
        },
      },
    };
  }, [themeStyles, totalExpensesPeriod]);

  // --- DATA PARA EL GRÁFICO 3: TOP 3 CATEGORÍAS ---
  const top3Categories = useMemo(() => {
    return [...expensesByCategory]
      .sort((a, b) => Number(b.total_amount) - Number(a.total_amount))
      .slice(0, 3);
  }, [expensesByCategory]);

  const top3ChartData = useMemo(() => {
    return {
      labels: top3Categories.map((c) => c.category_name),
      datasets: [
        {
          data: top3Categories.map((c) => Number(c.total_amount)),
          backgroundColor: ["#ef4444", "#f97316", "#f59e0b"], // Top 1 (Rojo), Top 2 (Naranja), Top 3 (Ámbar)
          borderRadius: 6,
          barThickness: 24,
        },
      ],
    };
  }, [top3Categories]);

  const top3ChartOptions = useMemo(() => {
    return {
      indexAxis: "y",
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: themeStyles.tooltipBg,
          titleColor: themeStyles.tooltipText,
          bodyColor: themeStyles.tooltipText,
          borderColor: themeStyles.tooltipBorder,
          borderWidth: 1,
          padding: 10,
          cornerRadius: 8,
        },
      },
      scales: {
        x: {
          grid: { color: themeStyles.gridColor },
          ticks: { color: themeStyles.textColor, font: { family: "Inter" } },
        },
        y: {
          grid: { display: false },
          ticks: {
            color: themeStyles.textColor,
            font: { family: "Inter", weight: "600" },
          },
        },
      },
    };
  }, [themeStyles]);

  return (
    <div className="container-fluid py-4">
      {/* Encabezado y Selector de Fechas */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
        <div>
          <h1 className="fw-bold mb-1">Análisis Financiero</h1>
          <p className="text-muted mb-0">
            Estadísticas y desglose detallado de tus movimientos
          </p>
        </div>

        {/* Filtros */}
        <div className="d-flex flex-wrap gap-2 align-items-center">
          <div className="d-flex align-items-center gap-1">
            <select
              className="form-select form-select-sm"
              style={{ minWidth: "150px" }}
              value={rangePreset}
              onChange={(e) => handlePresetChange(e.target.value)}
            >
              <option value="este-mes">Este Mes</option>
              <option value="mes-anterior">Mes Anterior</option>
              <option value="ultimos-3-meses">Últimos 3 Meses</option>
              <option value="ultimos-6-meses">Últimos 6 Meses</option>
              <option value="este-ano">Este Año</option>
              <option value="personalizado">Personalizado</option>
            </select>
          </div>
          <div className="d-flex align-items-center gap-2">
            <input
              type="date"
              name="p_start_date"
              className="form-control form-control-sm"
              value={dateFilters.p_start_date}
              onChange={onDateInputChange}
              disabled={rangePreset !== "personalizado"}
            />
            <span className="text-muted small">a</span>
            <input
              type="date"
              name="p_end_date"
              className="form-control form-control-sm"
              value={dateFilters.p_end_date}
              onChange={onDateInputChange}
              disabled={rangePreset !== "personalizado"}
            />
            <button
              className="btn btn-sm btn-outline-secondary p-1 border-0"
              onClick={refetchAll}
              title="Actualizar datos"
            >
              <i className="bi bi-arrow-clockwise"></i>
            </button>
          </div>
        </div>
      </div>

      {/* Fila de KPIs */}
      <div className="row g-3 mb-4">
        {/* KPI 1: Gastos del Periodo */}
        <div className="col-md-4">
          <div
            className="card shadow-sm border-0 h-100 p-3"
            style={{ backgroundColor: themeStyles.cardBg }}
          >
            <h6 className="text-uppercase text-muted small fw-semibold">
              Gastos del Periodo
            </h6>
            {loadingExpenses ? (
              <div
                className="spinner-border spinner-border-sm text-primary my-2"
                role="status"
              ></div>
            ) : errorExpenses ? (
              <span className="text-danger small">{errorExpenses}</span>
            ) : (
              <h2 className="fw-bold mb-0 text-danger">
                {formatCurrency(totalExpensesPeriod)}
              </h2>
            )}
            <p className="small text-muted mt-2 mb-0">
              Total facturado entre el{" "}
              {formatLocalDate(new Date(dateFilters.p_start_date))} y el{" "}
              {formatLocalDate(new Date(dateFilters.p_end_date))}
            </p>
          </div>
        </div>

        {/* KPI 2: Ahorro Neto Promedio (6m) */}
        <div className="col-md-4">
          <div
            className="card shadow-sm border-0 h-100 p-3"
            style={{ backgroundColor: themeStyles.cardBg }}
          >
            <h6 className="text-uppercase text-muted small fw-semibold">
              Ahorro Acumulado (6 Meses)
            </h6>
            {loadingSixMonths ? (
              <div
                className="spinner-border spinner-border-sm text-primary my-2"
                role="status"
              ></div>
            ) : errorSixMonths ? (
              <span className="text-danger small">{errorSixMonths}</span>
            ) : (
              <h2
                className={`fw-bold mb-0 ${sixMonthsKpis.netSavings >= 0 ? "text-success" : "text-danger"}`}
              >
                {formatCurrency(sixMonthsKpis.netSavings)}
              </h2>
            )}
            <p className="small text-muted mt-2 mb-0">
              Diferencia de ingresos y egresos históricos acumulados
            </p>
          </div>
        </div>

        {/* KPI 3: Tasa de Ahorro Promedio (6m) */}
        <div className="col-md-4">
          <div
            className="card shadow-sm border-0 h-100 p-3"
            style={{ backgroundColor: themeStyles.cardBg }}
          >
            <h6 className="text-uppercase text-muted small fw-semibold">
              Tasa de Ahorro (6 Meses)
            </h6>
            {loadingSixMonths ? (
              <div
                className="spinner-border spinner-border-sm text-primary my-2"
                role="status"
              ></div>
            ) : errorSixMonths ? (
              <span className="text-danger small">{errorSixMonths}</span>
            ) : (
              <h2 className="fw-bold mb-0 text-info">
                {sixMonthsKpis.savingsRate.toFixed(1)}%
              </h2>
            )}
            <p className="small text-muted mt-2 mb-0">
              Porcentaje de ingresos guardados después de gastos
            </p>
          </div>
        </div>
      </div>

      {/* Fila del Gráfico Temporal y Top 3 */}
      <div className="row g-4 mb-4">
        {/* Gráfico 1: Evolución Temporal */}
        <div className="col-12 col-xl-8">
          <div
            className="card shadow-sm border-0 p-4 h-100"
            style={{ backgroundColor: themeStyles.cardBg }}
          >
            <h5 className="fw-bold mb-3">Evolución de Ingresos y Gastos</h5>
            <div style={{ height: "350px", position: "relative" }}>
              {loadingSixMonths ? (
                <div className="d-flex justify-content-center align-items-center h-100">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">
                      Cargando evolución temporal...
                    </span>
                  </div>
                </div>
              ) : errorSixMonths ? (
                <div className="d-flex justify-content-center align-items-center h-100 text-danger">
                  {errorSixMonths}
                </div>
              ) : sortedEvolutionData.length > 0 ? (
                <Bar
                  data={evolutionChartData}
                  options={evolutionChartOptions}
                />
              ) : (
                <div className="d-flex flex-column align-items-center justify-content-center h-100 text-muted">
                  <i
                    className="bi bi-graph-up mb-2"
                    style={{ fontSize: "2rem" }}
                  ></i>
                  <span>No hay suficientes datos históricos.</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Gráfico 3: Top 3 Categorías con Más Gastos */}
        <div className="col-12 col-xl-4">
          <div
            className="card shadow-sm border-0 p-4 h-100"
            style={{ backgroundColor: themeStyles.cardBg }}
          >
            <h5 className="fw-bold mb-3">Top 3 Gastos del Periodo</h5>
            <div style={{ height: "350px", position: "relative" }}>
              {loadingExpenses ? (
                <div className="d-flex justify-content-center align-items-center h-100">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">
                      Cargando top gastos...
                    </span>
                  </div>
                </div>
              ) : errorExpenses ? (
                <div className="d-flex justify-content-center align-items-center h-100 text-danger">
                  {errorExpenses}
                </div>
              ) : top3Categories.length > 0 ? (
                <Bar data={top3ChartData} options={top3ChartOptions} />
              ) : (
                <div className="d-flex flex-column align-items-center justify-content-center h-100 text-muted">
                  <i
                    className="bi bi-bar-chart-steps mb-2"
                    style={{ fontSize: "2rem" }}
                  ></i>
                  <span>Sin gastos en este periodo.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Fila del Gráfico de Dona: Distribución de Gastos */}
      <div className="row g-4">
        <div className="col-12">
          <div
            className="card shadow-sm border-0 p-4"
            style={{ backgroundColor: themeStyles.cardBg }}
          >
            <h5 className="fw-bold mb-4">Desglose de Gastos por Categoría</h5>

            {loadingExpenses ? (
              <div className="d-flex justify-content-center align-items-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Cargando desglose...</span>
                </div>
              </div>
            ) : errorExpenses ? (
              <div className="text-center py-5 text-danger">
                {errorExpenses}
              </div>
            ) : expensesByCategory.length > 0 ? (
              <div className="row align-items-center g-4">
                {/* Gráfico */}
                <div
                  className="col-12 col-md-6"
                  style={{ height: "300px", position: "relative" }}
                >
                  <Doughnut
                    data={categoryChartData}
                    options={categoryChartOptions}
                  />
                </div>

                {/* Leyenda Premium */}
                <div className="col-12 col-md-6">
                  <div
                    className="d-flex flex-column gap-2 overflow-y-auto px-2"
                    style={{ maxHeight: "300px" }}
                  >
                    {expensesByCategory.map((cat, idx) => {
                      const percentage =
                        totalExpensesPeriod > 0
                          ? (Number(cat.total_amount) / totalExpensesPeriod) *
                            100
                          : 0;
                      const IconComponent =
                        iconDictionary[cat.category_icon] ||
                        iconDictionary.IconCoin;
                      const color =
                        CATEGORY_COLORS[idx % CATEGORY_COLORS.length];

                      return (
                        <div
                          key={cat.category_name}
                          className="d-flex align-items-center justify-content-between p-2 rounded"
                          style={{
                            borderBottom: `1px solid ${themeStyles.gridColor}`,
                          }}
                        >
                          <div className="d-flex align-items-center gap-2">
                            <div
                              className="d-flex align-items-center justify-content-center text-white rounded-circle"
                              style={{
                                backgroundColor: color,
                                width: "36px",
                                height: "36px",
                              }}
                            >
                              <IconComponent size={18} />
                            </div>
                            <div>
                              <span
                                className="fw-semibold d-block"
                                style={{ color: "var(--headings-color)" }}
                              >
                                {cat.category_name}
                              </span>
                              <span
                                className="text-muted d-block small"
                                style={{ fontSize: "0.75rem" }}
                              >
                                {percentage.toFixed(1)}% del total
                              </span>
                            </div>
                          </div>
                          <span
                            className="fw-bold"
                            style={{ color: "var(--headings-color)" }}
                          >
                            {formatCurrency(cat.total_amount)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="d-flex flex-column align-items-center justify-content-center py-5 text-muted">
                <i
                  className="bi bi-pie-chart mb-2"
                  style={{ fontSize: "2.5rem" }}
                ></i>
                <span>
                  No se registraron gastos para las categorías en este periodo.
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
