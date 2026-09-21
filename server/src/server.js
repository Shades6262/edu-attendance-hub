require('dns').setServers(['8.8.8.8', '8.8.4.4']);
require('dotenv').config()
const express = require('express')
const cors = require('cors')
const connectDB = require('../config/db')
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const groupRoutes = require('./routes/groupRoutes');
const assignmentRoutes = require('./routes/assignmentRoutes');
const submissionRoutes = require('./routes/submissionRoutes');
// console.log('MONGO_URI:', process.env.MONGO_URI);
connectDB()

const app = express()
app.use(cors())
app.use(express.json())
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/submissions', submissionRoutes);
app.get('/api/health', (req, res) => {
    res.json({ message: 'Server is healthy' })
});

const PORT = process.env.PORT || 6262
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`))





