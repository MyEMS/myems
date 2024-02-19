export const version = '4.2.0';
export const navbarBreakPoint = 'xl'; // Vertical navbar breakpoint
export const topNavbarBreakpoint = 'lg';
// export const APIBaseURL = 'http://127.0.0.1:8000';
export const APIBaseURL = window.location.protocol+"//"+window.location.hostname+":"+window.location.port+"/api";
export const settings = {
  isFluid: true,
  isRTL: false,
  isDark: true,
  isTopNav: true,
  isVertical: false,
  get isCombo() {
    return this.isVertical && this.isTopNav;
  },
  showBurgerMenu: false, // controls showing vertical nav on mobile
  currency: '¥',
  isNavbarVerticalCollapsed: false,
  navbarStyle: 'transparent',
  language: 'zh_CN', //zh_CN, en, de, fr, es, ru, ar, vi, th, tr, ms, id
  showOnlineMap: false, // if you wnat to turn off online map feature, please set showOnlineMap to false
  mapboxToken: 'GET-TOKEN-AT-MAPBOX.COM', // you can get access token at https://mapbox.com
  cookieExpireTime: 1000 * 60 * 60, //cookie expires time in milliseconds
};
export default { version, navbarBreakPoint, topNavbarBreakpoint, settings, APIBaseURL };
