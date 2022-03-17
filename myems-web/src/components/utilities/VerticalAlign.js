import React, { Fragment } from 'react';
import { Card, CardHeader, CardBody } from 'reactstrap';
import PageHeader from '../common/PageHeader';
import FalconEditor from '../common/FalconEditor';

const baselineCode = `<Fragment>
  <span className="align-baseline">baseline</span>
  <span className="align-top">top</span>
  <span className="align-middle">middle</span>
  <span className="align-bottom">bottom</span>
  <span className="align-text-top">text-top</span>
  <span className="align-text-bottom">text-bottom</span>
</Fragment>`;

const tableCellsCode = `<Fragment>
  <table style={{height: '100px'}}>
    <tbody>
      <tr>
        <td className="align-baseline">baseline</td>
        <td className="align-top">top</td>
        <td className="align-middle">middle</td>
        <td className="align-bottom">bottom</td>
        <td className="align-text-top">text-top</td>
        <td className="align-text-bottom">text-bottom</td>
      </tr>
    </tbody>
  </table>
</Fragment>`;

const VerticalAlign = () => {
  return (
    <Fragment>
      <PageHeader
        title="Vertical Align"
        description="Easily change the vertical alignment of inline, inline-block, inline-table, and table cell elements."
        className="mb-3"
      />
      <Card>
        <CardHeader>
          <h5 className="mb-2">Example</h5>
          <p>
            Change the alignment of elements with the vertical-alignment utilities. Please note that vertical-align only
            affects inline, inline-block, inline-table, and table cell elements.
          </p>
          <p>
            Choose from <code>.align-baseline, </code>
            <code>.align-top, </code>
            <code>.align-middle, </code>
            <code>.align-bottom, </code>
            <code>.align-text-bottom, </code>and <code>.align-text-top as needed.</code>
          </p>
          <p>
            Multiple links and tap targets are not recommended with stretched links. However, some{' '}
            <code>position </code>and <code>z-index </code>styles can help should this be required.
          </p>
        </CardHeader>
        <CardBody className="bg-light">
          <FalconEditor code={baselineCode} />
          <p className="mt-4">With table cells:</p>
          <FalconEditor code={tableCellsCode} language="jsx" />
        </CardBody>
      </Card>
    </Fragment>
  );
};

export default VerticalAlign;
