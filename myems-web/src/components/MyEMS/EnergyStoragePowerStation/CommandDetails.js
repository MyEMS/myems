import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { Button, Card, CardBody, Table } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import CommandModal from './CommandModal';

const CommandDetails = ({ id, name, description, set_value, t }) => {
  const [isOpenCommandModal, setIsOpenCommandModal] = useState(false);

  return (
    <>
      <Card className="mb-3 fs--1">
        <CardBody className="bg-light">
          <h6>
            {id}:{name}
          </h6>
          <Table striped className="border-bottom">
            <tbody>
              <tr>
                <td>
                  {t('Description')}: {description}
                </td>
                <td>
                  {t('Set Value')}: {set_value}
                </td>
                <td>
                  <Button color="primary" size="sm" onClick={() => setIsOpenCommandModal(true)}>
                    <FontAwesomeIcon icon="edit" className="mr-1" /> 设置
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
        set_value={set_value}
      />
    </>
  );
};

CommandDetails.propTypes = {
  id: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  set_value: PropTypes.number
};

export default withTranslation()(CommandDetails);
