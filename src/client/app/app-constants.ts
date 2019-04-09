import * as sharedConstants from "../../shared/constants";

const clientConstants = {
  sideNav: [
    {
      name: 'Home',
      icon: 'home',
      link: '',
    },
    {
      name: 'Dashboard',
      icon: 'dashboard',
      link: '/dashboard',
    }
  ]
};

export const appConstants = {...sharedConstants, ...clientConstants};
