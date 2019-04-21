import dotEnvSafe from 'dotenv-safe';
import path from 'path';

dotEnvSafe.config({
  allowEmptyValues: 'true' === process.env.ALLOW_EMPTY_ENV_VALUES,
  example: path.join(__dirname, '/example.env'),
  path: path.join(__dirname, '/.env')
});

