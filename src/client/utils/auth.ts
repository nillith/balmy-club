import {accessTokenKey} from "../../shared/constants";

export function getAccessToken() {
  return localStorage.getItem(accessTokenKey);
}

export function setAccessToken(token: string) {
  return localStorage.setItem(accessTokenKey, token);
}

export function removeAccessToken() {
  return localStorage.removeItem(accessTokenKey);
}
