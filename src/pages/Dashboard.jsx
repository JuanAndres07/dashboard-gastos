import { TransactionForm } from "../components/TransactionForm";

export default function Dashboard() {
  const refreshData = () => {
    console.log("Data refreshed");
  };

  return (
    <>
      <h1>Hola desde el dashboard</h1>
      <TransactionForm onTransactionAdded={refreshData} />
    </>
  );
}
