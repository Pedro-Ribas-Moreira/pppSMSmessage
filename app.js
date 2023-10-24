import dayjs from "dayjs";
import NPSReport from "./NPSReportScript.js";
import cron from "node-cron";
import getToken from "./token.js";

let prepayPowerToken = await getToken("prepaypower");
let PrepayTransactionsIdsRecord = [];

await NPSReport("prepaypower", PrepayTransactionsIdsRecord, prepayPowerToken);

const refresTokens = async () => {
  console.log("refreshing access token " + dayjs().format("HH:mm"));
  try {
    prepayPowerToken = await getToken("prepaypower");
    console.log("access token refreshed");
  } catch (error) {
    console.log("something went wrong while refreshing access tokens " + error);
  }
};

const mainSchedule = "* 7-22 * * *";
const mainTask = cron.schedule(mainSchedule, async () => {
  console.log("Running job..." + dayjs().format("DD/MM HH:mm:ss"));
  await NPSReport("prepaypower", PrepayTransactionsIdsRecord, prepayPowerToken);
});

const tokenSchedule = "*/15 7-22 * * *";
const tokenTask = cron.schedule(tokenSchedule, async () => {
  console.log("Running job..." + dayjs().format("DD/MM HH:mm:ss"));
  await refresTokens();
});

await mainTask.start();
await tokenTask.start();

// Start the loop
// runAbnReportLoop();
// Graceful shutdown function
const gracefulShutdown = async () => {
  console.log("Received signal to shut down gracefully.");
  // You can add any cleanup logic here
  // Exit the process
  await mainTask.stop();
  await tokenTask.stop();

  process.exit(0);
};

// Listen for SIGINT (Ctrl+C) and SIGTERM (kill command) signals
process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);
