import React, { useEffect, useRef, useState } from 'react';
import { Card, CardBody, Col, Row } from 'reactstrap';
import FalconCardHeader from '../../../common/FalconCardHeader';
import { getCookieValue, createCookie, checkEmpty } from '../../../../helpers/utils';
import withRedirect from '../../../../hoc/withRedirect';
import { withTranslation } from 'react-i18next';
import { settings } from '../../../../config';
import { parseFrame, withCrc } from './modbusUtils';
import FrameInputPanel from './components/FrameInputPanel';
import ParseResultPanel from './components/ParseResultPanel';

// Sample frames. RTU checksums are computed at module load so they are always
// valid regardless of later edits.
const RTU_REQUEST_SAMPLES = [
  withCrc([0x01, 0x03, 0x00, 0x00, 0x00, 0x0a]),
  withCrc([0x01, 0x06, 0x00, 0x01, 0x00, 0x64]),
  withCrc([0x01, 0x10, 0x00, 0x01, 0x00, 0x02, 0x04, 0x00, 0x0a, 0x00, 0x0b])
];

const RTU_RESPONSE_SAMPLES = [
  withCrc([0x01, 0x03, 0x04, 0x00, 0x64, 0x00, 0xc8]),
  withCrc([0x01, 0x01, 0x01, 0x05]),
  withCrc([0x01, 0x83, 0x02])
];

const buildTcpFrame = (transactionId, unitId, pdu) => {
  const length = 1 + pdu.length;
  return [
    (transactionId >> 8) & 0xff,
    transactionId & 0xff,
    0x00,
    0x00,
    (length >> 8) & 0xff,
    length & 0xff,
    unitId,
    ...pdu
  ];
};

const TCP_REQUEST_SAMPLES = [
  buildTcpFrame(0x0001, 0x01, [0x03, 0x00, 0x00, 0x00, 0x0a]),
  buildTcpFrame(0x0002, 0x01, [0x10, 0x00, 0x01, 0x00, 0x02, 0x04, 0x00, 0x0a, 0x00, 0x0b])
];

const TCP_RESPONSE_SAMPLES = [
  buildTcpFrame(0x0001, 0x01, [0x03, 0x04, 0x00, 0x64, 0x00, 0xc8]),
  buildTcpFrame(0x0002, 0x01, [0x84, 0x02])
];

const RAW_SAMPLES = [[0x00, 0x64, 0x00, 0xc8, 0x00, 0x2c]];

const frameToHex = bytes =>
  bytes
    .map(b => b.toString(16).padStart(2, '0').toUpperCase())
    .join(' ');

const ModbusParser = ({ setRedirect, setRedirectUrl, t }) => {
  const [protocol, setProtocol] = useState('rtu');
  const [direction, setDirection] = useState('response');
  const [hexText, setHexText] = useState('');
  const [startAddress, setStartAddress] = useState('0');
  const [coilQuantity, setCoilQuantity] = useState('');
  const [byteOrder, setByteOrder] = useState('ABCD');
  const [result, setResult] = useState(null);
  const sampleIndex = useRef({});

  useEffect(() => {
    let is_logged_in = getCookieValue('is_logged_in');
    let user_name = getCookieValue('user_name');
    let user_display_name = getCookieValue('user_display_name');
    let user_uuid = getCookieValue('user_uuid');
    let token = getCookieValue('token');
    if (checkEmpty(is_logged_in) || checkEmpty(token) || checkEmpty(user_uuid) || !is_logged_in) {
      setRedirectUrl(`/authentication/basic/login`);
      setRedirect(true);
    } else {
      createCookie('is_logged_in', true, settings.cookieExpireTime);
      createCookie('user_name', user_name, settings.cookieExpireTime);
      createCookie('user_display_name', user_display_name, settings.cookieExpireTime);
      createCookie('user_uuid', user_uuid, settings.cookieExpireTime);
      createCookie('token', token, settings.cookieExpireTime);
    }
  }, [setRedirect, setRedirectUrl]);

  // Drop the previous result whenever an input changes so the panel never
  // describes a frame that is no longer on screen.
  const handleProtocolChange = value => {
    setProtocol(value);
    setResult(null);
  };

  const handleDirectionChange = value => {
    setDirection(value);
    setResult(null);
  };

  const handleHexChange = value => {
    setHexText(value);
    setResult(null);
  };

  const handleStartAddressChange = value => {
    setStartAddress(value);
    setResult(null);
  };

  const handleCoilQuantityChange = value => {
    setCoilQuantity(value);
    setResult(null);
  };

  const handleParse = () => {
    setResult(
      parseFrame({
        hexText,
        protocol,
        direction,
        startAddress: parseInt(startAddress, 10),
        coilQuantity: parseInt(coilQuantity, 10)
      })
    );
  };

  const handleLoadSample = () => {
    let frames;
    if (protocol === 'raw') frames = RAW_SAMPLES;
    else if (protocol === 'tcp') frames = direction === 'request' ? TCP_REQUEST_SAMPLES : TCP_RESPONSE_SAMPLES;
    else frames = direction === 'request' ? RTU_REQUEST_SAMPLES : RTU_RESPONSE_SAMPLES;
    const key = `${protocol}-${direction}`;
    const index = sampleIndex.current[key] || 0;
    sampleIndex.current[key] = (index + 1) % frames.length;
    setHexText(frameToHex(frames[index]));
    setResult(null);
  };

  const handleClear = () => {
    setHexText('');
    setResult(null);
  };

  return (
    <div className="wrapper-content">
      <Row className="mb-3">
        <Col lg={6}>
          <Card>
            <FalconCardHeader title={t('Input Frame')} titleClass="text-lightSlateGray mb-0" />
            <CardBody>
              <FrameInputPanel
                t={t}
                protocol={protocol}
                onProtocolChange={handleProtocolChange}
                direction={direction}
                onDirectionChange={handleDirectionChange}
                startAddress={startAddress}
                onStartAddressChange={handleStartAddressChange}
                coilQuantity={coilQuantity}
                onCoilQuantityChange={handleCoilQuantityChange}
                hexText={hexText}
                onHexChange={handleHexChange}
                onParse={handleParse}
                onLoadSample={handleLoadSample}
                onClear={handleClear}
              />
            </CardBody>
          </Card>
        </Col>
        <Col lg={6}>
          <Card>
            <FalconCardHeader title={t('Parse Result')} titleClass="text-lightSlateGray mb-0" />
            <CardBody>
              <ParseResultPanel t={t} result={result} byteOrder={byteOrder} onByteOrderChange={setByteOrder} />
            </CardBody>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default withTranslation()(withRedirect(ModbusParser));
