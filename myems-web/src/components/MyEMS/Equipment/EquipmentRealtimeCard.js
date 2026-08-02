import React, { useEffect, useState } from 'react';
import { Card, CardBody, CardHeader, ListGroup, ListGroupItem } from 'reactstrap';
import { handleAPIError } from '../../../helpers/utils';
import { withTranslation } from 'react-i18next';
import { APIBaseURL } from '../../../config';
import { getCookieValue } from '../../../helpers/utils';
import { toast } from 'react-toastify';
import withRedirect from '../../../hoc/withRedirect';

const listItemBorderColor = 'rgba(255, 255, 255, 0.12)';

const EquipmentRealtimeCard = ({ equipmentId, equipmentName, pointValueMap, setRedirect, setRedirectUrl, t }) => {
  const [equipmentParameters, setEquipmentParameters] = useState([]);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      const response = await fetch(APIBaseURL + '/equipments/' + equipmentId + '/parameters', {
        method: 'GET',
        headers: {
          'Content-type': 'application/json',
          'User-UUID': getCookieValue('user_uuid'),
          Token: getCookieValue('token')
        },
        body: null
      });
      const json = await response.json();
      if (!isMounted) {
        return;
      }
      if (response.ok) {
        const parameterList = Array.isArray(json) ? json : [];
        setEquipmentParameters(parameterList);
      } else {
        handleAPIError(json, setRedirect, setRedirectUrl, t, toast);
      }
    };

    fetchData().catch(err => {
      console.log(err);
    });
    return () => {
      isMounted = false;
    };
  }, [equipmentId, setRedirect, setRedirectUrl, t]);

  const formatParameterValue = parameterItem => {
    const pointId = parameterItem['point'] && parameterItem['point']['id'] ? parameterItem['point']['id'] : undefined;
    if (!pointId) {
      return '';
    }
    const value = pointValueMap && Object.prototype.hasOwnProperty.call(pointValueMap, pointId) ? pointValueMap[pointId] : undefined;
    return value !== undefined && value !== null ? value : '';
  };

  const visibleParameterList = equipmentParameters.filter(
    item => item && item['parameter_type'] === 'point' && item['point'] && item['point']['id']
  );

  return (
    <Card className="h-100 bg-gradient">
      <CardHeader className="bg-transparent">
        <h5 className="text-white">{String(equipmentName || '')}</h5>
      </CardHeader>
      <CardBody className="text-white fs--1">
        <ListGroup flush>
          {visibleParameterList.map(parameterItem => (
            <ListGroupItem
              key={parameterItem['id']}
              className="bg-transparent d-flex justify-content-between px-0 py-1"
              style={{ borderColor: listItemBorderColor }}
            >
              <p className="mb-0">{parameterItem['name']}</p>
              <p className="mb-0">{formatParameterValue(parameterItem)}</p>
            </ListGroupItem>
          ))}
        </ListGroup>
      </CardBody>
    </Card>
  );
};

export default withTranslation()(withRedirect(EquipmentRealtimeCard));
