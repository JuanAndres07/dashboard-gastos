import { useState, useMemo } from "react";
import { useAnalytics } from "./useAnalytics";
import { useTheme } from "../contexts/ThemeContext";
import { formatCurrency, formatLocalDate } from "../utilities/formatters";

export const CATEGORY_COLORS = [
  "#3b82f6", // Azul
  "#ec4899", // Rosado
  "#f59e0b", // Ámbar
  "#14b8a6", // Turquesa
  "#f97316", // Naranja
  "#06b6d4", // Celeste
  "#10b981", // Esmeralda
  "#6366f1", // Índigo
  "#eab308", // Amarillo
  "#8b5cf6", // Morado
];

export function useAnalysisPage(user) {
  const { theme } = useTheme();
  const {
    sixMonthsData,
    loadingSixMonths,
    errorSixMonths,
    expensesByCategory,
    loadingExpenses,
    errorExpenses,
    budgets,
    loadingBudgets,
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
    const primaryColor = isDark ? "#3b82f6" : "#0052cc";
    const successColor = isDark ? "#34d399" : "#10b981";
    const dangerColor = isDark ? "#f87171" : "#ef4444";
    const textMuted = isDark ? "#94a3b8" : "#64748b";

    return {
      primary: primaryColor,
      success: successColor,
      danger: dangerColor,
      textColor: textMuted,
      gridColor: isDark ? "rgba(255, 255, 255, 0.06)" : "rgba(0, 0, 0, 0.04)",
      tooltipBg: isDark ? "#1e293b" : "#ffffff",
      tooltipBorder: isDark
        ? "rgba(255, 255, 255, 0.1)"
        : "rgba(0, 0, 0, 0.06)",
      tooltipText: isDark ? "#f8fafc" : "#05345c",
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
          borderColor: themeStyles.success,
          backgroundColor:
            theme === "dark"
              ? "rgba(52, 211, 153, 0.08)"
              : "rgba(16, 185, 129, 0.06)",
          fill: true,
          tension: 0.4,
          borderWidth: 3,
          pointBackgroundColor: themeStyles.success,
          pointBorderColor: themeStyles.cardBg,
          pointBorderWidth: 2,
          pointRadius: 3,
          pointHoverRadius: 6,
        },
        {
          label: "Gastos",
          data: sortedEvolutionData.map((d) => Number(d.expense)),
          borderColor: themeStyles.danger,
          backgroundColor:
            theme === "dark"
              ? "rgba(248, 113, 113, 0.08)"
              : "rgba(239, 68, 68, 0.06)",
          fill: true,
          tension: 0.4,
          borderWidth: 3,
          pointBackgroundColor: themeStyles.danger,
          pointBorderColor: themeStyles.cardBg,
          pointBorderWidth: 2,
          pointRadius: 3,
          pointHoverRadius: 6,
        },
      ],
    };
  }, [sortedEvolutionData, themeStyles, theme]);

  const evolutionChartOptions = useMemo(() => {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "top",
          labels: {
            color: themeStyles.textColor,
            usePointStyle: true,
            boxWidth: 8,
            font: { family: "Inter", weight: "600", size: 12 },
          },
        },
        tooltip: {
          backgroundColor: themeStyles.tooltipBg,
          titleColor: themeStyles.tooltipText,
          bodyColor: themeStyles.tooltipText,
          borderColor: themeStyles.tooltipBorder,
          borderWidth: 1,
          padding: 12,
          cornerRadius: 12,
          boxPadding: 6,
          usePointStyle: true,
        },
      },
      interaction: {
        mode: "index",
        intersect: false,
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: {
            color: themeStyles.textColor,
            font: { family: "Inter", size: 11 },
          },
        },
        y: {
          grid: { color: themeStyles.gridColor, drawTicks: false },
          border: { dash: [4, 4] },
          ticks: {
            color: themeStyles.textColor,
            font: { family: "Inter", size: 11 },
          },
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
          borderColor: themeStyles.cardBg,
          borderWidth: 3,
          spacing: 4,
          borderRadius: 8,
          hoverOffset: 8,
        },
      ],
    };
  }, [expensesByCategory, themeStyles]);

  const categoryChartOptions = useMemo(() => {
    return {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "80%",
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          backgroundColor: themeStyles.tooltipBg,
          titleColor: themeStyles.tooltipText,
          bodyColor: themeStyles.tooltipText,
          borderColor: themeStyles.tooltipBorder,
          borderWidth: 1,
          padding: 12,
          cornerRadius: 12,
          callbacks: {
            label: function (context) {
              const value = context.raw || 0;
              const percentage =
                totalExpensesPeriod > 0
                  ? ((value / totalExpensesPeriod) * 100).toFixed(1)
                  : 0;
              return ` ${context.label}: ${formatCurrency(value)} (${percentage}%)`;
            },
          },
        },
      },
    };
  }, [themeStyles, totalExpensesPeriod]);

  // --- DATA PARA EL TOP 3 CATEGORÍAS ---
  const top3Categories = useMemo(() => {
    return [...expensesByCategory]
      .sort((a, b) => Number(b.total_amount) - Number(a.total_amount))
      .slice(0, 3);
  }, [expensesByCategory]);

  // Asignar colores consistentes para mapear categorías en gráficos y leyendas
  const categoryColorMap = useMemo(() => {
    const map = {};
    expensesByCategory.forEach((cat, idx) => {
      map[cat.category_name] = CATEGORY_COLORS[idx % CATEGORY_COLORS.length];
    });
    return map;
  }, [expensesByCategory]);

  return {
    loadingExpenses,
    errorExpenses,
    loadingSixMonths,
    errorSixMonths,
    rangePreset,
    dateFilters,
    totalExpensesPeriod,
    sixMonthsKpis,
    sortedEvolutionData,
    evolutionChartData,
    evolutionChartOptions,
    top3Categories,
    expensesByCategory,
    categoryChartData,
    categoryChartOptions,
    categoryColorMap,
    handlePresetChange,
    onDateInputChange,
    refetchAll,
    budgets,
    loadingBudgets,
  };
}
