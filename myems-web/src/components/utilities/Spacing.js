import React, { Fragment } from 'react';
import { Card, CardBody } from 'reactstrap';
import PageHeader from '../common/PageHeader';

const Spacing = () => (
  <Fragment>
    <PageHeader title="Spacing" className="mb-3">
      <p className="mt-2 mb-0">
        Spacing utilities that apply to all breakpoints, from <code>xs</code> to <code>xxl</code>, have no breakpoint
        abbreviation in them. This is because those classes are applied from <code>min-width: 0</code> and up, and thus
        are not bound by a media query. The remaining breakpoints, however, do include a breakpoint abbreviation.
      </p>
    </PageHeader>
    <Card>
      <CardBody>
        <p>
          The classes are named using the format{' '}
          <code>
            {'{property}'}
            {'{sides}'}-{'{size}'}
          </code>{' '}
          for <code>xs</code> and{' '}
          <code>
            {'{property}'}
            {'{sides}'}-{'{breakpoint}'}-{'{size}'}
          </code>{' '}
          for <code>sm</code>, <code>md</code>, <code>lg</code>, <code>xl</code> and <code>xxl</code>.
        </p>
        <p>
          Where<em>property</em> is one of:
        </p>
        <ul>
          <li>
            <code>m</code> - for classes that set <code>margin</code>
          </li>
          <li>
            <code>p</code> - for classes that set <code>padding</code>
          </li>
        </ul>
        <p>
          Where<em>sides</em> is one of:
        </p>
        <ul>
          <li>
            <code>t</code> - for classes that set <code>margin-top</code> or <code>padding-top</code>
          </li>
          <li>
            <code>b</code> - for classes that set <code>margin-bottom</code> or <code>padding-bottom</code>
          </li>
          <li>
            <code>l</code> - for classes that set <code>margin-left</code> or <code>padding-left</code>
          </li>
          <li>
            <code>r</code> - for classes that set <code>margin-right</code> or <code>padding-right</code>
          </li>
          <li>
            <code>x</code> - for classes that set both <code>*-left</code> and <code>*-right</code>
          </li>
          <li>
            <code>y</code> - for classes that set both <code>*-top</code> and <code>*-bottom</code>
          </li>
          <li>
            blank - for classes that set a <code>margin</code> or <code>padding</code> on all 4 sides of the element
          </li>
        </ul>
        <p>
          Where<em>size</em> is one of: <code>0</code>, <code>1</code>, <code>2</code>, <code>3</code>, <code>4</code>,{' '}
          <code>5</code>, <code>6</code>, <code>7</code>, <code>8</code>, <code>9</code>, <code>10</code>,{' '}
          <code>11</code> &amp; <code>auto</code>
        </p>
      </CardBody>
    </Card>
  </Fragment>
);

export default Spacing;
