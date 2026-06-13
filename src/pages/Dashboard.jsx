import { TransactionForm } from "../components/TransactionForm";
import { useDashboard } from "../hooks/useDashboard";
import { formatCurrency, parseDate } from "../utilities/formatters";
import { Link } from "react-router-dom";
import iconDictionary from "../utilities/iconDictionary";
import { Line } from "react-chartjs-2";
import {
  IconWallet,
  IconTrendingUp,
  IconTrendingDown,
  IconPigMoney,
  IconArrowUpRight,
  IconArrowDownLeft,
  IconRefresh,
  IconActivity,
  IconChevronRight,
  IconCreditCard,
  IconPlus,
} from "@tabler/icons-react";

export default function Dashboard({ user }) {
  const {
    profile,
    isRefreshing,
    loadingSummary,
    summary,
    monthlySummary,
    transactions,
    loadingTransactions,
    viewMode,
    setViewMode,
    loadingSixMonths,
    getGreeting,
    getFormattedDate,
    refreshData,
    sortedBudgets,
    loadingBudgets,
    upcomingSubscriptions,
    loadingSubscriptions,
    savingsRate,
    getRelativeDays,
    getCategoryColor,
    evolutionChartData,
    evolutionChartOptions,
  } = useDashboard(user);

  return (
    <div className="w-full space-y-8 text-left transition-all duration-300">
      {/* Cabecera Principal */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-(--headings-color) tracking-tight">
            {getGreeting()}, {profile?.fullname || user.email.split("@")[0]}
          </h1>
          <p className="text-sm text-(--text-color)/85 mt-1 capitalize">
            {getFormattedDate()} • Resumen de tu actividad financiera
          </p>
        </div>
        <button
          onClick={refreshData}
          disabled={isRefreshing}
          className="flex items-center gap-2 bg-(--settings-card-bg) border border-(--sidebar-border) text-(--text-color) hover:text-(--sidebar-text-hover) hover:bg-(--sidebar-link-hover-bg) font-semibold py-2.5 px-4 rounded-xl transition-all duration-300 ease-in-out cursor-pointer active:scale-[0.98] disabled:opacity-50"
        >
          <IconRefresh
            size={18}
            className={isRefreshing ? "animate-spin" : ""}
          />
          <span className="text-sm">Actualizar datos</span>
        </button>
      </header>

      {/* Tarjetas de Resumen KPI */}
      <div className="flex flex-col md:flex-row gap-6 w-full">
        {/* KPI 1: Balance Total */}
        <div
          className="flex-1 bg-(--settings-card-bg) rounded-2xl p-6 transition-all duration-300 ease-in-out hover:translate-y-0.5 hover:shadow-[0_10px_20px_rgba(0,0,0,0.03)] dark:hover:shadow-[0_10px_20px_rgba(0,0,0,0.15)] flex flex-col justify-between"
          style={{ border: "var(--card-border)" }}
        >
          <div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-(--text-color)/80">
                Balance General
              </span>
              <div className="p-2 rounded-xl bg-(--sidebar-link-hover-bg) text-(--primary-color)">
                <IconWallet size={20} />
              </div>
            </div>
            {loadingSummary ? (
              <div className="h-9 w-24 bg-(--bg-light) animate-pulse rounded-lg mt-1"></div>
            ) : (
              <h2 className="text-3xl font-extrabold text-(--headings-color) tracking-tight">
                {formatCurrency(summary.balance)}
              </h2>
            )}
          </div>
          <div className="mt-4 pt-3 border-t border-(--sidebar-border)/40 text-xs flex justify-between text-(--text-color)/70">
            <span>Ingresos: {formatCurrency(summary.total_income)}</span>
            <span>Gastos: {formatCurrency(summary.total_expense)}</span>
          </div>
        </div>

        {/* KPI 2: Ingresos del Mes */}
        <div
          className="flex-1 bg-(--settings-card-bg) rounded-2xl p-6 transition-all duration-300 ease-in-out hover:translate-y-0.5 hover:shadow-[0_10px_20px_rgba(0,0,0,0.03)] dark:hover:shadow-[0_10px_20px_rgba(0,0,0,0.15)] flex flex-col justify-between"
          style={{ border: "var(--card-border)" }}
        >
          <div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-(--text-color)/80">
                Ingresos del Mes
              </span>
              <div className="p-2 rounded-xl bg-(--success-color)/10 text-(--success-color)">
                <IconTrendingUp size={20} />
              </div>
            </div>
            {loadingSummary ? (
              <div className="h-9 w-24 bg-(--bg-light) animate-pulse rounded-lg mt-1"></div>
            ) : (
              <h2 className="text-3xl font-extrabold text-(--success-color) tracking-tight">
                {formatCurrency(monthlySummary.total_income)}
              </h2>
            )}
          </div>
          <div className="mt-4 pt-3 border-t border-(--sidebar-border)/40 text-xs flex items-center text-(--success-color) font-medium gap-1">
            <IconArrowUpRight size={14} />
            <span>Entrada de dinero registrada en el mes actual</span>
          </div>
        </div>

        {/* KPI 3: Gastos del Mes */}
        <div
          className="flex-1 bg-(--settings-card-bg) rounded-2xl p-6 transition-all duration-300 ease-in-out hover:translate-y-0.5 hover:shadow-[0_10px_20px_rgba(0,0,0,0.03)] dark:hover:shadow-[0_10px_20px_rgba(0,0,0,0.15)] flex flex-col justify-between"
          style={{ border: "var(--card-border)" }}
        >
          <div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-(--text-color)/80">
                Gastos del Mes
              </span>
              <div className="p-2 rounded-xl bg-(--danger-color)/10 text-(--danger-color)">
                <IconTrendingDown size={20} />
              </div>
            </div>
            {loadingSummary ? (
              <div className="h-9 w-24 bg-(--bg-light) animate-pulse rounded-lg mt-1"></div>
            ) : (
              <h2 className="text-3xl font-extrabold text-(--danger-color) tracking-tight">
                {formatCurrency(monthlySummary.total_expense)}
              </h2>
            )}
          </div>
          <div className="mt-4 pt-3 border-t border-(--sidebar-border)/40 text-xs flex items-center text-(--danger-color) font-medium gap-1">
            <IconArrowDownLeft size={14} />
            <span>Salidas de fondos correspondientes a este período</span>
          </div>
        </div>

        {/* KPI 4: Tasa de Ahorro */}
        <div
          className="flex-1 bg-(--settings-card-bg) rounded-2xl p-6 transition-all duration-300 ease-in-out hover:translate-y-0.5 hover:shadow-[0_10px_20px_rgba(0,0,0,0.03)] dark:hover:shadow-[0_10px_20px_rgba(0,0,0,0.15)] flex flex-col justify-between"
          style={{ border: "var(--card-border)" }}
        >
          <div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-(--text-color)/80">
                Tasa de Ahorro (Mes)
              </span>
              <div className="p-2 rounded-xl bg-[#8b5cf6]/10 text-[#8b5cf6]">
                <IconPigMoney size={20} />
              </div>
            </div>
            {loadingSummary ? (
              <div className="h-9 w-24 bg-(--bg-light) animate-pulse rounded-lg mt-1"></div>
            ) : (
              <h2 className="text-3xl font-extrabold text-(--headings-color) tracking-tight">
                {savingsRate.toFixed(1)}%
              </h2>
            )}
          </div>
          <div className="mt-4 flex flex-col gap-1.5 w-full">
            <div className="w-full h-1.5 bg-(--bg-light) rounded-full overflow-hidden">
              <div
                className="h-full bg-[#8b5cf6] rounded-full transition-all duration-500"
                style={{ width: `${Math.min(savingsRate, 100)}%` }}
              ></div>
            </div>
            <span className="text-[10px] text-(--text-color)/70 font-semibold">
              {savingsRate > 50
                ? "¡Excelente nivel de ahorro!"
                : "Ahorrado de tus ingresos mensuales"}
            </span>
          </div>
        </div>
      </div>

      {/* Grid Principal (Flexbox adaptado) */}
      <div className="flex flex-col lg:flex-row gap-6 w-full items-start">
        {/* Columna Izquierda: Gráficos y Movimientos Recientes */}
        <div className="flex-1 w-full flex flex-col gap-6 min-w-0">
          {/* Card Gráfico de Evolución */}
          <div
            className="w-full bg-(--settings-card-bg) rounded-2xl p-6 transition-all duration-300"
            style={{ border: "var(--card-border)" }}
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-lg font-bold text-(--headings-color)">
                  Evolución Histórica
                </h3>
                <p className="text-xs text-(--text-color)/70 mt-0.5">
                  Flujo de ingresos y gastos de los últimos 6 meses
                </p>
              </div>
              <Link
                to="/analysis"
                className="p-2 hover:bg-(--sidebar-link-hover-bg) text-(--text-color) hover:text-(--sidebar-text-hover) rounded-xl transition-all duration-200"
                title="Ver análisis completo"
              >
                <IconActivity size={18} />
              </Link>
            </div>

            <div className="h-70 w-full relative">
              {loadingSixMonths ? (
                <div className="flex flex-col items-center justify-center h-full gap-2">
                  <div className="w-6 h-6 border-2 border-(--primary-color) border-t-transparent animate-spin rounded-full"></div>
                  <span className="text-xs text-(--text-color)/70 font-medium">
                    Cargando gráfico...
                  </span>
                </div>
              ) : evolutionChartData?.labels?.length > 0 ? (
                <Line
                  data={evolutionChartData}
                  options={evolutionChartOptions}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-(--text-color)/60 gap-2">
                  <IconActivity size={32} className="stroke-[1.5]" />
                  <span className="text-xs font-semibold">
                    Sin datos de evolución para mostrar.
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Card Movimientos Recientes */}
          <div
            className="w-full bg-(--settings-card-bg) rounded-2xl p-6 transition-all duration-300"
            style={{ border: "var(--card-border)" }}
          >
            <div className="flex justify-between items-center mb-5">
              <div>
                <h3 className="text-lg font-bold text-(--headings-color)">
                  Movimientos Recientes
                </h3>
                <p className="text-xs text-(--text-color)/70 mt-0.5">
                  Tus transacciones agregadas recientemente
                </p>
              </div>
              <Link
                to="/transactions"
                className="flex items-center gap-1 text-xs font-bold text-(--primary-color) hover:opacity-80 transition-all duration-200"
              >
                <span>Ver todo</span>
                <IconChevronRight size={14} />
              </Link>
            </div>

            {/* Selector de modo rápido para movimientos recientes */}
            <div className="flex bg-(--bg-light) p-1 rounded-xl gap-1 w-fit mb-5">
              <button
                type="button"
                className={`px-5 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all duration-300 ease-in-out cursor-pointer ${
                  viewMode === "expense"
                    ? "bg-(--danger-color) text-white shadow-md shadow-danger/10"
                    : "text-(--text-color) hover:text-(--headings-color) hover:bg-(--sidebar-link-hover-bg)"
                }`}
                onClick={() => setViewMode("expense")}
              >
                Gastos
              </button>
              <button
                type="button"
                className={`px-5 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all duration-300 ease-in-out cursor-pointer ${
                  viewMode === "income"
                    ? "bg-(--success-color) text-white shadow-md shadow-success/10"
                    : "text-(--text-color) hover:text-(--headings-color) hover:bg-(--sidebar-link-hover-bg)"
                }`}
                onClick={() => setViewMode("income")}
              >
                Ingresos
              </button>
            </div>

            {/* Lista Feed de transacciones */}
            {loadingTransactions ? (
              <div className="flex flex-col items-center justify-center py-12 gap-2">
                <div className="w-6 h-6 border-2 border-(--primary-color) border-t-transparent animate-spin rounded-full"></div>
                <span className="text-xs text-(--text-color)/70">
                  Cargando transacciones...
                </span>
              </div>
            ) : transactions.length > 0 ? (
              <div className="flex flex-col gap-3">
                {transactions.map((t) => {
                  const catIcon = t.Category?.icon || "IconCoin";
                  const IconComp =
                    iconDictionary[catIcon] || iconDictionary.IconCoin;
                  const catColor = getCategoryColor(
                    t.Category?.name || "General",
                  );

                  return (
                    <div
                      key={t.id}
                      className="flex items-center justify-between p-3 rounded-xl border border-(--sidebar-border)/20 hover:bg-(--sidebar-link-hover-bg)/30 transition-all duration-200 ease-in-out"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="flex items-center justify-center w-10 h-10 rounded-xl shrink-0"
                          style={{
                            backgroundColor: `${catColor}15`,
                            color: catColor,
                          }}
                        >
                          <IconComp size={18} />
                        </div>
                        <div>
                          <span className="font-bold text-sm text-(--headings-color) block">
                            {t.note || (
                              <span className="italic text-(--text-color)/50 font-normal">
                                Sin descripción
                              </span>
                            )}
                          </span>
                          <span className="text-[10px] font-bold text-(--text-color)/70 block mt-0.5 uppercase tracking-wide">
                            {t.Category?.name || "General"} •{" "}
                            {parseDate(t.transaction_date || t.created_at).toLocaleDateString(
                              "es-ES",
                              { month: "short", day: "numeric" },
                            )}
                          </span>
                        </div>
                      </div>
                      <span
                        className={`font-bold text-sm ${
                          t.type === "expense"
                            ? "text-(--danger-color)"
                            : "text-(--success-color)"
                        }`}
                      >
                        {t.type === "expense" ? "-" : "+"}
                        {formatCurrency(t.amount)}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 px-4 border border-dashed border-(--sidebar-border) rounded-2xl">
                <p className="text-sm text-(--text-color)/70 font-semibold">
                  No se encontraron movimientos recientes.
                </p>
                <p className="text-xs text-(--text-color)/50 mt-1">
                  Registra uno nuevo utilizando el panel lateral.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Columna Derecha: Nueva Transacción, Presupuestos y Suscripciones */}
        <div className="w-full lg:w-90 xl:w-100 shrink-0 flex flex-col gap-6">
          {/* Card Formulario Rápido */}
          <div
            className="w-full bg-(--settings-card-bg) rounded-2xl p-6 transition-all duration-300"
            style={{ border: "var(--card-border)" }}
          >
            <h3 className="text-lg font-bold text-(--headings-color) mb-4">
              Nueva Transacción
            </h3>
            <TransactionForm onTransactionAdded={refreshData} user={user} />
          </div>

          {/* Card Estado de Presupuestos */}
          <div
            className="w-full bg-(--settings-card-bg) rounded-2xl p-6 transition-all duration-300"
            style={{ border: "var(--card-border)" }}
          >
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-bold text-(--headings-color)">
                  Presupuestos Activos
                </h3>
                <p className="text-[10px] text-(--text-color)/70">
                  Consumo en el período actual
                </p>
              </div>
              <Link
                to="/budgets"
                className="text-xs font-bold text-(--primary-color) hover:opacity-80 transition-all duration-200"
              >
                Gestionar
              </Link>
            </div>

            {loadingBudgets ? (
              <div className="flex flex-col items-center justify-center py-8 gap-2">
                <div className="w-5 h-5 border-2 border-(--primary-color) border-t-transparent animate-spin rounded-full"></div>
                <span className="text-xs text-(--text-color)/70">
                  Cargando presupuestos...
                </span>
              </div>
            ) : sortedBudgets.length > 0 ? (
              <div className="flex flex-col gap-4">
                {sortedBudgets.map((b) => {
                  const isExceeded = b.spent > b.total_budget;
                  const isWarning = b.percentage >= 80 && !isExceeded;

                  // Color de la barra
                  let barColor = "bg-(--success-color)";
                  let progressBorder = "border-(--sidebar-border)/20";
                  if (isExceeded) {
                    barColor = "bg-(--danger-color)";
                    progressBorder =
                      "border-(--danger-color)/20 shadow-[0_0_10px_rgba(239,68,68,0.15)]";
                  } else if (isWarning) {
                    barColor = "bg-[#d97706]";
                    progressBorder =
                      "border-[#d97706]/20 shadow-[0_0_10px_rgba(217,119,6,0.15)]";
                  }

                  return (
                    <div
                      key={b.category_id}
                      className={`flex flex-col p-3 rounded-xl border ${progressBorder} transition-all duration-300`}
                    >
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-xs font-bold text-(--headings-color) capitalize truncate max-w-37.5">
                          {b.category_name}
                        </span>
                        <span
                          className={`text-[10px] font-bold ${isExceeded ? "text-(--danger-color)" : isWarning ? "text-[#d97706]" : "text-(--success-color)"}`}
                        >
                          {b.percentage.toFixed(0)}%
                        </span>
                      </div>

                      {/* Barra de progreso */}
                      <div className="w-full h-2 bg-(--bg-light) rounded-full overflow-hidden mb-2">
                        <div
                          className={`h-full ${barColor} transition-all duration-500 rounded-full`}
                          style={{ width: `${Math.min(b.percentage, 100)}%` }}
                        ></div>
                      </div>

                      <div className="flex justify-between text-[10px] font-medium text-(--text-color)/70">
                        <span>{formatCurrency(b.spent)} gastado</span>
                        <span>Límite: {formatCurrency(b.total_budget)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 px-4 bg-(--bg-light)/20 border border-dashed border-(--sidebar-border) rounded-xl flex flex-col items-center justify-center gap-3">
                <span className="text-xs text-(--text-color)/70 italic">
                  No tienes presupuestos configurados.
                </span>
                <Link
                  to="/budgets"
                  className="flex items-center gap-1.5 bg-(--primary-color) text-white font-semibold py-1.5 px-3 rounded-lg text-[10px] transition-all duration-300 cursor-pointer hover:opacity-90 active:scale-[0.98]"
                >
                  <IconPlus size={12} />
                  <span>Crear Presupuesto</span>
                </Link>
              </div>
            )}
          </div>

          {/* Card Próximos Pagos / Suscripciones */}
          <div
            className="w-full bg-(--settings-card-bg) rounded-2xl p-6 transition-all duration-300"
            style={{ border: "var(--card-border)" }}
          >
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-bold text-(--headings-color)">
                  Próximos Pagos
                </h3>
                <p className="text-[10px] text-(--text-color)/70">
                  Tus próximos cargos habituales
                </p>
              </div>
              <Link
                to="/subscriptions"
                className="text-xs font-bold text-(--primary-color) hover:opacity-80 transition-all duration-200"
              >
                Gestionar
              </Link>
            </div>

            {loadingSubscriptions ? (
              <div className="flex flex-col items-center justify-center py-8 gap-2">
                <div className="w-5 h-5 border-2 border-(--primary-color) border-t-transparent animate-spin rounded-full"></div>
                <span className="text-xs text-(--text-color)/70">
                  Cargando pagos habituales...
                </span>
              </div>
            ) : upcomingSubscriptions.length > 0 ? (
              <div className="flex flex-col gap-3">
                {upcomingSubscriptions.map((sub) => {
                  const relativeDays = getRelativeDays(sub.next_payment_date);
                  const isDueSoon =
                    relativeDays === "Hoy" ||
                    relativeDays === "Mañana" ||
                    relativeDays === "Vencido";

                  return (
                    <div
                      key={sub.id}
                      className="flex items-center justify-between p-3 rounded-xl border border-(--sidebar-border)/20"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-xl flex items-center justify-center shrink-0 ${isDueSoon ? "bg-(--danger-color)/10 text-(--danger-color)" : "bg-(--sidebar-link-hover-bg) text-(--primary-color)"}`}
                        >
                          <IconCreditCard size={18} />
                        </div>
                        <div>
                          <span className="font-bold text-xs text-(--headings-color) block truncate max-w-30">
                            {sub.name}
                          </span>
                          <span
                            className={`text-[10px] font-bold block mt-0.5 ${isDueSoon ? "text-(--danger-color)" : "text-(--text-color)/70"}`}
                          >
                            {relativeDays} (
                            {parseDate(sub.next_payment_date?.split("T")[0]).toLocaleDateString(
                              "es-ES",
                              { month: "short", day: "numeric" },
                            )}
                            )
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-extrabold text-xs text-(--headings-color) block">
                          {formatCurrency(sub.amount)}
                        </span>
                        <span className="text-[8px] font-semibold text-(--text-color)/60 uppercase tracking-wide">
                          {sub.frequency === "1 month"
                            ? "Mensual"
                            : sub.frequency === "1 year"
                              ? "Anual"
                              : "Recurrente"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 px-4 bg-(--bg-light)/20 border border-dashed border-(--sidebar-border) rounded-xl">
                <span className="text-xs text-(--text-color)/70 italic block">
                  No hay pagos habituales próximos.
                </span>
                <Link
                  to="/subscriptions"
                  className="inline-block mt-3 text-[10px] font-bold text-(--primary-color) hover:underline"
                >
                  Agregar tu primer pago recurrente
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
