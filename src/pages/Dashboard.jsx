import { TransactionForm } from "../components/TransactionForm";
import { TransactionTable } from "../components/TransactionTable";

export default function Dashboard() {
  const refreshData = () => {
    console.log("Data refreshed");
  };

  return (
    <>
      <h1>Hola desde el dashboard</h1>
      <TransactionForm onTransactionAdded={refreshData} />
      <TransactionTable limit={5} />
    </>
  );
}
