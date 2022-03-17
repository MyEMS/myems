import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'reactstrap';
import Flex from '../common/Flex';

const ButtonImgPostCreate = ({ imgSrc, imgWidth, children }) => (
  <Button
    color="light"
    size="sm"
    tag={Flex}
    inline
    align="center"
    className="rounded-capsule shadow-none fs--1 ml-1 mb-0"
  >
    <img className="cursor-pointer mr-2" src={imgSrc} width={imgWidth} alt="" />
    {children}
  </Button>
);

ButtonImgPostCreate.propTypes = {
  imgSrc: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  imgWidth: PropTypes.number
};

ButtonImgPostCreate.defaultProps = { imgWidth: 17 };

export default ButtonImgPostCreate;
