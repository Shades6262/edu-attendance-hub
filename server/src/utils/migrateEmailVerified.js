require('dotenv').config();
const mongoose = require('mongoose');

(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  const r = await mongoose.connection
    .collection('users')
    .updateMany({ emailVerified: { $exists: false } }, { $set: { emailVerified: true } });
  console.log('Marked existing users as verified:', r.modifiedCount);
  process.exit();
})();