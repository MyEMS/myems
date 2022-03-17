import React, { Fragment, useState, useContext, useEffect } from 'react';
import { Button, Card, CardBody, Col, CustomInput, Form, InputGroup, Row } from 'reactstrap';
import Loader from '../common/Loader';
import useFakeFetch from '../../hooks/useFakeFetch';
import { isIterableArray } from '../../helpers/utils';
import Product from './product/Product';
import Flex from '../common/Flex';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classNames from 'classnames';
import InputGroupAddon from 'reactstrap/es/InputGroupAddon';
import ProductFooter from './product/ProductFooter';
import usePagination from '../../hooks/usePagination';
import { ProductContext } from '../../context/Context';

const Products = ({ match, history }) => {
  // Context
  const { products, setProductsLayout, handleSort, sortBy, isAsc } = useContext(ProductContext);

  // State
  const [productIds, setProductIds] = useState([]);

  // Hook
  const { loading } = useFakeFetch(products);
  const { data: paginationData, meta: paginationMeta, handler: paginationHandler } = usePagination(productIds, 4);
  const { total, itemsPerPage, from, to } = paginationMeta;
  const { perPage } = paginationHandler;

  const { productLayout } = match.params;
  const isList = productLayout === 'list';
  const isGrid = productLayout === 'grid';

  useEffect(() => {
    setProductIds(products.map(product => product.id));
  }, [products, setProductIds]);

  useEffect(() => {
    setProductsLayout(productLayout);
  }, [setProductsLayout, productLayout]);

  return (
    <Fragment>
      <Card className="mb-3">
        <CardBody>
          <Row className="justify-content-between align-items-center">
            <Col sm="auto" className="mb-2 mb-sm-0" tag={Flex} align="center">
              <CustomInput
                id="itemsPerPage"
                type="select"
                bsSize="sm"
                value={itemsPerPage}
                onChange={({ target }) => perPage(Number(target.value))}
              >
                <option value={2}>2</option>
                <option value={4}>4</option>
                <option value={6}>6</option>
                <option value={total}>All</option>
              </CustomInput>
              <h6 className="mb-0 text-nowrap ml-2">
                Showing {from}-{to} of {total} Products
              </h6>
            </Col>
            <Col sm="auto">
              <Form className="d-inline-block mr-3">
                <InputGroup size="sm" tag={Flex} align="center">
                  <small className="mr-1">Sort by:</small>
                  <CustomInput
                    type="select"
                    defaultValue={sortBy}
                    id="ProductSortBy"
                    onChange={({ target }) => handleSort(target.value)}
                  >
                    <option value="price">Price</option>
                    <option value="rating">Rating</option>
                    <option value="review">Review</option>
                    <option value="off">Off</option>
                  </CustomInput>
                  <InputGroupAddon addonType="append">
                    <Button onClick={() => handleSort(sortBy)} className="cursor-pointer">
                      <FontAwesomeIcon icon={classNames({ 'sort-amount-up': isAsc, 'sort-amount-down': !isAsc })} />
                    </Button>
                  </InputGroupAddon>
                </InputGroup>
              </Form>

              <FontAwesomeIcon
                className="cursor-pointer"
                icon={classNames({ 'list-ul': isGrid, th: isList })}
                onClick={() => history.push(`/e-commerce/products/${isList ? 'grid' : 'list'}`)}
              />
            </Col>
          </Row>
        </CardBody>
      </Card>

      <Card>
        <CardBody className={classNames({ 'p-0  overflow-hidden': isList, 'pb-0': isGrid })}>
          {loading ? (
            <Loader />
          ) : (
            <Row noGutters={isList}>
              {isIterableArray(products) &&
                products
                  .filter(product => paginationData.includes(product.id))
                  .map((product, index) => <Product {...product} key={product.id} index={index} />)}
            </Row>
          )}
        </CardBody>
        <ProductFooter meta={paginationMeta} handler={paginationHandler} />
      </Card>
    </Fragment>
  );
};

export default Products;
