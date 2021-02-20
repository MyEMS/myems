import React, { useContext } from 'react';
import ProductList from './ProductList';
import ProductGrid from './ProductGrid';
import { ProductContext } from '../../../context/Context';

const sliderSettings = {
  infinite: true,
  speed: 500,
  slidesToShow: 1,
  slidesToScroll: 1
};

const Product = props => {
  // Context
  const { productsLayout } = useContext(ProductContext);
  const Tag = (productsLayout === 'list' && ProductList) || (productsLayout === 'grid' && ProductGrid);

  if (productsLayout === 'grid') {
    return <ProductGrid {...props} sliderSettings={sliderSettings} md={6} lg={4} />;
  }

  return <Tag {...props} sliderSettings={sliderSettings} />;
};

export default Product;
