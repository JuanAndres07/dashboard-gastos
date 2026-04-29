import { TransactionForm } from "../components/TransactionForm";
import { TransactionTable } from "../components/TransactionTable";
import { useState } from "react";

export default function Dashboard({ user }) {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const refreshData = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <>
      <h1>Hola desde el dashboard</h1>
      <TransactionForm onTransactionAdded={refreshData} user={user} />
      <TransactionTable limit={5} user={user} trigger={refreshTrigger} />
    </>
  );
}
