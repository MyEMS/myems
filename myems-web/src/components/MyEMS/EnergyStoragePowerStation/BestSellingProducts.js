import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { Button, Card, CardBody, CardFooter, Col, CustomInput, Row, Table } from 'reactstrap';
import BestSellingProduct from './BestSellingProduct';
import { Link } from 'react-router-dom';
import AppContext from '../../../context/Context';

const getTotalPrice = items =>
  items.map(({ unit, price }) => unit * price).reduce((total, currentValue) => total + currentValue, 0);

const BestSellingProducts = ({ products }) => {
  const { currency } = useContext(AppContext);
  const totalPrice = getTotalPrice(products);
  const noOfProducts = products.length;

  return (
    <Card className="h-lg-100 overflow-hidden">
      <CardBody className="p-0">
        <Table borderless className="table-dashboard mb-0 fs--1">
          <thead className="bg-light">
            <tr className="text-900">
              <th>电站</th>
              <th className="text-right">
                数据
              </th>
              <th className="pr-card text-right" style={{ width: '8rem' }}>
                占比 (%)
              </th>
            </tr>
          </thead>
          <tbody>
            {products.map((product, index) => (
              <BestSellingProduct
                product={product}
                totalPrice={totalPrice}
                currency={currency}
                isLast={index === noOfProducts - 1}
                key={product.id}
              />
            ))}
          </tbody>
        </Table>
      </CardBody>
      <CardFooter className="bg-light py-2">
        <Row className="flex-between-center">
          <Col xs="auto">
            <CustomInput type="select" id="exampleCustomSelect" bsSize="sm">
              <option>最近7天</option>
              <option>最近1月</option>
              <option>最近1年</option>
            </CustomInput>
          </Col>
          <Col xs="auto">
            <Button color="falcon-default" size="sm" tag={Link} to="#!">
              全部
            </Button>
          </Col>
        </Row>
      </CardFooter>
    </Card>
  );
};

BestSellingProducts.propTypes = { products: PropTypes.arrayOf(BestSellingProduct.propTypes.product).isRequired };

export default BestSellingProducts;
