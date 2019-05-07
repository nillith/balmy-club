import {ACCESS_TOKEN_COOKIE_KEY, ACCESS_TOKEN_KEY} from "../../shared/constants";


export function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (2 === parts.length) {
    return parts.pop().split(";").shift();
  }
}

export function removeCookie( name ) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
}

export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY) || getCookie(ACCESS_TOKEN_COOKIE_KEY);
}

export function setAccessToken(token: string) {
  return localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function removeAccessToken() {
  removeCookie(ACCESS_TOKEN_COOKIE_KEY);
  return localStorage.removeItem(ACCESS_TOKEN_KEY);
}
