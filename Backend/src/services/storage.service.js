

const ImageKit = require("imagekit");
require("dotenv").config();

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

module.exports = imagekit;
async function uploadImage(file,fileName){
    const result= await imagekit.upload({
        file:file, // required
        fileName:fileName //required
    });
    return result;
}

module.exports = { uploadImage };