import config from '../config';
import mysql, {PoolConnection} from 'mysql2/promise';
import {timeOfDay} from "../../shared/utils";


if (config.env === 'development') {
  const ConnectionPrototype = require('mysql2').Connection.prototype;
  const {addCommand} = ConnectionPrototype;
  ConnectionPrototype.addCommand = function(cmd, ...rest) {
    if (cmd.sql) {
      console.log('\x1b[33m[%s]\x1b[0m: \x1b[36m%s\x1b[0m', timeOfDay(), cmd.sql);
    }
    return addCommand.call(this, cmd, ...rest);
  };
}

type TransactionTask = (conn: mysql.PoolConnection) => Promise<void>;
export interface MyPool extends mysql.Pool {
  inTransaction(fun: TransactionTask): Promise<void>;
}

export const db = mysql.createPool(config.secrets.mysql) as MyPool;
db.inTransaction = async function(this: MyPool, f: TransactionTask): Promise<void> {
  const conn = await this.getConnection();
  try {
    await conn.beginTransaction();
    await f(conn);
    await conn.commit();
  } catch (e) {
    await conn.rollback();
    console.log(e);
    throw e;
  } finally {
    await conn.release();
  }
};

(db as any).pool.config.connectionConfig.namedPlaceholders = true;

export default db;
