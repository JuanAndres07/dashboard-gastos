import { TransactionForm } from "../components/TransactionForm";
import { TransactionTable } from "../components/TransactionTable";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export default function Dashboard({ user }) {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [summary, setSummary] = useState({ total_income: 0, total_expense: 0, balance: 0 });
  const [monthlySummary, setMonthlySummary] = useState({ total_income: 0, total_expense: 0, balance: 0 });
  const [loading, setLoading] = useState(true);

  const refreshData = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();

      // Ejecutar ambas llamadas en paralelo usando Promise.all
      const [allResponse, monthResponse] = await Promise.all([
        supabase.rpc("get_financial_summary", {
          p_user_id: user.id,
          p_start_date: null,
          p_end_date: null,
        }),
        supabase.rpc("get_financial_summary", {
          p_user_id: user.id,
          p_start_date: startOfMonth,
          p_end_date: endOfMonth,
        }),
      ]);

      const { data: allData, error: allError } = allResponse;
      const { data: monthData, error: monthError } = monthResponse;

      if (allError) throw allError;
      if (monthError) throw monthError;

      // Asumimos que la función retorna un array con un objeto o un objeto directamente
      if (allData) setSummary(Array.isArray(allData) ? allData[0] : allData);
      if (monthData) setMonthlySummary(Array.isArray(monthData) ? monthData[0] : monthData);

    } catch (error) {
      console.error("Error al obtener el resumen financiero:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchTransactions();
    }
  }, [user?.id, refreshTrigger]);

  return (
    <div className="container-fluid py-4">
      <header className="mb-4">
        <h1 className="fw-bold text-dark">Panel de Control</h1>
        <p className="text-muted">Bienvenido de nuevo, {user.email}</p>
      </header>

      {/* Tarjetas de Resumen */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card border-0 shadow-sm bg-primary text-white h-100">
            <div className="card-body">
              <h6 className="card-subtitle mb-2 opacity-75">Balance Total</h6>
              <h2 className="card-title fw-bold">{summary.balance}</h2>
              <div className="mt-3 small">
                <span className="me-2 text-white-50">Ingresos: {summary.total_income}</span>
                <span className="text-white-50">Gastos: {summary.total_expense}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-md-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <h6 className="card-subtitle mb-2 text-muted">Este Mes</h6>
              <h2 className={`card-title fw-bold ${monthlySummary.balance >= 0 ? 'text-success' : 'text-danger'}`}>
                {monthlySummary.balance}
              </h2>
              <div className="mt-3 small d-flex justify-content-between">
                <span className="text-success">↑ {monthlySummary.total_income}</span>
                <span className="text-danger">↓ {monthlySummary.total_expense}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4">
           {/* Espacio para otra métrica o acción rápida */}
           <div className="card border-0 shadow-sm h-100 d-flex align-items-center justify-content-center p-3">
              <button className="btn btn-outline-primary w-100 h-100 py-3" onClick={refreshData}>
                <i className="bi bi-arrow-clockwise me-2"></i> Actualizar Datos
              </button>
           </div>
        </div>
      </div>

      <div className="row">
        <div className="col-lg-4 mb-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-0 py-3">
              <h5 className="mb-0 fw-bold">Nueva Transacción</h5>
            </div>
            <div className="card-body">
              <TransactionForm onTransactionAdded={refreshData} user={user} />
            </div>
          </div>
        </div>
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-0 py-3 d-flex justify-content-between align-items-center">
              <h5 className="mb-0 fw-bold">Movimientos Recientes</h5>
              <button className="btn btn-sm btn-light">Ver todo</button>
            </div>
            <div className="card-body p-0">
              <TransactionTable limit={5} user={user} trigger={refreshTrigger} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
