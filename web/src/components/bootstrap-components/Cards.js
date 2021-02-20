import React, { Fragment } from 'react';
import { Button, Card, CardBody, Col, Row } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PageHeader from '../common/PageHeader';
import FalconCardHeader from '../common/FalconCardHeader';
import FalconEditor from '../common/FalconEditor';
import classNames from 'classnames';
import Notification from '../notification/Notification';

import generic1 from '../../assets/img/generic/1.jpg';
import generic3 from '../../assets/img/generic/3.jpg';
import generic6 from '../../assets/img/generic/6.jpg';
import generic7 from '../../assets/img/generic/7.jpg';
import generic8 from '../../assets/img/generic/8.jpg';
import generic10 from '../../assets/img/generic/10.jpg';
import generic11 from '../../assets/img/generic/11.jpg';
import generic12 from '../../assets/img/generic/12.jpg';
import team1 from '../../assets/img/team/1.jpg';

const cardStyleCode = `<CardColumns>
{
  ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark'].map((color, index) => (
    <Card body inverse color={color} className={classNames({'bg-dark' : color === 'light'}) } key={index}>
      <CardTitle>{color} card title</CardTitle>
      <CardText>
        Some quick example text to build on the card 
        title and make up the bulk of the card's content.
      </CardText>
    </Card>
    ))
 }
</CardColumns>`;

const basicExampleCode = `<Card style={{width: '20rem'}}>
  <CardImg src={generic1} top />
  <CardBody>
    <CardTitle tag="h5" tag="h5">
      Card title
    </CardTitle>
    <CardText tag="p">
      Some quick example text to build on the card
      title and make up the bulk of the card's
      content.
    </CardText>
    <Button color="primary" size="sm">
      Go somewhere
    </Button>
  </CardBody>
</Card>`;

const cardWithListCode = `<ListGroup>
  <ListGroupItem>
    Cras justo odio
  </ListGroupItem>
  <ListGroupItem>
    Dapibus ac facilisis in
  </ListGroupItem>
  <ListGroupItem>
    Morbi leo risus
  </ListGroupItem>
  <ListGroupItem>
    Porta ac consectetur ac
  </ListGroupItem>
  <ListGroupItem>
    Vestibulum at eros
  </ListGroupItem>
  <ListGroupItem>
    Odio at morbi
  </ListGroupItem>
</ListGroup>`;

const cardWithImageCode = `<Card style={{width: '20rem'}}>
  <CardImg src={generic3} top />
  <CardBody>
    <CardTitle tag="h5">Card title</CardTitle>
    <CardText tag="p">
      Some quick example text to build on the card title and make up the bulk of the card's content.
    </CardText>
  </CardBody>
  <ListGroup flush>
    <ListGroupItem>Cras justo odio</ListGroupItem>
    <ListGroupItem>Dapibus ac facilisis in</ListGroupItem>
    <ListGroupItem>Vestibulum at eros</ListGroupItem>
    <ListGroupItem>
      <a className="card-link" href="#!">
        Card link
      </a>
      <a className="card-link" href="#!">
        Another link
      </a>
    </ListGroupItem>
  </ListGroup>
</Card>`;

const cardGroupsCode = `<CardGroup>
  <Card>
    <CardImg top width="100%" src={generic10} alt="Card image cap" />
    <CardBody>
      <CardTitle tag="h5">First card title</CardTitle>
      <CardText>
        This is a wider card with supporting text below as a natural lead-in to additional content. This
        content is a little bit longer.
      </CardText>
      <p className="text-muted">
        <small className="text-muted"> Last updated 45 mins ago</small>
      </p>
    </CardBody>
  </Card>
  <Card>
    <CardImg top width="100%" src={generic11} alt="Card image cap" />
    <CardBody>
      <CardTitle tag="h5">Second card title</CardTitle>
      <CardText>This card has supporting text below as a natural lead-in to additional content.</CardText>
      <p className="text-muted">
        <small className="text-muted">Last updated an hour ago</small>
      </p>
    </CardBody>
  </Card>
  <Card>
    <CardImg top width="100%" src={generic12} alt="Card image cap" />
    <CardBody>
      <CardTitle tag="h5">Yet another card title</CardTitle>
      <CardText>
        This is a wider card with supporting text below as a natural lead-in to additional content. This card
        has even longer content than the first to show that equal height action.
      </CardText>
      <p className="text-muted">
        <small className="text-muted"> Last updated yesterday</small>
      </p>
    </CardBody>
  </Card>
</CardGroup>`;

const cardDeckCode = `<CardDeck>
  <Card>
    <CardImg top width="100%" src={generic6} alt="Card image cap" />
    <CardBody>
      <CardTitle tag="h5">Awesome card title</CardTitle>
      <CardText>
        This is a wider card with supporting text below as a natural lead-in to additional content. This
        content is a little bit longer.
      </CardText>
      <p className="text-muted">
        <small className="text-muted"> Last updated 45 mins ago</small>
      </p>
    </CardBody>
  </Card>
  <Card>
    <CardImg top width="100%" src={generic7} alt="Card image cap" />
    <CardBody>
      <CardTitle tag="h5">Beautiful card title</CardTitle>
      <CardText>This card has supporting text below as a natural lead-in to additional content.</CardText>
      <p className="text-muted">
        <small className="text-muted">Last updated an hour ago</small>
      </p>
    </CardBody>
  </Card>
  <Card>
    <CardImg top width="100%" src={generic8} alt="Card image cap" className="rounded-0" />
    <CardBody>
      <CardTitle tag="h5">Gorgeous card title</CardTitle>
      <CardText>
        This is a wider card with supporting text below as a natural lead-in to additional content. This card
        has even longer content than the first to show that equal height action.
      </CardText>
      <p className="text-muted">
        <small className="text-muted"> Last updated yesterday</small>
      </p>
    </CardBody>
  </Card>
</CardDeck>`;

const backgroundCode = `<Card className="bg-dark text-white" inverse style={{maxWidth: '30rem'}}>
  <CardImg src={generic3} alt="Card image cap" />
  <CardImgOverlay className="d-flex align-items-end">
    <div>
      <CardTitle tag="h5" className="text-white">
        Card Title
      </CardTitle>
      <CardText>
        Some quick example text to build on the card title and make up the bulk of the card's content.
      </CardText>
    </div>
  </CardImgOverlay>
</Card>`;

const propertiesCard = `Card.propTypes = {
  // Pass in a Component to override default element
  tag: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
  inverse: PropTypes.bool,
  color: PropTypes.string,
  body: PropTypes.bool,
  className: PropTypes.string
}
`;
const propertiesCardBody = `CardBody.propTypes = {
  // Pass in a Component to override default element
  tag: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
  className: PropTypes.string
};`;
const propertiesCardColumns = `CardColumns.propTypes = {
  // Pass in a Component to override default element
  tag: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
  className: PropTypes.string
};`;
const propertiesCardDeck = `CardDeck.propTypes = {
  // Pass in a Component to override default element
  tag: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
  className: PropTypes.string
};`;

const propertiesCardFooter = `CardFooter.propTypes = {
  // Pass in a Component to override default element
  tag: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
  className: PropTypes.string
};`;
const propertiesCardGroup = `CardGroup.propTypes = {
  // Pass in a Component to override default element
  tag: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
  className: PropTypes.string
};`;
const propertiesCardHeader = `CardHeader.propTypes = {
  // Pass in a Component to override default element
  tag: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
  className: PropTypes.string
};
`;
const propertiesCardImg = `CardImg.propTypes = {
  // Pass in a Component to override default element
  tag: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
  className: PropTypes.string,
  // Use top or bottom to position image via "card-img-top" or "card-img-bottom"
  top: PropTypes.bool,
  bottom: PropTypes.bool
};`;
const propertiesCardImgOverlay = `CardImgOverlay.propTypes = {
  // Pass in a Component to override default element
  tag: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
  className: PropTypes.string
};`;
const propertiesCardLink = `CardLink.propTypes = {
  // Pass in a Component to override default element
  tag: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
  className: PropTypes.string,
  // ref will only get you a reference to the CardLink component, use innerRef to get a reference to the DOM element (for things like focus management).
  innerRef: PropTypes.oneOfType([PropTypes.func, PropTypes.string])
};`;
const propertiesCardSubtitle = `CardSubtitle.propTypes = {
  // Pass in a Component to override default element
  tag: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
  className: PropTypes.string
};`;
const propertiesCardText = `CardText.propTypes = {
  // Pass in a Component to override default element
  tag: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
  className: PropTypes.string
};`;
const propertiesCardTitle = `CardTitle.propTypes = {
  // Pass in a Component to override default element
  tag: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
  className: PropTypes.string
};`;

const Cards = () => (
  <Fragment>
    <PageHeader
      title="Cards"
      description="Falcon’s cards provide a flexible and extensible content container with multiple variants and options."
      className="mb-3"
    >
      <Button
        tag="a"
        href="https://reactstrap.github.io/components/card"
        target="_blank"
        color="link"
        size="sm"
        className="pl-0"
      >
        Cards on reactstrap
        <FontAwesomeIcon icon="chevron-right" className="ml-1 fs--2" />
      </Button>
    </PageHeader>
    <Row noGutters>
      <Col xl={6} className="pr-xl-2">
        <Card className="mb-3">
          <FalconCardHeader title="Basic Example" light={false} />
          <CardBody className="bg-light">
            <FalconEditor code={basicExampleCode} scope={{ generic1 }} language="jsx" />
          </CardBody>
        </Card>
      </Col>
      <Col xl={6} className="pl-xl-2">
        <Card className="mb-3">
          <FalconCardHeader title="Card with list" light={false} />
          <CardBody className="bg-light">
            <FalconEditor code={cardWithListCode} />
          </CardBody>
        </Card>
      </Col>
    </Row>
    <Card className="mb-3">
      <FalconCardHeader title="Properties" light={false} />
      <CardBody className="bg-light">
        <FalconEditor code={propertiesCard} hidePreview />
        <FalconEditor code={propertiesCardBody} hidePreview />
        <FalconEditor code={propertiesCardColumns} hidePreview />
        <FalconEditor code={propertiesCardDeck} hidePreview />
        <FalconEditor code={propertiesCardFooter} hidePreview />
        <FalconEditor code={propertiesCardGroup} hidePreview />
        <FalconEditor code={propertiesCardHeader} hidePreview />
        <FalconEditor code={propertiesCardImg} hidePreview />
        <FalconEditor code={propertiesCardImgOverlay} hidePreview />
        <FalconEditor code={propertiesCardLink} hidePreview />
        <FalconEditor code={propertiesCardSubtitle} hidePreview />
        <FalconEditor code={propertiesCardText} hidePreview />
        <FalconEditor code={propertiesCardTitle} hidePreview />
      </CardBody>
    </Card>
    <Card className="mb-3">
      <FalconCardHeader title="Card with image" light={false} />
      <CardBody className="bg-light">
        <FalconEditor code={cardWithImageCode} scope={{ generic3 }} language="jsx" />
      </CardBody>
    </Card>
    <Card className="mb-3">
      <FalconCardHeader title="Notification" light={false} />
      <CardBody className="bg-light">
        <Notification
          avatar={{
            src: team1,
            size: 'xl'
          }}
          time="Just Now"
          emoji="📢"
          to="#!"
        >
          Announcing the winners of the The only book awards decided by you, the readers. Check out the champions and
          runners-up in all 21 categories now!
        </Notification>
      </CardBody>
    </Card>
    <Card className="mb-3">
      <FalconCardHeader title="Background" light={false} />
      <CardBody className="bg-light">
        <FalconEditor code={backgroundCode} scope={{ generic3 }} language="jsx" />
      </CardBody>
    </Card>
    <Card className="mb-3">
      <FalconCardHeader title="Cards Groups" light={false} />
      <CardBody className="bg-light">
        <FalconEditor code={cardGroupsCode} scope={{ generic10, generic11, generic12 }} />
      </CardBody>
    </Card>
    <Card className="mb-3">
      <FalconCardHeader title="Cards Deck" light={false} />
      <CardBody className="bg-light">
        <FalconEditor code={cardDeckCode} scope={{ generic6, generic7, generic8 }} />
      </CardBody>
    </Card>
    <Card>
      <FalconCardHeader title="Card styles" light={false} />
      <CardBody className="bg-light">
        <FalconEditor code={cardStyleCode} scope={{ classNames }} language="jsx" />
      </CardBody>
    </Card>
  </Fragment>
);

export default Cards;
