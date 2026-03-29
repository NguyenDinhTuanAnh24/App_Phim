// server/index.js
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Cấu hình kết nối MySQL (thông tin này bạn lấy từ MySQL Workbench)
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'app_phim_db'
};

console.log('--- Thông số kết nối ---');
console.log('Host:', dbConfig.host);
console.log('User:', dbConfig.user);
console.log('Database:', dbConfig.database);
console.log('Password Length:', dbConfig.password.length);
console.log('------------------------');

const db = mysql.createConnection(dbConfig);

db.connect((err) => {
    if (err) {
        console.error('Lỗi kết nối MySQL:', err.message);
        return;
    }
    console.log('Đã kết nối thành công tới MySQL!');
});

// Một API ví dụ để lấy danh sách phim từ MySQL
app.get('/api/movies', (req, res) => {
    db.query('SELECT * FROM movies', (err, results) => {
        if (err) return res.status(500).json(err);
        res.json({ success: true, data: results });
    });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server đang chạy tại http://localhost:${PORT}`);
});
