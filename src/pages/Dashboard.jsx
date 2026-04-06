import { TransactionForm } from "../components/TransactionForm";
import { TransactionTable } from "../components/TransactionTable";

export default function Dashboard({ user }) {
  const refreshData = () => {
    console.log("Data refreshed");
  };

  return (
    <>
      <h1>Hola desde el dashboard</h1>
      <TransactionForm onTransactionAdded={refreshData} user={user} />
      <TransactionTable limit={5} user={user} />
    </>
  );
}
