/**
 * Translation Resource Loader.
 */
function config($translateProvider) {
  var bundles = window.myemsAdminTranslations || {};

  Object.keys(bundles).forEach(function (lang) {
    $translateProvider.translations(lang, bundles[lang]);
  });

  var lang =
    window.localStorage.getItem("myems_admin_ui_language") || "zh_CN"; //en, zh_CN, de, fr, es, ru, ar, vi, th, tr, ms, id, zh_TW, pt, ko_KR, it, pol, nl, jp, fa

  $translateProvider.preferredLanguage(lang);
}

angular.module("inspinia").config(config);
