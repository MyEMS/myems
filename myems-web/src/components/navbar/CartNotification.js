import React, { useContext } from 'react';
import { NavItem, NavLink } from 'reactstrap';
import { Link } from 'react-router-dom';
import classNames from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ProductContext } from '../../context/Context';

const CartNotification = () => {
  const { shoppingCart } = useContext(ProductContext);

  return (
    <NavItem>
      <NavLink
        tag={Link}
        to="/e-commerce/shopping-cart"
        className={classNames('px-0', {
          'notification-indicator notification-indicator-warning notification-indicator-fill': !!shoppingCart.length
        })}
      >
        {!!shoppingCart.length && (
          <span className="notification-indicator-number">
            {shoppingCart.reduce((accumulator, currentValue) => accumulator + currentValue.quantity, 0)}
          </span>
        )}
        <FontAwesomeIcon icon="shopping-cart" transform="shrink-7" className="fs-4" />
      </NavLink>
    </NavItem>
  );
};

export default CartNotification;
