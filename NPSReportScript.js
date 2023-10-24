import sendZapierPost from "./zapierWebhook.js";
import fecthHistoricalData from "./apiRequest.js";
import dayjs from "dayjs";

const NPSReport = async (tenant, idsArray, token) => {
  console.log(idsArray.length + " Sms sents today.");

  let data = await fecthHistoricalData(tenant, token);
  const extractedFields = [
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
  ];

  const convertedData = data.map((item) => {
    const newItem = {};
    for (const field of extractedFields) {
      const fieldValue = item.items.find((i) => i.key === field)?.value;
      newItem[field] = fieldValue ? fieldValue : "";
    }
    return newItem;
  });

  const uniqueData = convertedData.filter((item) => {
    const a = item.transactionId;
    const b = item.finishedTime.value;
    const c = item.queueName;

    const transId = parseInt(item.transactionId);
    if (idsArray.indexOf(transId) != -1) {
    } else {
      idsArray.push(transId);
      item.tenant = "prepaypower";
      console.log({ a, b, c });
      return item;
    }
  });

  console.log(`${uniqueData.length} new interactions`);
  // Loop through your data and update finishedTime
  uniqueData.forEach((item) => {
    if (item.time && item.time.value) {
      item.time = dayjs(item.time.value).format("HH:mm:ss DD/MM/YYYY");
    }
    if (
      item.originalInteractionId == "" ||
      item.originalInteractionId == null ||
      item.originalInteractionId == undefined
    ) {
      item.transferred = false;
    } else {
      item.transferred = true;
    }
  });
  const convertedJSON = JSON.stringify(uniqueData, null, 2); // The second argument is for formatting
  // console.log(convertedJSON);
  if (uniqueData.length > 0) {
    await sendZapierPost(convertedJSON);
  }
};

export default NPSReport;
