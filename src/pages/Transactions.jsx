import { TransactionTable } from "../components/TransactionTable";

export default function Transactions({ user }) {
  return (
    <>
      <h1>Transacciones</h1>
      <TransactionTable user={user} />
    </>
  );
}
