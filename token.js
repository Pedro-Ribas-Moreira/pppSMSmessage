import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const getToken = async (arg) => {
  try {
    console.log("request API token for " + arg);
    let api_username;
    let api_password;
    let api_encoded;

    if (arg == "prepaypower") {
      // Prepayopwer
      api_username = process.env.API_USERNAME_PPP;
      api_password = process.env.API_PASSWORD_PPP;
      api_encoded = process.env.API_ENCODED_PPP;
    } else if (arg == "yuno") {
      // YunoEnergy
      api_username = process.env.API_USERNAME_YUNO;
      api_password = process.env.API_PASSWORD_YUNO;
      api_encoded = process.env.API_ENCODED_YUNO;
    }

    const response = await axios.post(
      "https://api.8x8.com/oauth/v2/token",
      {
        username: api_username,
        password: api_password,
      },
      {
        headers: {
          Authorization: `Basic ${api_encoded}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    const access_token = response.data.access_token;
    return access_token;
  } catch (error) {
    console.log("Error", error.message);
  }
};

export default getToken;
