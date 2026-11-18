const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const isRemoteHost = process.env.DB_HOST && process.env.DB_HOST !== 'localhost' && process.env.DB_HOST !== '127.0.0.1';
const useSSL = process.env.DB_SSL === 'true' || isRemoteHost;

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'hari_om_pendawala',
  port: parseInt(process.env.DB_PORT || '3306'),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  multipleStatements: true,
  decimalNumbers: true,
  ...(useSSL ? { ssl: { rejectUnauthorized: false } } : {})
});

async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Connected to MySQL database:', process.env.DB_NAME || 'hari_om_pendawala');
    connection.release();
    return { success: true };
  } catch (error) {
    console.error('❌ MySQL Connection Failed:', error.message);
    return { success: false, error: error.message };
  }
}

async function initializeDatabase() {
  try {
    const schemaPath = path.join(__dirname, '../database/schema.sql');
    if (fs.existsSync(schemaPath)) {
      const sql = fs.readFileSync(schemaPath, 'utf8');
      const connection = await pool.getConnection();
      await connection.query(sql);
      connection.release();
      console.log('✅ Database schema verified / initialized.');
    }
  } catch (error) {
    console.error('⚠️ Database schema initialization error:', error.message);
  }
}

module.exports = {
  pool,
  testConnection,
  initializeDatabase
};
