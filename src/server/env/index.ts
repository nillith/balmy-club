import dotEnvSafe from 'dotenv-safe';
import path from 'path';

dotEnvSafe.config({
  allowEmptyValues: false,
  example: path.join(__dirname, '/example.env'),
  path: path.join(__dirname, '/.env')
});

