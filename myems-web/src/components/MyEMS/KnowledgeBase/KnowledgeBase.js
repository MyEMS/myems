import React, { useEffect, useState } from 'react';
import { Alert, Card, CardBody, CardImg, CardText, CardTitle, Col, Row, Spinner, CardHeader } from 'reactstrap';
import Summary from './Summary';
import FalconCardHeader from '../../common/FalconCardHeader';
import createMarkup from '../../../helpers/createMarkup';
import { isIterableArray } from '../../../helpers/utils';
import { getCookieValue, createCookie } from '../../../helpers/utils';
import withRedirect from '../../../hoc/withRedirect';
import { withTranslation } from 'react-i18next';
import { APIBaseURL, settings } from '../../../config';

const KnowledgeBase = ({ setRedirect, setRedirectUrl, t }) => {
  const [fetchSuccess, setFetchSuccess] = useState(false);

  const [reports, setReports] = useState([]);

  const [spinnerHidden, setSpinnerHidden] = useState(false);

  const [isAboutCollapsed, setIsAboutCollapsed] = useState(false);

  useEffect(() => {
    let is_logged_in = getCookieValue('is_logged_in');
    let user_name = getCookieValue('user_name');
    let user_display_name = getCookieValue('user_display_name');
    let user_uuid = getCookieValue('user_uuid');
    let token = getCookieValue('token');
    if (is_logged_in === null || !is_logged_in) {
      setRedirectUrl(`/authentication/basic/login`);
      setRedirect(true);
    } else {
      createCookie('is_logged_in', true, settings.cookieExpireTime);
      createCookie('user_name', user_name, settings.cookieExpireTime);
      createCookie('user_display_name', user_display_name, settings.cookieExpireTime);
      createCookie('user_uuid', user_uuid, settings.cookieExpireTime);
      createCookie('token', token, settings.cookieExpireTime);

      let isResponseOK = false;
      if (!fetchSuccess) {
        fetch(APIBaseURL + '/knowledgefiles', {
          method: 'GET',
          headers: {
            'Content-type': 'application/json',
            'User-UUID': getCookieValue('user_uuid'),
            Token: getCookieValue('token')
          },
          body: null
        })
          .then(response => {
            if (response.ok) {
              isResponseOK = true;
            }
            return response.json();
          })
          .then(json => {
            if (isResponseOK) {
              setFetchSuccess(true);
              let reportList = [];
              if (json.length > 0) {
                json.forEach((currentValue, index) => {
                  let report = {};
                  report['id'] = json[index]['id'];
                  report['calendar'] = {
                    month: json[index]['upload_datetime'].substring(5, 7),
                    day: json[index]['upload_datetime'].substring(8, 10)
                  };
                  report['title'] = json[index]['file_name'];
                  report['additional'] =
                    t('Created Datetime') +
                    ': ' +
                    json[index]['upload_datetime'] +
                    '<br/>' +
                    t('File Size') +
                    ': ' +
                    (json[index]['file_size_bytes'] / (1024 * 1024)).toFixed(2) +
                    ' MB';
                  report['to'] = '#';
                  report['file_bytes_base64'] = json[index]['file_bytes_base64'];
                  reportList.push(report);
                });
              }
              setReports(reportList);
              setSpinnerHidden(true);
            }
          });
      }
    }
  }, []);

  return (
    <div className="wrapper-content">
      <Card>
        <FalconCardHeader title={t('Knowledge Base')} titleClass="text-lightSlateGray mb-0" />
        <CardBody className="fs--1">
          <Spinner color="primary" hidden={spinnerHidden} />
          {isIterableArray(reports) ? (
            <Row>
              {reports.map(({ additional, ...rest }, index) => (
                <Col md={6} className="h-100" key={index}>
                  <Summary divider={reports.length !== index + 1} {...rest}>
                    <p className="text-1000 mb-0">{additional}</p>
                  </Summary>
                </Col>
              ))}
            </Row>
          ) : (
            <Alert color="info" className="mb-0">
              {t('No data found')}
            </Alert>
          )}
        </CardBody>
      </Card>

      <Row className="mt-4">
        <Col md={8}>
          <Card className="shadow">
            <CardHeader className="bg-primary text-white">
              <span className="fs--1">{t('ABOUT_MYEMS')}</span>
            </CardHeader>
            <CardBody>
              <CardText dangerouslySetInnerHTML={createMarkup(t('ABOUT_INTRO'))} className="mb-1" />
              <CardText dangerouslySetInnerHTML={createMarkup(t('OFFICIAL_SITE'))} className="mb-3" />
              <div className="row">
                <div className="col-sm-4">
                  <strong className="fs--1">{t('SOURCE_CODE')}</strong>
                </div>
                <div className="col-sm-8">
                  <a href="https://gitee.com/myems/myems" target="_blank" rel="noopener noreferrer" className="text-success">
                    https://gitee.com/myems/myems
                  </a>
                </div>
                <div className="col-sm-4 mt-2">
                  <strong className="fs--1">{t('INSTALL_DOCS')}</strong>
                </div>
                <div className="col-sm-8 mt-2">
                  <a href="https://myems.cn/docs/category/installation" target="_blank" rel="noopener noreferrer" className="text-success">
                    {t('INSTALL_DOCS')}
                  </a>
                </div>
                <div className="col-sm-4 mt-2">
                  <strong className="fs--1">{t('ADMIN_TUTORIAL')}</strong>
                </div>
                <div className="col-sm-8 mt-2">
                  <a href="https://myems.cn/docs/tutorial/admin-guide" target="_blank" rel="noopener noreferrer" className="text-success">
                    {t('ADMIN_TUTORIAL')}
                  </a>
                </div>
                <div className="col-sm-4 mt-2">
                  <strong className="fs--1">{t('VIDEO_TUTORIAL')}</strong>
                </div>
                <div className="col-sm-8 mt-2">
                  <a href="https://space.bilibili.com/539108162" target="_blank" rel="noopener noreferrer" className="text-success">
                    {t('BILIBILI')}
                  </a>
                </div>
                <div className="col-sm-4 mt-2">
                  <strong className="fs--1">{t('MODBUS_CONFIG')}</strong>
                </div>
                <div className="col-sm-8 mt-2">
                  <a href="https://mp.weixin.qq.com/s/xqkq1_sS90AvuVX07kzE8A" target="_blank" rel="noopener noreferrer" className="text-success">
                    {t('WECHAT_ARTICLE')}
                  </a>
                </div>
              </div>
              <a href="#" onClick={e => { e.preventDefault(); setIsAboutCollapsed(!isAboutCollapsed); }} className="text-primary fs--1">
                {isAboutCollapsed ? t('HIDE_MORE') : t('CLICK_TO_EXPAND_FOR_MORE_DESCRIPTION')}
              </a>
              {isAboutCollapsed && (
                <>
                  <hr />
                  <CardText className="mb-3">{t('ABOUT_MORE')}</CardText>
                </>
              )}
            </CardBody>
          </Card>

          <Card className="shadow mt-3">
            <CardHeader className="bg-success text-white">
              <span className="fs--1">{t('SUPPORT_TITLE')}</span>
            </CardHeader>
            <CardBody>
              <CardText className="mb-1">{t('COMMUNITY_FREE')}</CardText>
              <ul className="mb-2">
                <li dangerouslySetInnerHTML={createMarkup(t('QQ_GROUP'))} />
                <li>{t('WECHAT_GROUP')}</li>
              </ul>
              <hr />
              <div className="d-flex align-items-center mb-2">
                <span className="badge" style={{ backgroundColor: 'rgb(22, 185, 152)', color: '#fff', marginRight: '8px' }}>{t('PLANET_BADGE')}</span>
                <strong className="fs--1">{t('PLANET_TITLE')}</strong>
              </div>
              <ul className="mb-2">
                <li>{t('PLANET_DESC_1')}</li>
                <li>{t('PLANET_DESC_2')}</li>
              </ul>
              <a href="https://t.zsxq.com/blbKD" target="_blank" rel="noopener noreferrer" className="btn btn-sm" style={{ backgroundColor: 'rgb(22, 185, 152)', borderColor: 'rgb(22, 185, 152)', color: '#fff' }}>
                {t('JOIN_NOW')} &rarr;
              </a>
            </CardBody>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="shadow h-100">
            <CardHeader className="bg-primary text-white">
              <span className="fs--1">{t('SCAN_QR')}</span>
            </CardHeader>
            <CardBody className="text-center">
              <div className="mb-3">
                <p className="text-muted mb-1" style={{ fontSize: '15px' }}>{t('WECHAT_MP')}</p>
                <CardImg
                  src={require('../../../assets/img/qrcode/qr_code_mp_weixin.png')}
                  className="img-thumbnail"
                  style={{ width: 128, height: 128 }}
                  alt={t('WECHAT_MP')}
                />
                <p className="mt-1 mb-0" style={{ fontSize: '13px', color: '#6c757d' }}>
                  {t('WECHAT_MP_DESC')}
                </p>
              </div>

              <hr />

              <div className="mb-3">
                <p className="text-muted mb-1" style={{ fontSize: '15px' }}>{t('WECHAT')}</p>
                <CardImg
                  src={require('../../../assets/img/qrcode/qr_code_wechat.png')}
                  className="img-thumbnail"
                  style={{ width: 128, height: 128 }}
                  alt={t('WECHAT')}
                />
                <p className="mt-1 mb-0" style={{ fontSize: '13px', color: '#6c757d' }}>13011132526</p>
              </div>

              <hr />

              <div className="mb-3">
                <p className="text-muted mb-1" style={{ fontSize: '15px' }}>{t('LARK')}</p>
                <CardImg
                  src={require('../../../assets/img/qrcode/qr_code_feishu.png')}
                  className="img-thumbnail"
                  style={{ width: 128, height: 128 }}
                  alt={t('LARK')}
                />
                <p className="mt-1 mb-0" style={{ fontSize: '13px', color: '#6c757d' }}>13011132526</p>
              </div>

              <hr />

              <div>
                <p className="text-muted" style={{ fontSize: '14px' }}>{t('VIDEO_ACCOUNT')}</p>
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default withTranslation()(withRedirect(KnowledgeBase));
