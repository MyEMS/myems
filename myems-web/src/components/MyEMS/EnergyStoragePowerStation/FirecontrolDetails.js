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
              <td>内置温度值: {inside_temperature_point[0]} {inside_temperature_point[1]}</td>
              <td>外置温度值: {outside_temperature_point[0]} {outside_temperature_point[1]}</td>
              <td>温度报警状态值: {temperature_alarm_point[0]} {temperature_alarm_point[1]}</td>
              <td>烟雾传感器值: {smoke_sensor_value_point[0]} {smoke_sensor_value_point[1]}</td>
            </tr>
            <tr>
              <td>烟雾传感器报警状态: {smoke_sensor_alarm_point[0]}</td>
              <td>电池安全检测传感器值: {battery_safety_detection_sensor_value_point[0]}</td>
              <td>电池安全检测传感器报警状态: {battery_safety_detection_sensor_alarm_point[0]}</td>
              <td>灭火装置反馈状态值: {fire_extinguishing_device_status_point[0]}</td>
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
  inside_temperature_point: PropTypes.array,
  outside_temperature_point: PropTypes.array,
  temperature_alarm_point: PropTypes.array,
  smoke_sensor_value_point: PropTypes.array,
  smoke_sensor_alarm_point: PropTypes.array,
  battery_safety_detection_sensor_value_point: PropTypes.array,
  battery_safety_detection_sensor_alarm_point: PropTypes.array,
  fire_extinguishing_device_status_point: PropTypes.array,
};

export default withTranslation()(FirecontrolDetails);
