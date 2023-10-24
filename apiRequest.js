import getToken from "./token.js";
import dayjs from "dayjs";
import axios from "axios";

const requestReport = async (token) => {
  const timestampEnd = dayjs().add(1, "hour").toISOString();
  const timestampStart = dayjs(timestampEnd)
    .subtract(15, "minutes")
    .toISOString();

  const response = await axios.post(
    "https://api.8x8.com/eu/analytics/cc/v6/historical-metrics/",

    {
      dateRange: {
        start: `${timestampStart}`,
        end: `${timestampEnd}`,
      },
      intraDayTimeRange: {
        start: dayjs().subtract(15, "minute").format("HH:mm:ss"),
        end: dayjs().format("HH:mm:ss"),
      },
      type: "detailed-reports-interaction-details",
      title: "Call report to send NPS",
      // granularity: "15m",
      metrics: [
        "channelId",
        "finishedTime",
        "customerName",
        "participantName",
        "mediaType",
        "customerName",
        "queueName",
        "queueId",
        "outcome",
        "direction",
        "transactionId",
        "interactionLabels",
        "originalInteractionId",
      ],

      searchQuery: [
        {
          field: "interactionLabels",
          operator: "in",
          value: ["handled"],
        },
        {
          field: "direction",
          operator: "in",
          value: ["inbound"],
        },
        {
          field: "queueId",
          operator: "in",
          value: ["141", "142", "132", "144", "110", "1589"],
        },
      ],
    },

    {
      headers: {
        Authorization: "Bearer " + token,
      },
      "Content-Type": " application/json",
    }
  );
  console.log(response);
  const reportId = response.data.id;
  return reportId;
};

//CHECK REPORT STATUS, REPORT WILL ONLY AVAILABLE TO DOWNLOAD OR GET DATA AFTER -- DONE -- STATUS

const reportStatus = async (token, id) => {
  const url = `https://api.8x8.com/eu/analytics/cc/v6/historical-metrics/${id}/status`;
  const response = axios.get(url, {
    headers: {
      accept: "application/json;charset=UTF-8",
      Authorization: "Bearer " + token,
    },
  });
  return response;
};

// AFTER DONE STATUS - WE NEED TO REQUEST THE DATA, SIZE LIMIT IS 10 -- 1000
const reportData = async (token, id) => {
  const url = `https://api.8x8.com/eu/analytics/cc/v6/historical-metrics/${id}/data?size=1000`;
  const response = axios.get(url, {
    headers: {
      accept: "application/json;charset=UTF-8",
      Authorization: "Bearer " + token,
    },
  });

  return response;
};

const fecthHistoricalData = async (tenant, token) => {
  try {
    //INITIAL REQUEST THAT RETURN REPORT ID
    const id = await requestReport(token).then((response) => {
      return response;
    });
    console.log("Requesting the report: " + id);
    //CHECK REPORT STATUS
    let status = await reportStatus(token, id).then((response) => {
      console.log(`Report ${response.data.status}`);
      return response.data.status;
    });

    // create a looping to check every second if the report is done.
    let count = 1;
    let data;
    try {
      if (status == "IN_PROGRESS") {
        while (status == "IN_PROGRESS" && count < 10) {
          status = await reportStatus(token, id).then((response) => {
            return response.data.status;
          });
          await new Promise((resolve) => setTimeout(resolve, 3000));
          console.log(status);
          count++;
        }
      }
      //STORE THE DATA WHEN REPORT IS DONE
      data = await reportData(token, id).then((response) => {
        return response.data;
      });
      return data;
    } catch (error) {
      console.log("unable to fetch data at " + dayjs("HH:mm DD/MM/YYYY"));
    }
  } catch (error) {
    console.log(error);
  }
};

export default fecthHistoricalData;
