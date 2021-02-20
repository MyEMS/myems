import React, { useContext } from 'react';
import { Card, CardBody, Col, Row } from 'reactstrap';
import { ProductContext } from '../../context/Context';
import { Redirect } from 'react-router-dom';
import Flex from '../common/Flex';
import ProductDetailsMedia from './product-details/ProductDetailsMedia';
import ProductDetailsFooter from './product-details/ProductDetailsFooter';
import ProductDetailsMain from './product-details/ProductDetailsMain';

const ProductDetails = ({ match }) => {
  // TODO: Question about data fetch (fetch 2 or 1)
  const { products } = useContext(ProductContext);
  const { id } = match.params;

  const product = products.find(product => product.id === id);

  if (!product) {
    return <Redirect to={`/e-commerce/product-details/${products[0].id}`} />;
  }

  return (
    <Card>
      <CardBody>
        <Row>
          <Col lg={6} className="mb-4 mb-lg-0">
            <ProductDetailsMedia {...product} />
          </Col>
          <Col lg={6} tag={Flex} justify="between" column>
            <ProductDetailsMain id={id} {...product} />
          </Col>
        </Row>
        <ProductDetailsFooter />
      </CardBody>
    </Card>
  );
};

export default ProductDetails;
