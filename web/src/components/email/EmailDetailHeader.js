import React, { useContext } from 'react';
import { Card, CardBody, DropdownToggle, UncontrolledDropdown, DropdownItem, DropdownMenu } from 'reactstrap';
import ButtonIconTooltip from '../common/ButtonIconTooltip';
import Flex from '../common/Flex';
import { Link } from 'react-router-dom';
import AppContext from '../../context/Context';
import ButtonIcon from '../common/ButtonIcon';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const EmailDetailHeader = () => {
  const { isRTL } = useContext(AppContext);

  return (
    <Card className="mb-3">
      <CardBody tag={Flex} justify="between">
        <div>
          <ButtonIconTooltip tag={Link} to="/email/inbox" id="back" icon={`arrow-${isRTL ? 'right' : 'left'}`}>
            Back to inbox
          </ButtonIconTooltip>
          <span className="mx-1 mx-sm-2 text-300">|</span>
          <ButtonIconTooltip id="archive" icon="archive">
            Archive
          </ButtonIconTooltip>
          <ButtonIconTooltip id="trash" icon="trash-alt" className="ml-1 ml-sm-2">
            Delete
          </ButtonIconTooltip>
          <ButtonIconTooltip id="message" icon="envelope" className="ml-1 ml-sm-2">
            Mark as unread
          </ButtonIconTooltip>
          <ButtonIconTooltip id="clock" icon="clock" className="ml-1 ml-sm-2">
            Clock
          </ButtonIconTooltip>
          <ButtonIconTooltip id="print" icon="print" className="ml-1 ml-sm-2 d-none d-sm-inline-block">
            Print
          </ButtonIconTooltip>
        </div>
        <Flex align="center">
          <div className="d-none d-md-block">
            <small>2 of 354</small>
            <ButtonIcon
              icon={`chevron-${isRTL ? 'right' : 'left'}`}
              color="falcon-default"
              size="sm"
              className="ml-1 ml-sm-2"
            />
            <ButtonIcon
              icon={`chevron-${isRTL ? 'left' : 'right'}`}
              color="falcon-default"
              size="sm"
              className="ml-1 ml-sm-2"
            />
          </div>
          <UncontrolledDropdown>
            <DropdownToggle className="btn-sm ml-2 text-600" color="falcon-default">
              <FontAwesomeIcon icon="cog" />
            </DropdownToggle>
            <DropdownMenu right className="border py-2">
              <DropdownItem>Configure inbox</DropdownItem>
              <DropdownItem divider />
              <DropdownItem>Settings</DropdownItem>
              <DropdownItem>Themes</DropdownItem>
              <DropdownItem divider />
              <DropdownItem>Send feedback</DropdownItem>
              <DropdownItem>Help</DropdownItem>
            </DropdownMenu>
          </UncontrolledDropdown>
        </Flex>
      </CardBody>
    </Card>
  );
};

export default EmailDetailHeader;
