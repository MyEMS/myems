import React, { useContext } from 'react';
import { Button, Label, CustomInput } from 'reactstrap';
import PropTypes from 'prop-types';

import AppContext from '../../context/Context';
import classNames from 'classnames';
const VerticalNavRadioBtn = ({ img, btnName }) => {
  const { navbarStyle, setNavbarStyle } = useContext(AppContext);

  return (
    <Button
      color="theme-default"
      className={classNames('custom-radio-success p-0 text-left custom-control custom-radio mr-2', {
        active: navbarStyle === `${btnName}`
      })}
    >
      <Label for={`navbar-style-${btnName}`} className="cursor-pointer w-100">
        <img className="w-100" src={img} alt="" />
      </Label>
      <CustomInput
        type="radio"
        id={`navbar-style-${btnName}`}
        label={btnName.charAt(0).toUpperCase() + btnName.slice(1)}
        checked={navbarStyle === `${btnName}`}
        onChange={({ target }) => setNavbarStyle(btnName)}
      />
    </Button>
  );
};

VerticalNavRadioBtn.propTypes = {
  img: PropTypes.string.isRequired,
  btnName: PropTypes.string.isRequired
};

export default VerticalNavRadioBtn;
