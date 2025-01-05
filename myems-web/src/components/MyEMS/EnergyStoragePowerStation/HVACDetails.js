import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import {
  Card,
  CardBody,
  Table,
} from 'reactstrap';

const HVACDetails = ({
  id,
  name,
  working_status_point,
  indoor_fan_status_point,
  outdoor_fan_status_point,
  emergency_fan_status_point,
  compressor_status_point,
  electric_heating_status_point,
  coil_temperature_point,
  temperature_outside_point,
  temperature_inside_point,
  condensation_temperature_point,
  outlet_air_temperature_point,
  return_air_temperature_point,
  exhaust_temperature_point,
  heating_on_temperature_point,
  heating_off_temperature_point,
  cooling_on_temperature_point,
  cooling_off_temperature_point,
  high_temperature_alarm_set_point,
  low_temperature_alarm_set_point,
  t
}) => {

  return (
    <Card className="mb-3 fs--1">
      <CardBody className="bg-light">
        <Table striped className="border-bottom">
          <thead>
            <tr>
              <th>{name}</th>
              <th>工作状态: {working_status_point[0]}</th>
              <th>室内风机: {indoor_fan_status_point[0]}</th>
              <th>室外风机: {outdoor_fan_status_point[0]}</th>
              <th>应急风机: {emergency_fan_status_point[0]}</th>
              <th>压缩机: {compressor_status_point[0]}</th>
              <th>电加热: {electric_heating_status_point[0]}</th>
            </tr>
          </thead>
        </Table>
        <Table striped className="border-bottom">

          <tbody>
            <tr>
              <td>盘管温度: {coil_temperature_point[0]} {coil_temperature_point[1]}</td>
              <td>出风温度: {outlet_air_temperature_point[0]} {outlet_air_temperature_point[1]}</td>
              <td>制热开启温度: {heating_on_temperature_point[0]} {heating_on_temperature_point[1]}</td>
              <td>高温告警温度: {high_temperature_alarm_set_point[0]} {high_temperature_alarm_set_point[1]}</td>
            </tr>
            <tr>
              <td>柜外温度: {temperature_outside_point[0]} {temperature_outside_point[1]}</td>
              <td>回风温度: {return_air_temperature_point[0]} {return_air_temperature_point[1]}</td>
              <td>制热关闭温度: {heating_off_temperature_point[0]} {heating_off_temperature_point[1]}</td>
              <td>低温告警温度: {low_temperature_alarm_set_point[0]} {low_temperature_alarm_set_point[1]}</td>
            </tr>
            <tr>
              <td>柜内温度: {temperature_inside_point[0]} {temperature_inside_point[1]}</td>
              <td>排气温度: {exhaust_temperature_point[0]} {exhaust_temperature_point[1]}</td>
              <td>制冷开启温度: {cooling_on_temperature_point[0]} {cooling_on_temperature_point[1]}</td>
              <td>-</td>
            </tr>
            <tr>
              <td>冷凝温度: {condensation_temperature_point[0]} {condensation_temperature_point[1]}</td>
              <td>制冷关闭温度: {cooling_off_temperature_point[0]} {cooling_off_temperature_point[1]}</td>
              <td>-</td>
            </tr>
          </tbody>
        </Table>

      </CardBody>
    </Card>
  );
};

HVACDetails.propTypes = {
  id: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  working_status_point: PropTypes.array,
  indoor_fan_status_point: PropTypes.array,
  outdoor_fan_status_point: PropTypes.array,
  emergency_fan_status_point: PropTypes.array,
  compressor_status_point: PropTypes.array,
  electric_heating_status_point: PropTypes.array,
  coil_temperature_point: PropTypes.array,
  temperature_outside_point: PropTypes.array,
  temperature_inside_point: PropTypes.array,
  condensation_temperature_point: PropTypes.array,
  outlet_air_temperature_point: PropTypes.array,
  return_air_temperature_point: PropTypes.array,
  exhaust_temperature_point: PropTypes.array,
  heating_on_temperature_point: PropTypes.array,
  heating_off_temperature_point: PropTypes.array,
  cooling_on_temperature_point: PropTypes.array,
  cooling_off_temperature_point: PropTypes.array,
  high_temperature_alarm_set_point: PropTypes.array,
  low_temperature_alarm_set_point: PropTypes.array,
};

export default withTranslation()(HVACDetails);
