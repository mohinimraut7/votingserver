const axios = require("axios");
const aws4 = require("aws4");

async function uploadToR2(filename, buffer, contentType = "image/webp") {
  const bucket = process.env.R2_BUCKET;
  const key = `voters/${filename}`;
  const host = `${process.env.ACCOUNT_ID}.r2.cloudflarestorage.com`;
  
  // Create AWS Signature V4
  const opts = {
    service: 's3',
    region: 'auto',
    method: 'PUT',
    host: host,
    path: `/${bucket}/${key}`,
    headers: {
      'Content-Type': contentType,
      'Content-Length': buffer.length,
    },
    body: buffer,
  };
  
  // Sign the request
  aws4.sign(opts, {
    accessKeyId: process.env.ACCESS_KEY,
    secretAccessKey: process.env.SECRET_KEY,
  });
  
  // Upload with axios
  const response = await axios({
    method: 'PUT',
    url: `https://${host}/${bucket}/${key}`,
    data: buffer,
    headers: opts.headers,
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
    timeout: 60000,
  });
  
  return response.status === 200;
}

module.exports = { uploadToR2 };