import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import {
  Card,
  CardBody,
  Table,
} from 'reactstrap';

const FirecontrolDetails = ({
  id,
  name,
  inside_temperature_point,
  outside_temperature_point,
  temperature_alarm_point,
  smoke_sensor_value_point,
  smoke_sensor_alarm_point,
  battery_safety_detection_sensor_value_point,
  battery_safety_detection_sensor_alarm_point,
  fire_extinguishing_device_status_point,
  t
}) => {

  return (
    <Card className="mb-3 fs--1">
      <CardBody className="bg-light">
        <Table striped className="border-bottom">
          <tbody>
            <tr>
              <td>内置温度值: {inside_temperature_point}</td>
              <td>外置温度值: {outside_temperature_point}</td>
              <td>温度报警状态值: {temperature_alarm_point}</td>
              <td>烟雾传感器值: {smoke_sensor_value_point}</td>
            </tr>
            <tr>
              <td>烟雾传感器报警状态: {smoke_sensor_alarm_point}</td>
              <td>电池安全检测传感器值: {battery_safety_detection_sensor_value_point}</td>
              <td>电池安全检测传感器报警状态: {battery_safety_detection_sensor_alarm_point}</td>
              <td>灭火装置反馈状态值: {fire_extinguishing_device_status_point}</td>
            </tr>
          </tbody>
        </Table>

      </CardBody>
    </Card>
  );
};

FirecontrolDetails.propTypes = {
  id: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  inside_temperature_point: PropTypes.number,
  outside_temperature_point: PropTypes.number,
  temperature_alarm_point: PropTypes.number,
  smoke_sensor_value_point: PropTypes.number,
  smoke_sensor_alarm_point: PropTypes.number,
  battery_safety_detection_sensor_value_point: PropTypes.number,
  battery_safety_detection_sensor_alarm_point: PropTypes.number,
  fire_extinguishing_device_status_point: PropTypes.number,
};

export default withTranslation()(FirecontrolDetails);
