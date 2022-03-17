import React, { Fragment, useContext, useEffect, useState } from 'react';
import { Button, Card, CardBody, Col, Form, Row } from 'reactstrap';
import FalconCardHeader from '../common/FalconCardHeader';
import FalconInput from '../common/FalconInput';
import { ProductContext } from '../../context/Context';
import uuid from 'uuid/v1';
import { isIterableArray } from '../../helpers/utils';
import Flex from '../common/Flex';
import ContentWithAsideLayout from '../../layouts/ContentWithAsideLayout';
import ProductGrid from './product/ProductGrid';
import FalconDropzone from '../common/FalconDropzone';
import FalconCardFooterLink from '../common/FalconCardFooterLink';

const sliderSettings = {
  infinite: true,
  speed: 500,
  slidesToShow: 1,
  slidesToScroll: 1
};

const ProductAdd = () => {
  const { products, productsDispatch } = useContext(ProductContext);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Camera');
  const [files, setFiles] = useState([]);
  const [dropzonePlaceholder, setDropzonePlaceholder] = useState('Drop or upload image(s)');
  const [price, setPrice] = useState('');
  const [sale, setSale] = useState('');
  const [shippingCost, setShippingCost] = useState('');
  const [features, setFeatures] = useState('');
  const [isDisable, setIsDisable] = useState(true);

  const clearState = () => {
    setTitle('');
    setCategory('Camera');
    setFiles([]);
    setDropzonePlaceholder('Drop or upload image(s)');
    setPrice('');
    setSale('');
    setShippingCost('');
    setFeatures('');
  };

  const handleSubmit = e => {
    e.preventDefault();

    // Add product
    productsDispatch({
      type: 'ADD',
      isAddToStart: true,
      payload: {
        id: uuid(),
        files,
        rating: 0,
        review: 0,
        isInStock: true,
        isNew: true,
        features: features
          .split('|')
          .map(feature => feature.trim())
          .filter(feature => feature),
        shippingCost: shippingCost ? parseFloat(shippingCost) : 0,
        sale: sale ? parseFloat(sale) : 0,
        price: parseFloat(price),
        category,
        title
      }
    });

    // Clearing state
    clearState();
  };

  useEffect(() => {
    setIsDisable(!(!!title && !!category && !!files.length && !!price));
    !!files.length
      ? setDropzonePlaceholder(`${files.length} image(s) uploaded`)
      : setDropzonePlaceholder('Drop or upload image(s)');
  }, [title, category, files, price]);

  return (
    <ContentWithAsideLayout
      aside={
        <Fragment>
          <Card>
            <FalconCardHeader title="Products" />
            <CardBody className="pb-0">
              <Row>
                {isIterableArray(products) &&
                  products
                    .slice(0, 2)
                    .map(product => (
                      <ProductGrid {...product} sliderSettings={sliderSettings} key={product.id} xs={12} />
                    ))}
              </Row>
            </CardBody>
            <FalconCardFooterLink title="Show all products" to="/e-commerce/products" borderTop={false} />
          </Card>
        </Fragment>
      }
    >
      <Card className="mb-3">
        <FalconCardHeader title="Add new product" />
        <CardBody>
          <Row className="align-items-end" form tag={Form} onSubmit={handleSubmit}>
            <Col sm={6}>
              <FalconInput className="mb-3" label="Title" value={title} onChange={setTitle} />
            </Col>
            <Col sm={6}>
              <FalconInput
                className="mb-3"
                label="Category"
                value={category}
                onChange={setCategory}
                type="select"
                custom
              >
                <option value="Computer & Accessories">Computer & Accessories</option>
                <option value="Mobile & Tabs">Mobile & Tabs</option>
                <option value="Watches & Accessories">Watches & Accessories</option>
                <option value="Camera">Camera</option>
              </FalconInput>
            </Col>
            <Col sm={4}>
              <FalconInput
                className="mb-3 input-spin-none"
                label="Price"
                value={price}
                onChange={setPrice}
                type="number"
                step={0.01}
                min={0}
              />
            </Col>
            <Col sm={4}>
              <FalconInput
                className="mb-3 input-spin-none"
                label="Shipping cost"
                value={shippingCost}
                onChange={setShippingCost}
                type="number"
                step={0.01}
              />
            </Col>
            <Col sm={4}>
              <FalconInput
                className="mb-3 input-spin-none"
                label="Sale (%)"
                value={sale}
                onChange={setSale}
                type="number"
                step={0.01}
                min={0}
                max={100}
              />
            </Col>
            <Col xs={12}>
              <FalconInput
                className="mb-3"
                label="Features"
                placeholder="Use vertical bar(|) for multiple features"
                value={features}
                onChange={setFeatures}
                type="textarea"
                rows={8}
              />
            </Col>
            <Col xs={12}>
              <FalconDropzone placeholder={dropzonePlaceholder} files={files} onChange={setFiles} preview />
            </Col>
          </Row>
        </CardBody>
      </Card>

      <Card className="mb-3">
        <CardBody tag={Flex} justify="end">
          <Button color="falcon-danger" size="sm" className="mr-2" onClick={clearState}>
            Reset
          </Button>
          <Button
            color={isDisable ? 'falcon-default' : 'falcon-success'}
            size="sm"
            disabled={isDisable}
            onClick={handleSubmit}
          >
            Add product
          </Button>
        </CardBody>
      </Card>
    </ContentWithAsideLayout>
  );
};

export default ProductAdd;
