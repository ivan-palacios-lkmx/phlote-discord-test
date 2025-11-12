/* eslint-disable @typescript-eslint/no-require-imports */
const { InfuraProvider } = require("ethers");
const fetch = require("cross-fetch");
const _ = require("lodash");

// Get profile data from OpenSea
const getOsData = async (address) => {
  if (!process.env.OS_API_KEY) return false;
  const base = "https://api.opensea.io/api/v1";
  try {
    const result = await fetch(`${base}/account/${address}`, {
      headers: {
        "X-API-KEY": process.env.OS_API_KEY,
      },
    }).then((r) => r.json());
    const osUsername = _.get(result, "data.user.username");

    if (osUsername) {
      let out = {
        osUsername,
      };

      // Detect custom image
      const image = _.get(result, "data.profile_img_url", "");
      if (image && !/\/opensea-static\//.test(image)) {
        out.profileImageURL = image;
      }

      return out;
    } else {
      return false;
    }
  } catch (err) {
    console.log("Error resolving OpenSea: ", err);
    return false;
  }
};

// Get ENS data
const provider = new InfuraProvider("mainnet", process.env.INFURA_ID);
const getEnsData = async (address) => {
  const name = await provider.lookupAddress(address);

  let avatar;
  if (name) avatar = await provider.getAvatar(name);

  return {
    name: name || false,
    avatar: avatar || false,
  };
};

module.exports = {
  getEnsData,
  getOsData,
};
