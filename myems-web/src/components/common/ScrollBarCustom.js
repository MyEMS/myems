import PropTypes from 'prop-types';
import React, { useContext } from 'react';
import Scrollbar from 'react-scrollbars-custom';
import AppContext from '../../context/Context';

const ScrollBarCustom = ({ children, ...rest }) => {
  const { isRTL } = useContext(AppContext);

  return (
    <Scrollbar
      style={{
        height: '100%',
        minWidth: '75px'
      }}
      rtl={isRTL}
      noScrollX
      trackYProps={{
        renderer(props) {
          const { elementRef, ...restProps } = props;
          return <span {...restProps} ref={elementRef} className="TrackY" />;
        }
      }}
      {...rest}
    >
      {children}
    </Scrollbar>
  );
};

ScrollBarCustom.propTypes = {
  children: PropTypes.node.isRequired
};

export default ScrollBarCustom;
