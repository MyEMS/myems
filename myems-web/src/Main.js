import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import AppContext from './context/Context';
import { settings } from './config';
import toggleStylesheet from './helpers/toggleStylesheet';
import { getItemFromStore, setItemToStore, themeColors, createCookie } from './helpers/utils';
import i18n from 'i18next';

const Main = props => {
  const [isFluid, setIsFluid] = useState(getItemFromStore('isFluid', settings.isFluid));
  const [isRTL, setIsRTL] = useState(getItemFromStore('isRTL', settings.isRTL));
  const [isDark, setIsDark] = useState(getItemFromStore('isDark', settings.isDark));
  const [isTopNav, setIsTopNav] = useState(getItemFromStore('isTopNav', settings.isTopNav));
  const [isCombo, setIsCombo] = useState(getItemFromStore('isCombo', settings.isCombo));
  const [isVertical, setIsVertical] = useState(getItemFromStore('isVertical', settings.isVertical));
  const [isNavbarVerticalCollapsed, setIsNavbarVerticalCollapsed] = useState(
    getItemFromStore('isNavbarVerticalCollapsed', settings.isNavbarVerticalCollapsed)
  );
  const [currency, setCurrency] = useState(settings.currency);
  const [showBurgerMenu, setShowBurgerMenu] = useState(settings.showBurgerMenu);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isOpenSidePanel, setIsOpenSidePanel] = useState(false);
  const [navbarCollapsed, setNavbarCollapsed] = useState(false);

  const [navbarStyle, setNavbarStyle] = useState(getItemFromStore('navbarStyle', settings.navbarStyle));
  const [language, setLanguage] = useState(getItemFromStore('myems_web_ui_language', settings.language));

  const toggleModal = () => setIsOpenSidePanel(prevIsOpenSidePanel => !prevIsOpenSidePanel);
  const value = {
    isRTL,
    isDark,
    isCombo,
    isFluid,
    setIsRTL,
    isTopNav,
    currency,
    setIsDark,
    setIsCombo,
    setIsFluid,
    isVertical,
    toggleModal,
    setIsTopNav,
    navbarStyle,
    setCurrency,
    setIsVertical,
    showBurgerMenu,
    setNavbarStyle,
    language,
    setLanguage,
    isOpenSidePanel,
    navbarCollapsed,
    setShowBurgerMenu,
    setIsOpenSidePanel,
    setNavbarCollapsed,
    isNavbarVerticalCollapsed,
    setIsNavbarVerticalCollapsed
  };

  const setStylesheetMode = mode => {
    setIsLoaded(false);
    setItemToStore(mode, value[mode]);
    toggleStylesheet({ isRTL, isDark }, () => setIsLoaded(true));
  };

  useEffect(() => {
    setStylesheetMode('isFluid');
    // eslint-disable-next-line
  }, [isFluid]);

  useEffect(() => {
    setStylesheetMode('isRTL');
    // eslint-disable-next-line
  }, [isRTL]);

  useEffect(() => {
    setStylesheetMode('isDark');
    // eslint-disable-next-line
  }, [isDark]);

  useEffect(() => {
    setItemToStore('isNavbarVerticalCollapsed', isNavbarVerticalCollapsed);
    // eslint-disable-next-line
  }, [isNavbarVerticalCollapsed]);

  useEffect(() => {
    setItemToStore('isTopNav', isTopNav);
    // eslint-disable-next-line
  }, [isTopNav]);

  useEffect(() => {
    setItemToStore('isCombo', isCombo);
    // eslint-disable-next-line
  }, [isCombo]);
  useEffect(() => {
    setItemToStore('isVertical', isVertical);
    // eslint-disable-next-line
  }, [isVertical]);

  useEffect(() => {
    setItemToStore('navbarStyle', navbarStyle);
    // eslint-disable-next-line
  }, [navbarStyle]);

  useEffect(() => {
    setItemToStore('myems_web_ui_language', language);
    i18n.changeLanguage(language);
    // eslint-disable-next-line
  }, [language]);

  useEffect(() => {
    const mousemove = () => {
      createCookie('is_logged_in', true, 1000 * 60 * 10 * 1);
    };
    const mousedown = () => {
      createCookie('is_logged_in', true, 1000 * 60 * 10 * 1);
    };
    window.addEventListener("mousemove", mousemove);
    window.addEventListener("mousedown", mousedown);
    return () => {
      window.removeEventListener("mousedown", mousedown);
      window.removeEventListener("mousemove", mousemove);
    }
  }, []);

  if (!isLoaded) {
    toggleStylesheet({ isRTL, isDark }, () => setIsLoaded(true));

    return (
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          backgroundColor: isDark ? themeColors.dark : themeColors.light
        }}
      />
    );
  }

  return <AppContext.Provider value={value}>{props.children}</AppContext.Provider>;
};

Main.propTypes = { children: PropTypes.node };

export default Main;
