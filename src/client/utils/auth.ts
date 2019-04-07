import {accessTokenKey} from "../../shared/constants";

export function getAccessToken() {
  return localStorage.getItem(accessTokenKey);
}

export function setAssessToken(token: string) {
  return localStorage.setItem(accessTokenKey, token);
}
