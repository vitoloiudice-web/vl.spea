import { collection, doc, writeBatch } from "firebase/firestore";
import { db } from "./firebase";
import { data } from "../data";

export async function seedBatch(batchNumber: number) {
  const batch = writeBatch(db);
  const companiesRef = collection(db, "companies");

  // Add the batch property to each document
  data.forEach((company) => {
    const docRef = doc(companiesRef, company.id);
    batch.set(docRef, { ...company, batch: batchNumber });
  });

  await batch.commit();
  console.log(`Batch ${batchNumber} seeded successfully!`);
}
