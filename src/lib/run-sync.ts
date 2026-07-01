import { seedAll, clearAll } from './seed';

async function main() {
  try {
    console.log("Starting full database synchronization...");
    // Clear old data to ensure consistency with the new real dataset
    await clearAll();
    console.log("Database cleared.");
    
    // Seed new data
    await seedAll();
    console.log("Database synchronized with real data (Batches 1-10, 1400 companies).");
    process.exit(0);
  } catch (error) {
    console.error("Synchronization failed:", error);
    process.exit(1);
  }
}

main();
