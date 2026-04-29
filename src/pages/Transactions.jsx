import { TransactionTable } from "../components/TransactionTable";
import { TransactionForm } from "../components/TransactionForm";
import { useState } from "react";

export default function Transactions({ user }) {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const refreshData = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <>
      <h1>Transacciones</h1>
      <TransactionForm onTransactionAdded={refreshData} user={user} />
      <TransactionTable user={user} trigger={refreshTrigger} />
    </>
  );
}
