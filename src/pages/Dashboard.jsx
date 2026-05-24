import { TransactionForm } from "../components/TransactionForm";
import { TransactionTable } from "../components/TransactionTable";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { formatCurrency } from "../utilities/formatters";
import { useTransactions } from "../hooks/useTransactions";
import { useAuth } from "../contexts/AuthContext";

export default function Dashboard({ user }) {
  const { profile } = useAuth();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
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
  const [loading, setLoading] = useState(true);

  const refreshData = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

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

  const fetchTransactions = async (signal) => {
    setLoading(true);
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
    } catch (error) {
      const isAbortError =
        error.message?.includes("AbortError") || error.name === "AbortError";
      if (!isAbortError) {
        console.error("Error al obtener el resumen financiero:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      const controller = new AbortController();
      fetchTransactions(controller.signal);
      return () => controller.abort();
    }
  }, [user?.id, refreshTrigger]);

  return (
    <div className="container-fluid py-4">
      <header className="mb-4">
        <h1 className="fw-bold">Panel de Control</h1>
        <p className="text-muted">Bienvenido de nuevo, {profile?.fullname || user.email}</p>
      </header>

      {/* Tarjetas de Resumen */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card border-0 shadow-sm bg-primary text-white h-100">
            <div className="card-body">
              <h6 className="card-subtitle mb-2 opacity-75">Balance Total</h6>
              <h2 className="card-title fw-bold">
                {formatCurrency(summary.balance)}
              </h2>
              <div className="mt-3 small">
                <span className="me-2 text-white-50">
                  Ingresos: {formatCurrency(summary.total_income)}
                </span>
                <span className="text-white-50">
                  Gastos: {formatCurrency(summary.total_expense)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <h6 className="card-subtitle mb-2 text-muted">Este Mes</h6>
              <h2
                className={`card-title fw-bold ${monthlySummary.balance >= 0 ? "text-success" : "text-danger"}`}
              >
                {formatCurrency(monthlySummary.balance)}
              </h2>
              <div className="mt-3 small d-flex justify-content-between">
                <span className="text-success">
                  ↑ {formatCurrency(monthlySummary.total_income)}
                </span>
                <span className="text-danger">
                  ↓ {formatCurrency(monthlySummary.total_expense)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card border-0 shadow-sm h-100 d-flex align-items-center justify-content-center p-3">
            <button
              className="btn btn-outline-primary w-100 h-100 py-3"
              onClick={refreshData}
            >
              <i className="bi bi-arrow-clockwise me-2"></i> Actualizar Datos
            </button>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-lg-4 mb-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-transparent border-0 py-3">
              <h5 className="mb-0 fw-bold">Nueva Transacción</h5>
            </div>
            <div className="card-body">
              <TransactionForm onTransactionAdded={refreshData} user={user} />
            </div>
          </div>
        </div>
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-transparent border-0 py-3 d-flex justify-content-between align-items-center">
              <h5 className="mb-0 fw-bold">Movimientos Recientes</h5>
              <button className="btn btn-sm btn-light">Ver todo</button>
            </div>
            <div className="card-body p-0">
              <TransactionTable
                transactions={transactions}
                loading={loadingTransactions}
                viewMode={viewMode}
                setViewMode={setViewMode}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
