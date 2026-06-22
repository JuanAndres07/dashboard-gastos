import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { supabase } from "../lib/supabase";
import { useTransactions } from "./useTransactions";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { useAnalytics } from "./useAnalytics";
import { useBudgets } from "./useBudgets";
import { useSubscriptions } from "./useSubscriptions";

export function useDashboard(user) {
  const { profile } = useAuth();
  const { theme } = useTheme();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Estados locales para los resúmenes financieros
  const [summary, setSummary] = useState({
    total_income: 0,
    total_expense: 0,
    balance: 0,
  });
  const [monthlySummary, setMonthlySummary] = useState({
    total_income: 0,
    total_expense: 0,
    balance: 0,
  });
  const [isFetchingSummary, setIsFetchingSummary] = useState(true);
  const lastSuccessfullyFetchedSummaryRef = useRef(null);
  const loadingSummary = isFetchingSummary && lastSuccessfullyFetchedSummaryRef.current === null;

  // 1. Hook de Transacciones Recientes (límitado a 5)
  const {
    transactions,
    loading: loadingTransactions,
    viewMode,
    setViewMode,
  } = useTransactions({
    user,
    limit: 5,
    trigger: refreshTrigger,
  });

  // 2. Hook de Análisis / Evolución histórica de 6 meses
  const {
    sixMonthsData,
    loadingSixMonths,
    refetchAll: refetchAnalytics,
  } = useAnalytics(user);

  // 3. Hook de Presupuestos
  const { budgets, loadingBudgets, fetchBudgets } = useBudgets(user);

  // 4. Hook de Suscripciones (Pagos Habituales)
  const { subscriptions, loadingSubscriptions, fetchSubscriptions } =
    useSubscriptions(user);

  // Función para obtener saludo dinámico según la hora
  const getGreeting = useCallback(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Buenos días";
    if (hour < 18) return "Buenas tardes";
    return "Buenas noches";
  }, []);

  // Obtener fecha actual en formato legible en español
  const getFormattedDate = useCallback(() => {
    return new Date().toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, []);

  // Función para forzar la actualización de todos los datos en paralelo
  const refreshData = useCallback(async () => {
    setIsRefreshing(true);
    setRefreshTrigger((prev) => prev + 1);

    // Ejecutar recargas adicionales si están definidas en los hooks
    if (refetchAnalytics) refetchAnalytics();
    if (fetchBudgets) fetchBudgets();
    if (fetchSubscriptions) fetchSubscriptions();

    setTimeout(() => {
      setIsRefreshing(false);
    }, 800);
  }, [refetchAnalytics, fetchBudgets, fetchSubscriptions]);

  // Obtener resumen financiero (RPC)
  const fetchSummaryData = useCallback(
    async (signal) => {
      setIsFetchingSummary(true);
      try {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const startOfMonth = `${year}-${month}-01`;

        const lastDay = new Date(year, now.getMonth() + 1, 0).getDate();
        const endOfMonth = `${year}-${month}-${String(lastDay).padStart(2, "0")}`;

        const [allResponse, monthResponse] = await Promise.all([
          supabase
            .rpc("get_financial_summary", {
              p_user_id: user.id,
              p_start_date: null,
              p_end_date: null,
            })
            .abortSignal(signal),
          supabase
            .rpc("get_financial_summary", {
              p_user_id: user.id,
              p_start_date: startOfMonth,
              p_end_date: endOfMonth,
            })
            .abortSignal(signal),
        ]);

        const { data: allData, error: allError } = allResponse;
        const { data: monthData, error: monthError } = monthResponse;

        if (allError) throw allError;
        if (monthError) throw monthError;

        if (allData) {
          const data = Array.isArray(allData) ? allData[0] : allData;
          setSummary({
            ...data,
            balance: (data.total_income || 0) - (data.total_expense || 0),
          });
        }

        if (monthData) {
          const data = Array.isArray(monthData) ? monthData[0] : monthData;
          setMonthlySummary({
            ...data,
            balance: (data.total_income || 0) - (data.total_expense || 0),
          });
        }
        lastSuccessfullyFetchedSummaryRef.current = true;
      } catch (error) {
        if (
          error.name !== "AbortError" &&
          !error.message?.includes("AbortError")
        ) {
          console.error("Error al obtener el resumen financiero:", error);
        }
      } finally {
        if (!signal.aborted) {
          setIsFetchingSummary(false);
        }
      }
    },
    [user?.id],
  );

  useEffect(() => {
    if (user?.id) {
      const controller = new AbortController();
      fetchSummaryData(controller.signal);
      return () => controller.abort();
    }
  }, [user?.id, refreshTrigger, fetchSummaryData]);

  // --- CONFIGURACIÓN DE COLORES PARA EL GRÁFICO ---
  const themeStyles = useMemo(() => {
    const isDark = theme === "dark";
    return {
      primary: isDark ? "#3b82f6" : "#0052cc",
      success: isDark ? "#34d399" : "#10b981",
      danger: isDark ? "#f87171" : "#ef4444",
      textColor: isDark ? "#94a3b8" : "#64748b",
      gridColor: isDark ? "rgba(255, 255, 255, 0.06)" : "rgba(0, 0, 0, 0.04)",
      tooltipBg: isDark ? "#1e293b" : "#ffffff",
      tooltipBorder: isDark
        ? "rgba(255, 255, 255, 0.1)"
        : "rgba(0, 0, 0, 0.06)",
      tooltipText: isDark ? "#f8fafc" : "#05345c",
      cardBg: isDark ? "#1e293b" : "#ffffff",
    };
  }, [theme]);

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

  // --- DATA PARA EL GRÁFICO: EVOLUCIÓN HISTÓRICA ---
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

  // --- FILTRAR Y ORDENAR PRESUPUESTOS POR CONSUMO ---
  const sortedBudgets = useMemo(() => {
    return [...budgets]
      .map((b) => ({
        ...b,
        percentage: b.total_budget > 0 ? (b.spent / b.total_budget) * 100 : 0,
      }))
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 3);
  }, [budgets]);

  // --- FILTRAR SUSCRIPCIONES PRÓXIMAS ---
  const upcomingSubscriptions = useMemo(() => {
    return [...subscriptions]
      .filter((sub) => sub.is_active && sub.next_payment_date)
      .sort(
        (a, b) => new Date(a.next_payment_date) - new Date(b.next_payment_date),
      )
      .slice(0, 3);
  }, [subscriptions]);

  // --- CÁLCULO DE TASA DE AHORRO ---
  const savingsRate = useMemo(() => {
    const income = monthlySummary.total_income || 0;
    const expense = monthlySummary.total_expense || 0;
    if (income <= 0) return 0;
    const net = income - expense;
    return Math.max(0, (net / income) * 100);
  }, [monthlySummary]);

  // --- CONSEGUIR DÍAS RESTANTES DE SUSCRIPCIÓN ---
  const getRelativeDays = useCallback((dateStr) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const paymentDate = new Date(dateStr);
    paymentDate.setHours(0, 0, 0, 0);
    const diffTime = paymentDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Hoy";
    if (diffDays === 1) return "Mañana";
    if (diffDays < 0) return "Vencido";
    return `En ${diffDays} días`;
  }, []);

  // --- MAPEAR COLORES DE CATEGORÍAS ESTABLES ---
  const getCategoryColor = useCallback((categoryName) => {
    const colors = [
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
    let hash = 0;
    for (let i = 0; i < categoryName.length; i++) {
      hash = categoryName.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  }, []);

  return {
    profile,
    theme,
    isRefreshing,
    loadingSummary,
    summary,
    monthlySummary,
    transactions,
    loadingTransactions,
    viewMode,
    setViewMode,
    sixMonthsData,
    loadingSixMonths,
    budgets,
    loadingBudgets,
    subscriptions,
    loadingSubscriptions,
    getGreeting,
    getFormattedDate,
    refreshData,
    sortedBudgets,
    upcomingSubscriptions,
    savingsRate,
    getRelativeDays,
    getCategoryColor,
    evolutionChartData,
    evolutionChartOptions,
  };
}
