const app=require('./src/app');
const connectDB=require('./src/db/db');
require('dotenv').config();

connectDB();

// Seed a default admin in development if none exists
const mongoose = require('mongoose');
const Admin = require('./src/models/admin.model');
const bcrypt = require('bcryptjs');

mongoose.connection.once('connected', async () => {
    try {
        const email = process.env.DEV_ADMIN_EMAIL || 'admin@cravvio.com';
        const existing = await Admin.findOne({ email });
        if (!existing) {
            const hashed = await bcrypt.hash(process.env.DEV_ADMIN_PASS || 'admin123', 10);
            const admin = await Admin.create({ username: 'Admin', email, password: hashed, phone: '0000000000', address: 'NA', pincode: '000000' });
            console.log('Dev admin created:', admin.email);
        } else {
            console.log('Dev admin exists:', existing.email);
        }
    } catch (err) {
        console.error('Error creating dev admin', err);
    }
});





const PORT = process.env.PORT || 3000;
app.listen(PORT, {},()=>{
    console.log(`Server is running on port ${PORT}`); 
});