import {NextFunction, Request, RequestHandler, Response} from "express";

import {STATUS_CODES} from 'http';
import {identity, noop} from "../../shared/utils";

export const isAsyncFunction = (() => {
  const AsyncFunction = (async () => {
  }).constructor;
  return function(fun: Function) {
    return fun instanceof AsyncFunction;
  };
})();

export const asyncMiddleware = function(fun: RequestHandler): RequestHandler {
  if (isAsyncFunction(fun)) {
    return function(req: Request, res: Response, next: NextFunction) {
      Promise.resolve(fun(req, res, next)).catch(next);
    };
  }
  return fun;
};


export const respondWith = function(res: Response, status: number, msg?: string) {
  res.status(status).send(msg || STATUS_CODES[status]);
};

export const respondErrorPage = function(res: Response, errorCode: number) {
  res.status(errorCode);
  res.render(String(errorCode), {}, function(err, html) {
    if (err) {
      return respondWith(res, errorCode);
    }
    res.send(html);
  });
};



export const getNoop = function <T extends Function>(f: T): T {
  return noop as any as T;
};

export const devOnly = (function() {
  if (process.env.NODE_ENV === 'production') {
    return getNoop;
  } else {
    return identity;
  }
})();

export const isNumericId = function(id?: any) {
  return id > 0 && Number.isSafeInteger(id);
};
