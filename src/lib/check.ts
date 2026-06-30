import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "./firebase";

async function check() {
  const companiesRef = collection(db, "companies");
  const q = query(companiesRef);
  const docs = await getDocs(q);
  console.log(`Total companies in DB: ${docs.size}`);
}
check().catch(console.error);
