import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { Button, Card, CardBody, Table } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import CommandModal from './CommandModal';

const CommandDetails = ({ id, name, description, payload, t }) => {
  const [isOpenCommandModal, setIsOpenCommandModal] = useState(false);

  return (
    <>
      <Card className="mb-3 fs--1">
        <CardBody className="bg-light">
          <Table className="fs--1 mb-0">
            <tbody>
              <tr>
                <td className="pr-0 text-left">
                  <Button color="primary" size="sm" onClick={() => setIsOpenCommandModal(true)}>
                    <FontAwesomeIcon icon="edit" className="mr-1" /> {id}:{name}
                  </Button>
                </td>
              </tr>
            </tbody>
          </Table>
        </CardBody>
      </Card>

      <CommandModal
        isOpenCommandModal={isOpenCommandModal}
        setIsOpenCommandModal={setIsOpenCommandModal}
        id={id}
        name={name}
        description={description}
        payload={payload}
      />
    </>
  );
};

CommandDetails.propTypes = {
  id: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  payload: PropTypes.string,
  description: PropTypes.string.isRequired,
};

export default withTranslation()(CommandDetails);
