import { seedBatch } from "./seed";

async function run() {
  try {
    await seedBatch(10);
    console.log("Success");
  } catch (e) {
    console.error(e);
  }
  process.exit(0);
}
run();
