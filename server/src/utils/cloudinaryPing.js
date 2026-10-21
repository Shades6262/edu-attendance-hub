require('dotenv').config();
const cloudinary = require('cloudinary').v2;


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


console.log('cloud_name:', JSON.stringify(process.env.CLOUDINARY_CLOUD_NAME));
console.log('api_key present:', !!process.env.CLOUDINARY_API_KEY);
console.log('api_secret present:', !!process.env.CLOUDINARY_API_SECRET);


cloudinary.api
  .ping()
  .then((res) => console.log('PING OK:', res))
  .catch((err) => console.log('PING FAILED:', err));
