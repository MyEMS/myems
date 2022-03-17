import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Card } from 'reactstrap';
import ItemBannerHeader from './ItemBannerHeader';
import ItemBannerBody from './ItemBannerBody';

class ItemBanner extends Component {
  static Header = ItemBannerHeader;
  static Body = ItemBannerBody;

  render() {
    return <Card className="mb-3">{this.props.children}</Card>;
  }
}

ItemBanner.propTypes = { children: PropTypes.node };

export default ItemBanner;
