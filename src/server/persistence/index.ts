import config from '../config';
import mysql from 'mysql2/promise';
import {isObject} from "util";

const db = mysql.createPool(config.secrets.mysql);
(db as any).pool.config.connectionConfig.namedPlaceholders = true;
if (config.env === 'development') {


  const printFun = function(obj, originalFun) {
    return function(sql, replacements, ...rest) {
      console.log(sql);
      if (isObject(replacements)) {
        console.log(replacements);
      }
      return originalFun.call(obj, sql, replacements, ...rest);
    };
  };

  const db2: any = db;
  const {execute, query} = db2;
  db2.execute = printFun(db2, execute);
  db2.query = printFun(db2, query);
}
export default db;
