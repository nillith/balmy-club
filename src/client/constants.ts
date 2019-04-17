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
  DISCOVER: 'api/posts/discover',
  CIRCLES: 'api/i/circles',
  SETTINGS: 'api/i/settings',
  USERS: 'api/users',
  LOGIN: 'auth/local',
  ACCOUNT: 'api/account'
};


export enum MenuActions {
  Edit = 1,
  Delete,
  Mute,
  UnMute,
  Subscribe,
  Report,
  Block,
  UnBlock,
  Circle
}

export interface IconMenuOption {
  action: MenuActions;
  icon: string;
  name: StringIds;
}

const ActionOptions: IconMenuOption[] = [
  {
    action: MenuActions.Edit,
    icon: 'edit',
    name: StringIds.Edit
  },
  {
    action: MenuActions.Delete,
    icon: 'delete',
    name: StringIds.Delete
  },
  {
    action: MenuActions.Mute,
    icon: 'notifications_on',
    name: StringIds.Mute,
  },
  {
    action: MenuActions.UnMute,
    icon: 'notifications_off',
    name: StringIds.Muted,
  },
  {
    action: MenuActions.Subscribe,
    icon: 'notifications_active',
    name: StringIds.Subscribe,
  },
  {
    action: MenuActions.Report,
    icon: 'report',
    name: StringIds.Report
  },
  {
    action: MenuActions.Block,
    icon: 'block',
    name: StringIds.Block,
  },
  {
    action: MenuActions.UnBlock,
    icon: 'block',
    name: StringIds.UnBlock,
  },
  {
    action: MenuActions.Circle,
    icon: 'panorama_fish_eye',
    name: StringIds.Circle,
  }
];

export const getIconMenuOption = (() => {
  const actionOptionMap: {
    [index: number]: IconMenuOption;
  } = {};

  for (const o of ActionOptions) {
    actionOptionMap[o.action] = o;
  }

  return function(actions: MenuActions[]) {
    if (actions && actions.length) {
      return actions.map(action => actionOptionMap[action]);
    }
    return [];
  };
})();

