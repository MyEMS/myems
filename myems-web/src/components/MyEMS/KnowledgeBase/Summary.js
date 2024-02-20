import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Badge, Media } from 'reactstrap';
import Calendar from '../../common/Calendar';

const ReportBadge = ({ text, ...rest }) => <Badge {...rest}>{text}</Badge>;

ReportBadge.propTypes = {
  ...Badge.propTypes,
  text: PropTypes.string.isRequired
};

const handleExport = (fileName, fileBytesBase64) => e => {
  e.preventDefault();
  const mimeType = 'application/*';
  var fileUrl = 'data:' + mimeType + ';base64,' + fileBytesBase64;
  fetch(fileUrl)
    .then(response => response.blob())
    .then(blob => {
      var link = window.document.createElement('a');
      link.href = window.URL.createObjectURL(blob, { type: mimeType });
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
};

const Summary = ({ calendar, title, badge, divider, to, children, file_bytes_base64 }) => (
  <Media>
    <Calendar {...calendar} />
    <Media body className="position-relative pl-3">
      <h6 className="fs-0 mb-0">
        <Link to={to} onClick={handleExport(title, file_bytes_base64)}>
          {title}
        </Link>
        {badge && <ReportBadge {...badge} className="ml-1" />}
      </h6>
      {children}

      {divider && <hr className="border-dashed border-bottom-0" />}
    </Media>
  </Media>
);

Summary.propTypes = {
  calendar: PropTypes.shape(Calendar.propTypes).isRequired,
  title: PropTypes.string.isRequired,
  divider: PropTypes.bool,
  to: PropTypes.string.isRequired,
  badge: PropTypes.shape(ReportBadge.propTypes),
  children: PropTypes.node,
  file_bytes_base64: PropTypes.string.isRequired
};

Summary.defaultProps = { divider: true };

export default Summary;
