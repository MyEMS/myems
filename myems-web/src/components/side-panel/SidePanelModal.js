import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import React, { useContext, useEffect } from 'react';
import classNames from 'classnames';
import { Button, CustomInput, Modal, ModalHeader, ButtonGroup, Label, Media, Badge } from 'reactstrap';
import AppContext from '../../context/Context';
import defaultModeImg from '../../assets/img/generic/falcon-mode-default.jpg';
import darkModeImg from '../../assets/img/generic/falcon-mode-dark.jpg';
import invertedImg from '../../assets/img/generic/inverted.png';
import card from '../../assets/img/generic/card.png';
import vibrant from '../../assets/img/generic/vibrant.png';
import transparent from '../../assets/img/generic/default.png';
import leftArrowFromLeft from '../../assets/img/icons/left-arrow-from-left.svg';
import arrowsH from '../../assets/img/icons/arrows-h.svg';
import paragraph from '../../assets/img/icons/paragraph.svg';
import settings from '../../assets/img/illustrations/settings.png';
import Flex from '../common/Flex';
import ScrollBarCustom from '../common/ScrollBarCustom';
import { createCookie, getCookieValue, getPageName } from '../../helpers/utils';
import VerticalNavRadioBtn from './VerticalNavStyleRadioBtn';
import LanguageRadioBtn from './LanguageRadioBtn';
import { withTranslation } from 'react-i18next';


const SidePanelModal = ({ autoShow, showOnce, autoShowDelay, cookieExpireTime, path, t }) => {
  const {
    isCombo,
    isOpenSidePanel,
    toggleModal,
    isFluid,
    setIsFluid,
    isRTL,
    setIsRTL,
    isDark,
    setIsDark,
    isTopNav,
    setIsTopNav,
    setIsOpenSidePanel,
    setIsCombo,
    isVertical,
    setIsVertical
  } = useContext(AppContext);
  const isKanban = getPageName('kanban');

  useEffect(() => {
    let modalStatus = getCookieValue('modalClose');

    if (modalStatus === null && autoShow) {
      setTimeout(() => {
        setIsOpenSidePanel(prev => !prev);
        showOnce && createCookie('modalClose', false, cookieExpireTime);
      }, autoShowDelay);
    }
  }, [autoShow, showOnce, setIsOpenSidePanel, autoShowDelay, cookieExpireTime]);
  return (
    <Modal
      isOpen={isOpenSidePanel}
      toggle={toggleModal}
      modalClassName="overflow-hidden modal-fixed-right modal-theme"
      className="modal-dialog-vertical"
      contentClassName="vh-100 border-0"
    >
      <ModalHeader tag="div" toggle={toggleModal} className="modal-header-settings">
        <div className="py-1 flex-grow-1">
          <h5 className="text-white">
            <FontAwesomeIcon icon="palette" className="mr-2 fs-0" />
            {t('Settings')}
          </h5>
          <p className="mb-0 fs--1 text-white opacity-75">{t('Set your own customized style')}</p>
        </div>
      </ModalHeader>
      <ScrollBarCustom
        className="modal-body"
        contentProps={{
          renderer: ({ elementRef, ...restProps }) => (
            <span
              {...restProps}
              ref={elementRef}
              className={classNames('p-card position-absolute', { 'border-left': isDark })}
            />
          )
        }}
      >
        <h5 className="fs-0">{t('Color Scheme')}</h5>
        <p className="fs--1">{t('Choose the perfect color mode for your app.')}</p>
        <ButtonGroup className="btn-group-toggle btn-block">
          <Button color="theme-default" className={classNames('custom-radio-success', { active: !isDark })}>
            <Label for="theme-mode-default" className="cursor-pointer hover-overlay">
              <img className="w-100" src={defaultModeImg} alt="" />
            </Label>
            <CustomInput
              type="radio"
              id="theme-mode-default"
              label={t('Light')}
              checked={!isDark}
              onChange={({ target }) => setIsDark(!target.checked)}
            />
          </Button>
          <Button color="theme-dark" className={classNames('custom-radio-success', { active: isDark })}>
            <Label for="theme-mode-dark" className="cursor-pointer hover-overlay">
              <img className="w-100" src={darkModeImg} alt="" />
            </Label>
            <CustomInput
              type="radio"
              id="theme-mode-dark"
              label={t('Dark')}
              checked={isDark}
              onChange={({ target }) => setIsDark(target.checked)}
            />
          </Button>
        </ButtonGroup>
        <hr />
        <Flex justify="between">
          <Media className="flex-grow-1">
            <img src={leftArrowFromLeft} alt="" width={20} className="mr-2" />
            <Media body>
              <h5 className="fs-0">{t('RTL Mode')}</h5>
              <p className="fs--1 mb-0">{t('Switch your language direction')} </p>
            </Media>
          </Media>
          <CustomInput
            type="switch"
            id="rtl-switch"
            checked={isRTL}
            onChange={({ target }) => setIsRTL(target.checked)}
          />
        </Flex>
        {!isKanban && (
          <>
            <hr />
            <Flex justify="between">
              <Media className="flex-grow-1">
                <img src={arrowsH} alt="" width={20} className="mr-2" />
                <Media body>
                  <h5 className="fs-0">{t('Fluid Layout')}</h5>
                  <p className="fs--1 mb-0">{t('Toggle container layout system')}</p>
                </Media>
              </Media>
              <CustomInput
                type="switch"
                id="fluid-switch"
                checked={isFluid}
                onChange={({ target }) => setIsFluid(target.checked)}
              />
            </Flex>
          </>
        )}
        <hr />
        <Media>
          <img src={paragraph} alt="" width={20} className="mr-2" />
          <Media body>
            <Flex align="center" tag="h5" className="fs-0">
              {t('Navigation Position')}
              <Badge color="success" pill className="badge-soft-success fs--2 ml-2">
                New
              </Badge>
            </Flex>
            <p className="fs--1 mb-2">{t('Select a suitable navigation system for your web application')}</p>
            <CustomInput
              type="radio"
              id="verticalNav-radio"
              label="Vertical"
              name="NavBarPositionRadioButton"
              checked={!isCombo && isVertical}
              onChange={({ target }) => {
                setIsVertical(target.checked);
                setIsTopNav(!target.checked);
                setIsCombo(!target.checked);
              }}
              inline
            />
            <CustomInput
              type="radio"
              id="topNav-radio"
              label="Top"
              name="NavBarPositionRadioButton"
              checked={!isCombo && isTopNav}
              onChange={({ target }) => {
                setIsTopNav(target.checked);
                setIsVertical(!target.checked);
                setIsCombo(!target.checked);
              }}
              inline
            />
            <CustomInput
              type="radio"
              id="combo-radio"
              label="Combo"
              name="NavBarPositionRadioButton"
              checked={isCombo}
              onChange={({ target }) => {
                setIsCombo(target.checked);
                setIsTopNav(target.checked);
                setIsVertical(target.checked);
              }}
              inline
            />
          </Media>
        </Media>
        <hr />
        <h5 className="fs-0 d-flex align-items-center">{t('Vertical Navbar Style')}</h5>
        <p className="fs--1">{t('Switch between styles for your vertical navbar')}</p>
        <div className="btn-group-toggle btn-block btn-group-navbar-style">
          <ButtonGroup className="btn-block">
            <VerticalNavRadioBtn img={transparent} btnName={'transparent'} />
            <VerticalNavRadioBtn img={invertedImg} btnName={'inverted'} />
          </ButtonGroup>
          <ButtonGroup className="btn-block mt-3">
            <VerticalNavRadioBtn img={card} btnName={'card'} />
            <VerticalNavRadioBtn img={vibrant} btnName={'vibrant'} />
          </ButtonGroup>
        </div>
        <hr />
        <h5 className="fs-0 d-flex align-items-center">
          {t('Language')}{' '}
          <Badge pill color="soft-success" className="fs--2 ml-2">
            new
          </Badge>
        </h5>
        <p className="fs--1">{t('Switch between languages')}</p>
        <div className="btn-group-toggle btn-block btn-group-navbar-style">
          <ButtonGroup className="btn-block">
            <LanguageRadioBtn btnName={'zh_CN'} />
            <LanguageRadioBtn btnName={'en'} />
            <LanguageRadioBtn btnName={'de'} />
          </ButtonGroup>
          <ButtonGroup className="btn-block">
            <LanguageRadioBtn btnName={'fr'} />
            <LanguageRadioBtn btnName={'es'} />
            <LanguageRadioBtn btnName={'ru'} />
          </ButtonGroup>
          <ButtonGroup className="btn-block">
            <LanguageRadioBtn btnName={'ar'} />
            <LanguageRadioBtn btnName={'vi'} />
            <LanguageRadioBtn btnName={'th'} />
          </ButtonGroup>
          <ButtonGroup className="btn-block">
            <LanguageRadioBtn btnName={'tr'} />
            <LanguageRadioBtn btnName={'ms'} />
            <LanguageRadioBtn btnName={'id'}/>
          </ButtonGroup>
        </div>
        <hr />
        <div className="text-center mt-5">
          <img src={settings} alt="settings" width={120} className="mb-4" />
          <h5>{t('Like What You See?')}</h5>
          <p className="fs--1">{t('Get MyEMS now.')}</p>
          <Button
            color="primary"
            href="https://myems.io"
          >
            {t('Purchase')}
          </Button>
        </div>
      </ScrollBarCustom>
    </Modal>
  );
};

SidePanelModal.propTypes = {
  autoShow: PropTypes.bool,
  showOnce: PropTypes.bool,
  autoShowDelay: PropTypes.number,
  cookieExpireTime: PropTypes.number
};

SidePanelModal.defaultProps = {
  autoShow: true,
  showOnce: true,
  autoShowDelay: 3000,
  cookieExpireTime: 7200000
};

export default withTranslation()(SidePanelModal);
