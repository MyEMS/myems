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
  water_immersion_point,
  emergency_stop_point,
  electrical_compartment_smoke_detector_point,
  battery_compartment_door_open_point,
  electrical_compartment_door_open_point,
  first_level_fire_alarm_point,
  second_level_fire_alarm_point,
  running_light_point,
  fault_light_point,
  ac_relay_tripping_point,
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
              {(water_immersion_point[0] !== null) && (<td>水浸: {water_immersion_point[0]} </td>)}
              {(emergency_stop_point[0] !== null) && (<td>急停: {emergency_stop_point[0]} </td>)}
              {(electrical_compartment_smoke_detector_point[0] !== null) && (<td>电气仓烟感: {electrical_compartment_smoke_detector_point[0]} </td>)}
              {(battery_compartment_door_open_point[0] !== null) && (<td>电池仓门打开: {battery_compartment_door_open_point[0]} </td>)}
              {(electrical_compartment_door_open_point[0] !== null) && (<td>电气仓门打开: {electrical_compartment_door_open_point[0]} </td>)}
            </tr>
            <tr>
              {(first_level_fire_alarm_point[0] !== null) && (<td>消防一级报警: {first_level_fire_alarm_point[0]} </td>)}
              {(second_level_fire_alarm_point[0] !== null) && (<td>消防二级报警: {second_level_fire_alarm_point[0]} </td>)}
              {(running_light_point[0] !== null) && (<td>运行灯: {running_light_point[0]} </td>)}
              {(fault_light_point[0] !== null) && (<td>故障灯: {fault_light_point[0]} </td>)}
              {(ac_relay_tripping_point[0] !== null) && (<td>交流继电器跳闸: {ac_relay_tripping_point[0]} </td>)}
            </tr>
            <tr>
              {(inside_temperature_point[0] !== null) && (<td>内置温度值: {inside_temperature_point[0]} {inside_temperature_point[1]}</td>)}
              {(outside_temperature_point[0] !== null) && (<td>外置温度值: {outside_temperature_point[0]} {outside_temperature_point[1]}</td>)}
              {(temperature_alarm_point[0] !== null) && (<td>温度报警状态值: {temperature_alarm_point[0]} {temperature_alarm_point[1]}</td>)}
              {(smoke_sensor_value_point[0] !== null) && (<td>烟雾传感器值: {smoke_sensor_value_point[0]} {smoke_sensor_value_point[1]}</td>)}
            </tr>
            <tr>
              {(smoke_sensor_alarm_point[0] !== null) && (<td>烟雾传感器报警状态: {smoke_sensor_alarm_point[0]}</td>)}
              {(battery_safety_detection_sensor_value_point[0] !== null) && (<td>电池安全检测传感器值: {battery_safety_detection_sensor_value_point[0]}</td>)}
              {(battery_safety_detection_sensor_alarm_point[0] !== null) && (<td>电池安全检测传感器报警状态: {battery_safety_detection_sensor_alarm_point[0]}</td>)}
              {(fire_extinguishing_device_status_point[0] !== null) && (<td>灭火装置反馈状态值: {fire_extinguishing_device_status_point[0]}</td>)}
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
  water_immersion_point: PropTypes.array,
  emergency_stop_point: PropTypes.array,
  electrical_compartment_smoke_detector_point: PropTypes.array,
  battery_compartment_door_open_point: PropTypes.array,
  electrical_compartment_door_open_point: PropTypes.array,
  first_level_fire_alarm_point: PropTypes.array,
  second_level_fire_alarm_point: PropTypes.array,
  running_light_point: PropTypes.array,
  fault_light_point: PropTypes.array,
  ac_relay_tripping_point: PropTypes.array,
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
