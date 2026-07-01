import { collection, doc, writeBatch, getDocs } from "firebase/firestore";
import { db } from "./firebase";
import { data } from "../data";

export async function seedBatch(batchNumber: number) {
  const batch = writeBatch(db);
  const companiesRef = collection(db, "companies");

  // Only seed companies that belong to this batch
  const companiesToSeed = data.filter(c => c.batch === batchNumber);

  companiesToSeed.forEach((company) => {
    const docRef = doc(companiesRef, company.id);
    batch.set(docRef, company);
  });

  await batch.commit();
  console.log(`Batch ${batchNumber} seeded with ${companiesToSeed.length} companies!`);
}

export async function seedAll() {
  const batch = writeBatch(db);
  const companiesRef = collection(db, "companies");

  data.forEach((company) => {
    const docRef = doc(companiesRef, company.id);
    batch.set(docRef, company);
  });

  await batch.commit();
  console.log(`All companies seeded successfully!`);
}

export async function clearAll() {
  const querySnapshot = await getDocs(collection(db, "companies"));
  const batch = writeBatch(db);
  querySnapshot.forEach((doc) => {
    batch.delete(doc.ref);
  });
  await batch.commit();
  console.log("Database cleared!");
}
