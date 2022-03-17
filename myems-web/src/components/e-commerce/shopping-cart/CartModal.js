import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { Button, Col, Media, Modal, ModalBody, ModalFooter, ModalHeader, Row } from 'reactstrap';
import { Link } from 'react-router-dom';
import { calculateSale } from '../../../helpers/utils';
import AppContext from '../../../context/Context';
import classNames from 'classnames';
import ButtonIcon from '../../common/ButtonIcon';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const CartModal = ({ type, id, quantity, title, files, price, sale, modal, setModal }) => {
  const { currency } = useContext(AppContext);
  if (!id) return null;
  return (
    <Modal isOpen={modal} toggle={() => setModal(!modal)} size="lg">
      <ModalHeader toggle={() => setModal(!modal)} className="border-200">
        <Media className="align-items-center">
          <div
            className={classNames('icon-item shadow-none', {
              'bg-soft-danger': type === 'REMOVE',
              'bg-soft-success': type === 'ADD'
            })}
          >
            <FontAwesomeIcon
              icon={classNames({
                exclamation: type === 'REMOVE',
                'cart-plus': type === 'ADD'
              })}
              className={classNames({
                'text-warning': type === 'REMOVE',
                'text-success': type === 'ADD'
              })}
            />
          </div>

          <Media body className="ml-2">
            You just {(type === 'REMOVE' && 'removed') || (type === 'ADD' && 'added')} {quantity} item
            {quantity === 1 ? '' : 's'}
          </Media>
        </Media>
      </ModalHeader>
      <ModalBody
        className={classNames({
          'mb-1': type === 'REMOVE'
        })}
      >
        <Row noGutters className="align-items-center">
          <Col>
            <Media className="align-items-center">
              <Link to={`/e-commerce/product-details/${id}`}>
                <img
                  className="rounded mr-3 d-none d-md-block"
                  src={files[0]['src'] || files[0]['base64']}
                  alt=""
                  width="80"
                />
              </Link>
              <Media body>
                <h5 className="fs-0">
                  <Link className="text-900" to={`/e-commerce/product-details/${id}`}>
                    {title}
                  </Link>
                </h5>
              </Media>
            </Media>
          </Col>
          <Col sm="auto" className="pl-sm-3 d-none d-sm-block">
            {currency}
            {calculateSale(price, sale) * quantity}
          </Col>
        </Row>
      </ModalBody>
      {type !== 'REMOVE' && (
        <ModalFooter className="border-200">
          <Button color="secondary" size="sm" tag={Link} to="/e-commerce/checkout" onClick={() => setModal(!modal)}>
            Checkout
          </Button>

          <ButtonIcon
            tag={Link}
            to="/e-commerce/shopping-cart"
            color="primary"
            size="sm"
            className="ml-2"
            icon="chevron-right"
            iconAlign="right"
            onClick={() => setModal(!modal)}
          >
            Go to Cart
          </ButtonIcon>
        </ModalFooter>
      )}
    </Modal>
  );
};

CartModal.propTypes = { value: PropTypes.any };

CartModal.defaultProps = { value: `CartModal` };

export default CartModal;
