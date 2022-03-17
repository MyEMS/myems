import React, { Fragment } from 'react';
import useBulkSelect from '../../hooks/useBulkSelect';
import rawEmails from '../../data/email/emails';
import classNames from 'classnames';
import { Card, CardBody } from 'reactstrap';
import Flex from '../common/Flex';
import FalconEditor from '../common/FalconEditor';
import PageHeader from '../common/PageHeader';

const bulkSelectCode = `function BulkSelectExample() {
  const emailIds = rawEmails.map(email => email.id);
  
  const {
    selectedItems,
    isSelectedItem,
    isAllSelected,
    isIndeterminate,
    toggleSelectedItem,
    toggleIsAllSelected
  } = useBulkSelect(emailIds);

  return (
    <Card>
      <CardBody className="p-0">
        <Table className="mb-0">
          <thead>
            <tr>
              <th>
                <CustomInput
                  id="checkbox-bulk"
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={() => toggleIsAllSelected()}
                  innerRef={input => input && (input.indeterminate = isIndeterminate)}
                />
              </th>
              <th>Sender</th>
              <th>Subject</th>
            </tr>
          </thead>
          <tbody>
            {rawEmails.map(({ id, user, title, img }) => (
              <tr className={classNames({ 'bg-light': isSelectedItem(id) })} key={id} >
                <td>
                  <Flex>
                    <CustomInput
                      id={'checkbox-'+id}
                      type="checkbox"
                      checked={isSelectedItem(id)}
                      onChange={() => toggleSelectedItem(id)}
                    />
                  </Flex>
                </td>
                <th className="text-nowrap">
                  <Media>
                    <img src={img} alt={user} width={20} />
                    <Media body className="ml-2 align-items-center">
                      {user}
                    </Media>
                  </Media>
                </th>
                <td>{title}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </CardBody>
    </Card>
  );
}`;

const BulkSelect = () => (
  <Fragment>
    <PageHeader
      title="Bulk Select"
      description="You can use <code>useBulkSelect</code> hook to add the functionality of bulk selection. These are the exports of this hook: <code>selectedItems, isSelectedItem, isAllSelected, isIndeterminate, toggleSelectedItem, toggleIsAllSelected</code>"
      className="mb-3"
    />
    <Card className="mb-0">
      <CardBody className="p-0">
        <FalconEditor code={bulkSelectCode} scope={{ useBulkSelect, rawEmails, classNames, Flex }} />
      </CardBody>
    </Card>
  </Fragment>
);

export default BulkSelect;
