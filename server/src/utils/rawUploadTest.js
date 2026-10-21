require('dotenv').config();
const crypto = require('crypto');

const timestamp = Math.floor(Date.now() / 1000);
const signature = crypto
  .createHash('sha1')
  .update(`timestamp=${timestamp}${process.env.CLOUDINARY_API_SECRET}`)
  .digest('hex');

const form = new FormData();
form.append('file', 'https://res.cloudinary.com/demo/image/upload/sample.jpg');
form.append('api_key', process.env.CLOUDINARY_API_KEY);
form.append('timestamp', String(timestamp));
form.append('signature', signature);

fetch(`https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`, {
  method: 'POST',
  body: form,
})
  .then(async (r) => {
    console.log('STATUS:', r.status);
    console.log('SERVER HEADER:', r.headers.get('server'));
    console.log('BODY:', await r.text());
  })
  .catch((e) => console.log('FETCH ERROR:', e));