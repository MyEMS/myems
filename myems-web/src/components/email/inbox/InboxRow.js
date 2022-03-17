import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { Badge, Col, CustomInput, Media, Row } from 'reactstrap';
import classNames from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Flex from '../../common/Flex';
import Avatar from '../../common/Avatar';
import { Link } from 'react-router-dom';
import { EmailContext } from '../../../context/Context';
import EmailAttachment from './EmailAttachment';
import InboxRowHoverActions from './InboxRowHoverActions';
import { isIterableArray } from '../../../helpers/utils';

const Star = ({ id, star, className }) => {
  const { handleAction } = useContext(EmailContext);

  return (
    <FontAwesomeIcon
      onClick={() => handleAction('star', [id])}
      icon={star ? 'star' : ['far', 'star']}
      transform="down-7"
      className={classNames(className, { 'text-warning': star, 'text-300': !star }, 'cursor-pointer')}
    />
  );
};

Star.propTypes = {
  id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  star: PropTypes.bool.isRequired,
  className: PropTypes.string
};

const InboxRow = ({
  id,
  user,
  img,
  badge,
  title,
  description,
  attachments,
  time,
  star,
  read,
  snooze,
  isSelectedItem,
  toggleSelectedItem
}) => {
  return (
    <Row
      className={classNames('border-bottom border-200 hover-actions-trigger hover-shadow py-2 px-1 mx-0', {
        'bg-light': read
      })}
    >
      <InboxRowHoverActions id={id} read={read} snooze={snooze} />
      <Col xs="auto" className="d-none d-sm-block">
        <Flex className={classNames({ 'bg-light': read })}>
          <CustomInput
            id={`checkbox-${id}`}
            type="checkbox"
            checked={isSelectedItem(id)}
            onChange={() => toggleSelectedItem(id)}
          />
          <Star id={id} star={star} className="ml-1" />
        </Flex>
      </Col>
      <Col xs md={9} className="col-xxl-10">
        <Row>
          <Col md={4} xl={3} className="col-xxl-2 pl-md-0 mb-1 mb-md-0">
            <Media className="position-relative">
              <Avatar size="s" src={img} rounded="soft" />
              <div className="media-body ml-2">
                <Link
                  className={classNames('stretched-link inbox-link', { 'font-weight-bold': !read })}
                  to="./email-detail"
                >
                  {user}
                </Link>
                {!!badge && (
                  <Badge color="soft-success" pill className="ml-2">
                    {badge}
                  </Badge>
                )}
              </div>
            </Media>
          </Col>
          <Col>
            <Link className="d-block inbox-link" to="./email-detail">
              <span className={classNames({ 'font-weight-bold': !read })}>{title}</span>
              <span className="mx-1">–</span>
              <span>{description}</span>
            </Link>
            {isIterableArray(attachments) &&
              attachments.map(attachment => <EmailAttachment {...attachment} key={attachment.id} />)}
          </Col>
        </Row>
      </Col>
      <Col xs="auto" tag={Flex} justify="between" column className="ml-auto">
        <span className={classNames({ 'font-weight-bold': !read })}>{time}</span>
        <Star id={id} star={star} className="ml-auto mb-2 d-sm-none" />
      </Col>
    </Row>
  );
};

InboxRow.propTypes = {
  id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  user: PropTypes.string.isRequired,
  img: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  time: PropTypes.string.isRequired,
  star: PropTypes.bool.isRequired,
  read: PropTypes.bool.isRequired,
  snooze: PropTypes.bool.isRequired,
  isSelectedItem: PropTypes.func.isRequired,
  toggleSelectedItem: PropTypes.func.isRequired,
  badge: PropTypes.string,
  attachments: PropTypes.array
};

InboxRow.defaultProps = { isSelected: false };

export default InboxRow;
