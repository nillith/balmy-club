import express from "express";
import config from "./config";
import compression from "compression";
import bodyParser from "body-parser";
import lusca from "lusca";
import passport from "passport";
import methodOverride from 'method-override';
import cookieParser from 'cookie-parser';
import routes from './routes';
import connectRedis from 'connect-redis';
import session from "express-session";
import redisClient from './cache/redis';
import http from 'http';
import {$msg, $status} from "./constants/symbols";
import morgan from "morgan";

const {STATUS_CODES} = http;
const RedisStore = connectRedis(session);


const app = express();
const env = process.env.NODE_ENV;

if (config.isBehindTrustProxy) {
  app.enable('trust proxy');
}

app.set('env', env);
app.set("port", process.env.PORT || 3000);
app.set('views', `${config.root}/server/views`);
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride());
app.use(cookieParser());
app.use(morgan('dev' as any));
app.use(session({
  store: new RedisStore({
    client: redisClient
  }),
  secret: config.secrets.session as string,
  saveUninitialized: true,
  resave: false,
}));
app.use(passport.initialize());
app.use(passport.session());
app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});

app.use(express.static(config.publicRoot, {maxAge: 31557600000}));

// app.use(lusca({
//   csrf: {
//     angular: true
//   },
//   xframe: 'SAMEORIGIN',
//   hsts: {
//     maxAge: 31536000,
//     includeSubDomains: true,
//     preload: true
//   },
//   xssProtection: true
// }));

if (env === 'development' || env === 'test') {
  app.use((err, req, res, next) => {
    console.log(err);
    return res.status(err[$status]).send(err.message);
  });
} else {
  app.use((err, req, res, next) => {
    let status = err[$status];
    let msg = err[$msg] || STATUS_CODES[status];
    if (!status || !msg) {
      status = 500;
      msg = STATUS_CODES[status];
    }
    return res.status(status).send(msg);
  });
}
routes(app);

export default app;
