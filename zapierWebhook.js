import axios from "axios";

const sendZapierPost = async (payload) => {
  const convertedJSON = JSON.stringify(payload, null, 2); // The second argument is for formatting
  const zapierHook = "https://hooks.zapier.com/hooks/catch/15964729/3ip31y7/";
  // Remember to include a Content-Type header set to application/json in your request.
  try {
    const response = await axios.post(zapierHook, convertedJSON, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    console.log(`Zapier response code: ${response.status}`);
  } catch (error) {
    console.error(error.message);
  }
};

export default sendZapierPost;
