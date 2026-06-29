import { useState } from "react";
import { Link } from "react-router-dom";
import { formatCurrency, formatLocalDate } from "../utilities/formatters";
import iconDictionary from "../utilities/iconDictionary";
import { Line, Doughnut } from "react-chartjs-2";
import "../lib/chartConfig";
import { useAnalysisPage, CATEGORY_COLORS } from "../hooks/useAnalysisPage";
import Select from "../components/Select";
import DateInput from "../components/DateInput";
import {
  IconRefresh,
  IconTrendingUp,
  IconPigMoney,
  IconArrowDownLeft,
  IconChartPie,
  IconActivity,
  IconInfoCircle,
  IconX,
} from "@tabler/icons-react";

export default function Analysis({ user }) {
  const [showHelp, setShowHelp] = useState(false);
  const {
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
  } = useAnalysisPage(user);

  return (
    <div className="w-full space-y-6 text-left">
      {/* Encabezado y Selector de Fechas */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-(--headings-color) tracking-tight">
            Análisis Financiero
          </h1>
          <p className="text-sm text-(--text-color)/85 mt-1">
            Estadísticas y desglose detallado de tus movimientos
          </p>
        </div>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row sm:items-center flex-wrap gap-3 w-full lg:w-auto">
          <div className="w-full sm:w-auto">
            <Select
              value={rangePreset}
              onChange={handlePresetChange}
              options={[
                { value: "este-mes", label: "Este Mes" },
                { value: "mes-anterior", label: "Mes Anterior" },
                { value: "ultimos-3-meses", label: "Últimos 3 Meses" },
                { value: "ultimos-6-meses", label: "Últimos 6 Meses" },
                { value: "este-ano", label: "Este Año" },
                { value: "personalizado", label: "Personalizado" },
              ]}
              btnClassName="!py-2 !text-xs min-w-36"
              className="w-full"
            />
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto grow">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-1.5 grow">
              <DateInput
                name="p_start_date"
                value={dateFilters.p_start_date}
                onChange={onDateInputChange}
                disabled={rangePreset !== "personalizado"}
                inputClassName="!py-2 !text-xs w-full"
                className="w-full sm:w-36"
              />
              <span className="text-xs text-(--text-color)/50 font-medium shrink-0 text-center sm:text-left">
                a
              </span>
              <DateInput
                name="p_end_date"
                value={dateFilters.p_end_date}
                onChange={onDateInputChange}
                disabled={rangePreset !== "personalizado"}
                inputClassName="!py-2 !text-xs w-full"
                className="w-full sm:w-36"
              />
            </div>
            <button
              className="p-2 rounded-xl border border-(--sidebar-border) bg-(--settings-card-bg) text-(--text-color) hover:text-(--sidebar-text-hover) hover:bg-(--sidebar-link-hover-bg) cursor-pointer transition-all duration-300 ease-in-out shrink-0 w-full sm:w-auto text-center flex justify-center items-center gap-2 mt-1 sm:mt-0"
              onClick={refetchAll}
              title="Actualizar datos"
            >
              <IconRefresh size={18} />
              <span className="sm:hidden text-xs font-semibold">Actualizar datos</span>
            </button>
          </div>
        </div>
      </div>

      {/* Fila de KPIs */}
      <div className="flex flex-col md:flex-row gap-6 mb-6">
        {/* KPI 1: Gastos del Periodo */}
        <div
          className="flex-1 min-w-0 bg-(--settings-card-bg) rounded-2xl p-6 transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-[0_10px_20px_rgba(0,0,0,0.03)] dark:hover:shadow-[0_10px_20px_rgba(0,0,0,0.15)]"
          style={{ border: "var(--card-border)" }}
        >
          <div className="flex justify-between items-start mb-3">
            <h2 className="text-xs font-semibold text-(--text-color) uppercase tracking-wider">
              Gastos del Periodo
            </h2>
            <IconArrowDownLeft
              size={20}
              className="text-(--danger-color) shrink-0"
            />
          </div>
          {loadingExpenses ? (
            <div className="flex items-center py-2">
              <div className="w-5 h-5 rounded-full border-2 border-(--primary-color) border-t-transparent animate-spin"></div>
            </div>
          ) : errorExpenses ? (
            <span className="text-(--danger-color) text-sm font-semibold">
              {errorExpenses}
            </span>
          ) : (
            <h3 className="text-3xl font-extrabold text-(--danger-color) tracking-tight">
              {formatCurrency(totalExpensesPeriod)}
            </h3>
          )}
          <p className="text-xs text-(--text-color)/70 mt-3">
            Total facturado entre el{" "}
            <span className="font-semibold text-(--headings-color)">
              {formatLocalDate(new Date(dateFilters.p_start_date))}
            </span>{" "}
            y el{" "}
            <span className="font-semibold text-(--headings-color)">
              {formatLocalDate(new Date(dateFilters.p_end_date))}
            </span>
          </p>
        </div>

        {/* KPI 2: Ahorro Neto Promedio (6m) */}
        <div
          className="flex-1 min-w-0 bg-(--settings-card-bg) rounded-2xl p-6 transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-[0_10px_20px_rgba(0,0,0,0.03)] dark:hover:shadow-[0_10px_20px_rgba(0,0,0,0.15)]"
          style={{ border: "var(--card-border)" }}
        >
          <div className="flex justify-between items-start mb-3">
            <h2 className="text-xs font-semibold text-(--text-color) uppercase tracking-wider">
              Ahorro Acumulado (6 Meses)
            </h2>
            <IconPigMoney
              size={20}
              className={`${sixMonthsKpis.netSavings >= 0 ? "text-(--success-color)" : "text-(--danger-color)"} shrink-0`}
            />
          </div>
          {loadingSixMonths ? (
            <div className="flex items-center py-2">
              <div className="w-5 h-5 rounded-full border-2 border-(--primary-color) border-t-transparent animate-spin"></div>
            </div>
          ) : errorSixMonths ? (
            <span className="text-(--danger-color) text-sm font-semibold">
              {errorSixMonths}
            </span>
          ) : (
            <h3
              className={`text-3xl font-extrabold tracking-tight ${
                sixMonthsKpis.netSavings >= 0
                  ? "text-(--success-color)"
                  : "text-(--danger-color)"
              }`}
            >
              {formatCurrency(sixMonthsKpis.netSavings)}
            </h3>
          )}
          <p className="text-xs text-(--text-color)/70 mt-3">
            Diferencia de ingresos y egresos históricos acumulados
          </p>
        </div>

        {/* KPI 3: Tasa de Ahorro Promedio (6m) */}
        <div
          className="flex-1 min-w-0 bg-(--settings-card-bg) rounded-2xl p-6 transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-[0_10px_20px_rgba(0,0,0,0.03)] dark:hover:shadow-[0_10px_20px_rgba(0,0,0,0.15)]"
          style={{ border: "var(--card-border)" }}
        >
          <div className="flex justify-between items-start mb-3">
            <h2 className="text-xs font-semibold text-(--text-color) uppercase tracking-wider">
              Tasa de Ahorro (6 Meses)
            </h2>
            <IconTrendingUp
              size={20}
              className="text-(--primary-color) shrink-0"
            />
          </div>
          {loadingSixMonths ? (
            <div className="flex items-center py-2">
              <div className="w-5 h-5 rounded-full border-2 border-(--primary-color) border-t-transparent animate-spin"></div>
            </div>
          ) : errorSixMonths ? (
            <span className="text-(--danger-color) text-sm font-semibold">
              {errorSixMonths}
            </span>
          ) : (
            <h3 className="text-3xl font-extrabold text-(--primary-color) tracking-tight">
              {sixMonthsKpis.savingsRate.toFixed(1)}%
            </h3>
          )}
          <p className="text-xs text-(--text-color)/70 mt-3">
            Porcentaje de ingresos guardados después de gastos
          </p>
        </div>
      </div>

      {/* Fila del Gráfico Temporal y Top 3 */}
      <div className="flex flex-col xl:flex-row gap-6 mb-6">
        {/* Gráfico 1: Evolución Temporal (Área) */}
        <div
          className="flex-2 min-w-0 bg-(--settings-card-bg) rounded-2xl p-6 transition-all duration-300 ease-in-out"
          style={{ border: "var(--card-border)" }}
        >
          <h3 className="text-lg font-bold text-(--headings-color) mb-6">
            Evolución de Ingresos y Gastos
          </h3>
          <div className="h-87.5 relative">
            {loadingSixMonths ? (
              <div className="flex flex-col items-center justify-center h-full gap-3">
                <div className="w-8 h-8 rounded-full border-2 border-(--primary-color) border-t-transparent animate-spin"></div>
                <span className="text-sm font-medium text-(--text-color)">
                  Cargando evolución temporal...
                </span>
              </div>
            ) : errorSixMonths ? (
              <div className="flex items-center justify-center h-full text-(--danger-color) text-sm font-semibold">
                {errorSixMonths}
              </div>
            ) : sortedEvolutionData.length > 0 ? (
              <Line data={evolutionChartData} options={evolutionChartOptions} />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-(--text-color)/70 gap-2">
                <IconActivity size={40} className="stroke-[1.5]" />
                <span className="text-sm font-medium">
                  No hay suficientes datos históricos.
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Gráfico 3: Top 3 Categorías con Más Gastos (HTML NATIVO) */}
        <div
          className="flex-1 min-w-0 bg-(--settings-card-bg) rounded-2xl p-6 transition-all duration-300 ease-in-out"
          style={{ border: "var(--card-border)" }}
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-(--headings-color)">
              Top 3 Gastos del Periodo
            </h3>
            <button
              onClick={() => setShowHelp(!showHelp)}
              className="flex items-center justify-center p-1.5 rounded-xl text-(--text-color)/50 hover:text-(--headings-color) hover:bg-(--bg-light) transition-all duration-300 cursor-pointer focus:outline-none"
              title="Información de la sección"
            >
              <IconInfoCircle size={18} />
            </button>
          </div>

          {/* Ayuda colapsable interactiva responsiva */}
          {showHelp && (
            <div className="relative mb-6 p-4 bg-(--bg-light) border border-(--sidebar-border) rounded-2xl text-xs text-(--text-color)/85 flex gap-3 items-start animate-fadeIn">
              <div className="flex-1 space-y-1.5">
                <p className="font-bold text-(--headings-color)">¿Cómo se calculan estos porcentajes?</p>
                <p className="leading-relaxed">
                  La barra de color principal indica la proporción del gasto de la categoría sobre el <strong>total de gastos del período</strong>.
                </p>
                <p className="leading-relaxed">
                  Si la categoría tiene un <strong>presupuesto establecido</strong> para este mes, debajo se mostrará una barra de progreso e indicador de consumo de ese presupuesto.
                </p>
              </div>
              <button
                onClick={() => setShowHelp(false)}
                className="text-(--text-color)/40 hover:text-(--headings-color) p-1 rounded-lg hover:bg-(--sidebar-border)/40 transition-colors cursor-pointer"
              >
                <IconX size={14} />
              </button>
            </div>
          )}

          <div className="min-h-87.5 flex flex-col justify-center gap-6">
            {loadingExpenses || loadingBudgets ? (
              <div className="flex flex-col items-center justify-center h-full gap-3 py-10">
                <div className="w-8 h-8 rounded-full border-2 border-(--primary-color) border-t-transparent animate-spin"></div>
                <span className="text-sm font-medium text-(--text-color)">
                  Cargando top gastos y presupuestos...
                </span>
              </div>
            ) : errorExpenses ? (
              <div className="flex items-center justify-center h-full text-(--danger-color) text-sm font-semibold py-10">
                {errorExpenses}
              </div>
            ) : top3Categories.length > 0 ? (
              <div className="flex flex-col gap-6 w-full">
                {top3Categories.map((cat, idx) => {
                  const percentage =
                    totalExpensesPeriod > 0
                      ? (Number(cat.total_amount) / totalExpensesPeriod) * 100
                      : 0;
                  const IconComponent =
                    iconDictionary[cat.category_icon] ||
                    iconDictionary.IconCoin;
                  const catColor =
                    categoryColorMap[cat.category_name] || "#64748b";

                  // Buscar presupuesto correspondiente
                  const budget = budgets?.find(
                    (b) => b.category_name === cat.category_name
                  );
                  const budgetPercentage = budget
                    ? (budget.spent / budget.total_budget) * 100
                    : 0;
                  const isOverBudget = budget ? budget.remaining < 0 : false;

                  return (
                    <div
                      key={cat.category_name}
                      className="group flex flex-col gap-3 w-full p-1 transition-all duration-300 hover:translate-x-1"
                    >
                      <div className="flex justify-between items-center w-full">
                        <div className="flex items-center gap-3">
                          <div
                            className="flex items-center justify-center w-9 h-9 rounded-xl shrink-0"
                            style={{
                              backgroundColor: `${catColor}15`,
                              color: catColor,
                            }}
                          >
                            <IconComponent size={18} />
                          </div>
                          <div>
                            <span className="font-bold text-sm text-(--headings-color) block">
                              {cat.category_name}
                            </span>
                            <span className="text-xs text-(--text-color)/70 block">
                              Top {idx + 1} del período
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-extrabold text-sm text-(--headings-color) block">
                            {formatCurrency(cat.total_amount)}
                          </span>
                          <span className="text-xs font-semibold text-(--text-color)/60 block">
                            {percentage.toFixed(1)}% del total
                          </span>
                        </div>
                      </div>

                      {/* Contenedor de las barras */}
                      <div className="flex flex-col gap-2.5 w-full">
                        {/* Barra 1: Porcentaje del periodo */}
                        <div className="w-full h-2 bg-(--bg-light) rounded-full overflow-hidden" title="Peso sobre el total de egresos del periodo">
                          <div
                            className="h-full rounded-full transition-all duration-1000 ease-out"
                            style={{
                              width: `${percentage}%`,
                              backgroundColor: catColor,
                            }}
                          ></div>
                        </div>

                        {/* Barra 2: Progreso de presupuesto si existe */}
                        {budget ? (
                          <div className="flex flex-col gap-1.5 mt-0.5 p-2 bg-(--bg-light)/20 rounded-xl border border-(--sidebar-border)/40">
                            <div className="flex justify-between items-center text-[11px] font-medium leading-none">
                              <span className="text-(--text-color)/60">
                                Presupuesto: {formatCurrency(budget.total_budget)}
                              </span>
                              <span className={isOverBudget ? "text-(--danger-color) font-bold" : "text-(--success-color) font-bold"}>
                                {isOverBudget
                                  ? `Excedido por ${formatCurrency(Math.abs(budget.remaining))}`
                                  : `${budgetPercentage.toFixed(0)}% consumido`}
                              </span>
                            </div>
                            <div className="w-full h-1.5 bg-(--bg-light) rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-1000 ease-out"
                                style={{
                                  width: `${Math.min(budgetPercentage, 100)}%`,
                                  backgroundColor: isOverBudget
                                    ? "var(--danger-color)"
                                    : "var(--success-color)",
                                }}
                              ></div>
                            </div>
                          </div>
                        ) : (
                          <div className="flex justify-between items-center text-[10px] mt-0.5 text-(--text-color)/50 font-medium px-1">
                            <span>Sin presupuesto establecido</span>
                            <Link
                              to="/budgets"
                              className="text-(--primary-color) hover:text-(--primary-color)/85 font-bold transition-colors flex items-center gap-0.5"
                            >
                              + Crear presupuesto
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-(--text-color)/70 gap-2 py-10">
                <IconChartPie size={40} className="stroke-[1.5]" />
                <span className="text-sm font-medium">
                  Sin gastos en este periodo.
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fila del Gráfico de Dona: Distribución de Gastos */}
      <div
        className="w-full bg-(--settings-card-bg) rounded-2xl p-6 transition-all duration-300 ease-in-out"
        style={{ border: "var(--card-border)" }}
      >
        <h3 className="text-lg font-bold text-(--headings-color) mb-6">
          Desglose de Gastos por Categoría
        </h3>

        {loadingExpenses ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-(--primary-color) border-t-transparent animate-spin"></div>
            <span className="text-sm font-medium text-(--text-color)">
              Cargando desglose...
            </span>
          </div>
        ) : errorExpenses ? (
          <div className="text-center py-16 text-(--danger-color) text-sm font-semibold">
            {errorExpenses}
          </div>
        ) : expensesByCategory.length > 0 ? (
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Gráfico de dona con indicador centrado */}
            <div className="w-full md:w-1/2 h-75 relative flex items-center justify-center">
              <Doughnut
                data={categoryChartData}
                options={categoryChartOptions}
              />
              <div className="absolute flex flex-col items-center justify-center text-center pointer-events-none">
                <span className="text-[10px] font-bold text-(--text-color)/60 uppercase tracking-widest">
                  Total Gastado
                </span>
                <span className="text-xl font-extrabold text-(--headings-color) mt-1">
                  {formatCurrency(totalExpensesPeriod)}
                </span>
              </div>
            </div>

            {/* Leyenda Premium */}
            <div className="w-full md:w-1/2">
              <div className="flex flex-col gap-2 overflow-y-auto max-h-75 pr-2 scrollbar-thin">
                {expensesByCategory.map((cat, idx) => {
                  const percentage =
                    totalExpensesPeriod > 0
                      ? (Number(cat.total_amount) / totalExpensesPeriod) * 100
                      : 0;
                  const IconComponent =
                    iconDictionary[cat.category_icon] ||
                    iconDictionary.IconCoin;
                  const color = CATEGORY_COLORS[idx % CATEGORY_COLORS.length];

                  return (
                    <div
                      key={cat.category_name}
                      className="flex items-center justify-between p-3 rounded-xl border-b border-(--sidebar-border)/40 hover:bg-(--sidebar-link-hover-bg) transition-all duration-300 ease-in-out"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="flex items-center justify-center text-white rounded-xl shrink-0 shadow-xs"
                          style={{
                            backgroundColor: color,
                            width: "40px",
                            height: "40px",
                          }}
                        >
                          <IconComponent size={20} />
                        </div>
                        <div>
                          <span className="font-semibold text-sm text-(--headings-color) block">
                            {cat.category_name}
                          </span>
                          <span className="text-xs text-(--text-color)/70 block mt-0.5">
                            {percentage.toFixed(1)}% del total
                          </span>
                        </div>
                      </div>
                      <span className="font-bold text-sm text-(--headings-color)">
                        {formatCurrency(cat.total_amount)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-(--text-color)/70 gap-2">
            <IconChartPie size={48} className="stroke-[1.5] mb-1" />
            <span className="text-sm font-medium">
              No se registraron gastos para las categorías en este periodo.
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
