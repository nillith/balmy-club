import {StringIds} from "./app/modules/i18n/translations/string-ids";

export interface NavEntry {
  readonly name: StringIds;
  readonly icon: string;
  readonly link: string;
}


export const sideNav: NavEntry[] = [
  {
    name: StringIds.Home,
    icon: 'home',
    link: '',
  },
  {
    name: StringIds.Circle,
    icon: 'people',
    link: '/circles',
  },
  {
    name: StringIds.Settings,
    icon: 'settings',
    link: '/settings',
  },
];

export const DEFAULT_AVATAR_URL = 'assets/default-avatar.png';

export const API_URLS = {
  POSTS: 'api/posts',
  CIRCLES: 'api/i/circles',
  SETTINGS: 'api/i/settings',
  USERS: 'api/users',
  LOGIN: 'auth/local',
  ACCOUNT: 'api/account'
};
