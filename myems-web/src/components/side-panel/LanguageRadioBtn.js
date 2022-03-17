import React, { useContext } from 'react';
import { Button, CustomInput } from 'reactstrap';
import PropTypes from 'prop-types';

import AppContext from '../../context/Context';
import classNames from 'classnames';
import { withTranslation } from 'react-i18next';

const LanguageRadioBtn = ({ btnName, t }) => {
  const { language, setLanguage } = useContext(AppContext);

  return (
    <Button
      color="theme-default"
      className={classNames('custom-radio-success p-0 text-left custom-control custom-radio mr-2', {
        active: language === `${btnName}`
      })}
    >
      <CustomInput
        type="radio"
        id={t(`language-${btnName}`)}
        label={t(`language-${btnName}`)}
        checked={language === `${btnName}`}
        onChange={({ target }) => setLanguage(btnName)}
      />
    </Button>
  );
};

LanguageRadioBtn.propTypes = {
  btnName: PropTypes.string.isRequired
};

export default withTranslation()(LanguageRadioBtn);
