import config from '../config';
import mysql from 'mysql2/promise';
const db = mysql.createPool(config.secrets.mysql);
(db as any).pool.config.connectionConfig.namedPlaceholders = true;
export default db;
