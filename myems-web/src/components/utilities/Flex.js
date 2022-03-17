import React, { Fragment } from 'react';
import { Card, CardHeader, CardBody } from 'reactstrap';
import FalconEditor from '../common/FalconEditor';
import PageHeader from '../common/PageHeader';

const flexboxExampleCode = `<Fragment>
  <div className="d-flex p-2 bg-200 mb-2">Flexbox container!</div>
  <div className="d-inline-flex p-2 bg-200">Inline flexbox container!</div>
</Fragment>`;

const flexboxDirectionCode = `<Fragment>
  <div className="d-flex flex-row bg-200 mb-3">
    <div className="p-2 bg-300 border border-400">Flex item 1</div>
    <div className="p-2 bg-300 border border-400">Flex item 2</div>
    <div className="p-2 bg-300 border border-400">Flex item 3</div>
  </div>
  <div className="d-flex flex-row-reverse bg-200">
    <div className="p-2 bg-300 border border-400">Flex item 1</div>
    <div className="p-2 bg-300 border border-400">Flex item 2</div>
    <div className="p-2 bg-300 border border-400">Flex item 3</div>
  </div>
</Fragment>`;

const flexItemCode = `<Fragment>
  <div className="d-flex flex-column bg-200 mb-3">
    <div className="p-2 bg-200 border border-400">Flex item 1</div>
    <div className="p-2 bg-200 border border-400">Flex item 2</div>
    <div className="p-2 bg-200 border border-400">Flex item 3</div>
  </div>
  <div className="d-flex flex-column-reverse bg-200">
    <div className="p-2 bg-200 border border-400">Flex item 1</div>
    <div className="p-2 bg-200 border border-400">Flex item 2</div>
    <div className="p-2 bg-200 border border-400">Flex item 3</div>
  </div>
</Fragment>`;

const justifyContentCode = `<Fragment>
  <div className="d-flex justify-content-start bg-200 mb-2">
    <div className="p-2 bg-300 border border-400">Flex Item</div>
  </div>
  <div className="d-flex justify-content-end bg-200 mb-2">
    <div className="p-2 bg-300 border border-400">Flex Item</div>
  </div>
  <div className="d-flex justify-content-center bg-200 mb-2">
    <div className="p-2 bg-300 border border-400">Flex Item</div>
  </div>
  <div className="d-flex justify-content-between bg-200 mb-2">
    <div className="p-2 bg-300 border border-400">Flex Item</div>
  </div>
  <div className="d-flex justify-content-around bg-200 mb-2">
    <div className="p-2 bg-300 border border-400">Flex Item</div>
  </div>
</Fragment>`;

const flexAlignItemCode = `<Fragment>
  <div className="d-flex align-items-start bg-200 mb-2" style={{ height: '5rem' }}>
    <div className="p-2 bg-300 border border-400">Flex item</div>
  </div>
  <div className="d-flex align-items-end bg-200 mb-2" style={{ height: '5rem' }}>
    <div className="p-2 bg-300 border border-400">Flex item</div>
  </div>
  <div className="d-flex align-items-center bg-200 mb-2" style={{ height: '5rem' }}>
    <div className="p-2 bg-300 border border-400">Flex item</div>
  </div>
  <div className="d-flex align-items-baseline bg-200 mb-2" style={{ height: '5rem' }}>
    <div className="p-2 bg-300 border border-400">Flex item</div>
  </div>
  <div className="d-flex align-items-stretch bg-200 mb-2" style={{ height: '5rem' }}>
    <div className="p-2 bg-300 border border-400">Flex item</div>
  </div>
</Fragment>`;

const alignSelfCode = `<Fragment>
 <div className="d-flex bg-200 mb-2" style={{ height: '5rem' }}>
    <div className="border border-400 p-2 bg-300">Flex Item</div>
    <div className="border border-400 align-self-start p-2 bg-300">Align self start</div>
    <div className="border border-400 p-2 bg-300">Flex Item</div>
  </div>
  <div className="d-flex bg-200 mb-2" style={{ height: '5rem' }}>
    <div className="border border-400 p-2 bg-300">Flex Item</div>
    <div className="border border-400 align-self-end p-2 bg-300">Align self end</div>
    <div className="border border-400 p-2 bg-300">Flex Item</div>
  </div>
  <div className="d-flex bg-200 mb-2" style={{ height: '5rem' }}>
    <div className="border border-400 p-2 bg-300">Flex Item</div>
    <div className="border border-400 align-self-center p-2 bg-300">Align self center</div>
    <div className="border border-400 p-2 bg-300">Flex Item</div>
  </div>
  <div className="d-flex bg-200 mb-2" style={{ height: '5rem' }}>
    <div className="border border-400 p-2 bg-300">Flex Item</div>
    <div className="border border-400 align-self-baseline p-2 bg-300">Align self baseline</div>
    <div className="border border-400 p-2 bg-300">Flex Item</div>
  </div>
  <div className="d-flex bg-200 mb-2" style={{ height: '5rem' }}>
    <div className="border border-400 p-2 bg-300">Flex Item</div>
    <div className="border border-400 align-self-stretch p-2 bg-300">Align self stretch</div>
    <div className="border border-400 p-2 bg-300">Flex Item</div>
  </div>
</Fragment>`;

const flexFillCode = `<Fragment>
  <div className="d-flex bg-200">
    <div className="p-2 flex-fill bg-300 border border-400">Flex item with a lot of content</div>
    <div className="p-2 flex-fill bg-300 border border-400">Flex item</div>
    <div className="p-2 flex-fill bg-300 border border-400">Flex item</div>
  </div>
</Fragment>`;

const growAndShrinkCode = `<Fragment>
  <div className="d-flex bg-200">
    <div className="p-2 w-100 bg-300 border border-400">Flex item</div>
    <div className="p-2 flex-shrink-1 bg-300 border border-400">Flex item</div>
  </div>
</Fragment>`;

const autoMarginCode = `<Fragment>
  <div className="d-flex bg-200 mb-2">
    <div className="p-2 bg-300 border border-400">Flex item</div>
    <div className="p-2 bg-300 border border-400">Flex item</div>
    <div className="p-2 bg-300 border border-400">Flex item</div>
  </div>
  <div className="d-flex bg-200 mb-2">
    <div className="mr-auto p-2 bg-300 border border-400">Flex item</div>
    <div className="p-2 bg-300 border border-400">Flex item</div>
    <div className="p-2 bg-300 border border-400">Flex item</div>
  </div>
  <div className="d-flex bg-200 mb-2">
    <div className="p-2 bg-300 border border-400">Flex item</div>
    <div className="p-2 bg-300 border border-400">Flex item</div>
    <div className="ml-auto p-2 bg-300 border border-400">Flex item</div>
  </div>
</Fragment>`;

const withAlignItemsCode = `<Fragment>
  <div className="d-flex align-items-start flex-column bg-200 mb-3" style={{ height: '200px' }}>
    <div className="mb-auto p-2 bg-300 border border-400">Flex item</div>
    <div className="p-2 bg-300 border border-400">Flex item</div>
    <div className="p-2 bg-300 border border-400">Flex item</div>
  </div>
  <div className="d-flex align-items-end flex-column bg-200 mb-3" style={{ height: '200px' }}>
    <div className="p-2 bg-300 border border-400">Flex item</div>
    <div className="p-2 bg-300 border border-400">Flex item</div>
    <div className="mt-auto p-2 bg-300 border border-400">Flex item</div>
  </div>
</Fragment>`;

const flexWrapCode = `<Fragment>
  <div className="d-flex flex-nowrap mb-3 bg-200 border border-300 py-3" style={{width: '8rem'}}>
    <div className="p-2 bg-300 border border-400">Flex item</div>
    <div className="p-2 bg-300 border border-400">Flex item</div>
    <div className="p-2 bg-300 border border-400">Flex item</div>
    <div className="p-2 bg-300 border border-400">Flex item</div>
    <div className="p-2 bg-300 border border-400">Flex item</div>
  </div>
  <div className="d-flex flex-wrap mb-3 bg-200 border border-300">
    <div className="p-2 bg-300 border border-400">Flex item</div>
    <div className="p-2 bg-300 border border-400">Flex item</div>
    <div className="p-2 bg-300 border border-400">Flex item</div>
    <div className="p-2 bg-300 border border-400">Flex item</div>
    <div className="p-2 bg-300 border border-400">Flex item</div>
    <div className="p-2 bg-300 border border-400">Flex item</div>
    <div className="p-2 bg-300 border border-400">Flex item</div>
    <div className="p-2 bg-300 border border-400">Flex item</div>
    <div className="p-2 bg-300 border border-400">Flex item</div>
    <div className="p-2 bg-300 border border-400">Flex item</div>
    <div className="p-2 bg-300 border border-400">Flex item</div>
    <div className="p-2 bg-300 border border-400">Flex item</div>
    <div className="p-2 bg-300 border border-400">Flex item</div>
    <div className="p-2 bg-300 border border-400">Flex item</div>
  </div>
  <div className="d-flex flex-wrap-reverse mb-3 bg-200 border border-300">
    <div className="p-2 bg-300 border border-400">Flex item</div>
    <div className="p-2 bg-300 border border-400">Flex item</div>
    <div className="p-2 bg-300 border border-400">Flex item</div>
    <div className="p-2 bg-300 border border-400">Flex item</div>
    <div className="p-2 bg-300 border border-400">Flex item</div>
    <div className="p-2 bg-300 border border-400">Flex item</div>
    <div className="p-2 bg-300 border border-400">Flex item</div>
    <div className="p-2 bg-300 border border-400">Flex item</div>
    <div className="p-2 bg-300 border border-400">Flex item</div>
    <div className="p-2 bg-300 border border-400">Flex item</div>
    <div className="p-2 bg-300 border border-400">Flex item</div>
    <div className="p-2 bg-300 border border-400">Flex item</div>
    <div className="p-2 bg-300 border border-400">Flex item</div>
    <div className="p-2 bg-300 border border-400">Flex item</div>
  </div>
</Fragment>`;

const flexOrderCode = `<Fragment>
  <div className="d-flex flex-nowrap bg-200">
    <div className="order-3 p-2 bg-300 border border-400">First flex item</div>
    <div className="order-2 p-2 bg-300 border border-400">Second flex item</div>
    <div className="order-1 p-2 bg-300 border border-400">Third flex item</div>
  </div>
</Fragment>`;

const flexAlignContentCode = `<Fragment>
  <div className="d-flex align-content-start flex-wrap bg-200 mb-3" style={{ height: '300px' }}>
    <div className="p-2 bg-300 border border-400">Flex item</div>
    <div className="p-2 bg-300 border border-400">Flex item</div>
    <div className="p-2 bg-300 border border-400">Flex item</div>
    <div className="p-2 bg-300 border border-400">Flex item</div>
    <div className="p-2 bg-300 border border-400">Flex item</div>
    <div className="p-2 bg-300 border border-400">Flex item</div>
    <div className="p-2 bg-300 border border-400">Flex item</div>
    <div className="p-2 bg-300 border border-400">Flex item</div>
    <div className="p-2 bg-300 border border-400">Flex item</div>
    <div className="p-2 bg-300 border border-400">Flex item</div>
    <div className="p-2 bg-300 border border-400">Flex item</div>
    <div className="p-2 bg-300 border border-400">Flex item</div>
    <div className="p-2 bg-300 border border-400">Flex item</div>
    <div className="p-2 bg-300 border border-400">Flex item</div>
  </div>
  <div className="d-flex align-content-end flex-wrap bg-200 mb-3" style={{ height: '300px' }}>
    <div className="p-2 bg-300 border border-400">Flex item</div>
    <div className="p-2 bg-300 border border-400">Flex item</div>
    <div className="p-2 bg-300 border border-400">Flex item</div>
    <div className="p-2 bg-300 border border-400">Flex item</div>
    <div className="p-2 bg-300 border border-400">Flex item</div>
    <div className="p-2 bg-300 border border-400">Flex item</div>
    <div className="p-2 bg-300 border border-400">Flex item</div>
    <div className="p-2 bg-300 border border-400">Flex item</div>
    <div className="p-2 bg-300 border border-400">Flex item</div>
    <div className="p-2 bg-300 border border-400">Flex item</div>
    <div className="p-2 bg-300 border border-400">Flex item</div>
    <div className="p-2 bg-300 border border-400">Flex item</div>
    <div className="p-2 bg-300 border border-400">Flex item</div>
    <div className="p-2 bg-300 border border-400">Flex item</div>
  </div>
  <div className="d-flex align-content-center flex-wrap bg-200 mb-3" style={{ height: '300px' }}>
    <div className="p-2 bg-300 border border-400">Flex item</div>
    <div className="p-2 bg-300 border border-400">Flex item</div>
    <div className="p-2 bg-300 border border-400">Flex item</div>
    <div className="p-2 bg-300 border border-400">Flex item</div>
    <div className="p-2 bg-300 border border-400">Flex item</div>
    <div className="p-2 bg-300 border border-400">Flex item</div>
    <div className="p-2 bg-300 border border-400">Flex item</div>
    <div className="p-2 bg-300 border border-400">Flex item</div>
    <div className="p-2 bg-300 border border-400">Flex item</div>
    <div className="p-2 bg-300 border border-400">Flex item</div>
    <div className="p-2 bg-300 border border-400">Flex item</div>
    <div className="p-2 bg-300 border border-400">Flex item</div>
    <div className="p-2 bg-300 border border-400">Flex item</div>
    <div className="p-2 bg-300 border border-400">Flex item</div>
  </div>
  <div className="d-flex align-content-between flex-wrap bg-200 mb-3" style={{ height: '300px' }}>
    <div className="p-2 bg-300 border border-400">Flex item</div>
    <div className="p-2 bg-300 border border-400">Flex item</div>
    <div className="p-2 bg-300 border border-400">Flex item</div>
    <div className="p-2 bg-300 border border-400">Flex item</div>
    <div className="p-2 bg-300 border border-400">Flex item</div>
    <div className="p-2 bg-300 border border-400">Flex item</div>
    <div className="p-2 bg-300 border border-400">Flex item</div>
    <div className="p-2 bg-300 border border-400">Flex item</div>
    <div className="p-2 bg-300 border border-400">Flex item</div>
    <div className="p-2 bg-300 border border-400">Flex item</div>
    <div className="p-2 bg-300 border border-400">Flex item</div>
    <div className="p-2 bg-300 border border-400">Flex item</div>
    <div className="p-2 bg-300 border border-400">Flex item</div>
    <div className="p-2 bg-300 border border-400">Flex item</div>
  </div>
  <div className="d-flex align-content-around flex-wrap bg-200 mb-3" style={{ height: '300px' }}>
    <div className="p-2 bg-300 border border-400">Flex item</div>
    <div className="p-2 bg-300 border border-400">Flex item</div>
    <div className="p-2 bg-300 border border-400">Flex item</div>
    <div className="p-2 bg-300 border border-400">Flex item</div>
    <div className="p-2 bg-300 border border-400">Flex item</div>
    <div className="p-2 bg-300 border border-400">Flex item</div>
    <div className="p-2 bg-300 border border-400">Flex item</div>
    <div className="p-2 bg-300 border border-400">Flex item</div>
    <div className="p-2 bg-300 border border-400">Flex item</div>
    <div className="p-2 bg-300 border border-400">Flex item</div>
    <div className="p-2 bg-300 border border-400">Flex item</div>
    <div className="p-2 bg-300 border border-400">Flex item</div>
    <div className="p-2 bg-300 border border-400">Flex item</div>
    <div className="p-2 bg-300 border border-400">Flex item</div>
  </div>
  <div className="d-flex align-content-stretch flex-wrap bg-200 mb-3" style={{ height: '300px' }}>
    <div className="p-2 bg-300 border border-400">Flex item</div>
    <div className="p-2 bg-300 border border-400">Flex item</div>
    <div className="p-2 bg-300 border border-400">Flex item</div>
    <div className="p-2 bg-300 border border-400">Flex item</div>
    <div className="p-2 bg-300 border border-400">Flex item</div>
    <div className="p-2 bg-300 border border-400">Flex item</div>
    <div className="p-2 bg-300 border border-400">Flex item</div>
    <div className="p-2 bg-300 border border-400">Flex item</div>
    <div className="p-2 bg-300 border border-400">Flex item</div>
    <div className="p-2 bg-300 border border-400">Flex item</div>
    <div className="p-2 bg-300 border border-400">Flex item</div>
    <div className="p-2 bg-300 border border-400">Flex item</div>
    <div className="p-2 bg-300 border border-400">Flex item</div>
    <div className="p-2 bg-300 border border-400">Flex item</div>
  </div>
</Fragment>`;

const Flex = () => (
  <Fragment>
    <PageHeader
      title="Flex"
      description="Quickly manage the layout, alignment, and sizing of grid columns, navigation, components, and more with a full suite of responsive flexbox utilities. For more complex implementations, custom CSS may be necessary."
      className="mb-3"
    />
    <Card className="mb-3">
      <CardHeader>
        <h5 className="mb-1">Enable flex behaviors</h5>
        <p className="mb-0">
          Apply <code>display</code> utilities to create a flexbox container and transform direct children elements into
          flex items. Flex containers and items are able to be modified further with additional flex properties.
        </p>
      </CardHeader>
      <CardBody className="bg-light">
        <FalconEditor code={flexboxExampleCode} />
      </CardBody>
    </Card>
    <Card className="mb-3">
      <CardHeader>
        <h5 className="mb-1">Direction</h5>
        <p className="mb-0">
          Use <code>.flex-row </code>to set a horizontal direction (the browser default), or .flex-row-reverse to start
          the horizontal direction from the opposite side.
        </p>
      </CardHeader>
      <CardBody className="bg-light">
        <FalconEditor code={flexboxDirectionCode} />
        <p className="mt-3">
          Use <code>.flex-column </code>to set a vertical direction, or <code>.flex-column-reverse </code>to start the
          vertical direction from the opposite side
        </p>
        <FalconEditor code={flexItemCode} />
      </CardBody>
    </Card>
    <Card className="mb-3">
      <CardHeader>
        <h5 className="mb-1">Justify Content</h5>
        <p className="mb-0">
          Use <code>justify-content </code>utilities on flexbox containers to change the alignment of flex items on the
          main axis (the x-axis to start, y-axis if <code>flex-direction: column</code>). Choose from start (browser
          default), <code>end</code>, <code>center</code>, <code>between</code>, or <code>around.</code>
        </p>
      </CardHeader>
      <CardBody className="bg-light">
        <FalconEditor code={justifyContentCode} />
      </CardBody>
    </Card>
    <Card className="mb-3">
      <CardHeader>
        <h5 className="mb-1">Align items</h5>
        <p>
          Use <code>align-items </code>utilities on flexbox containers to change the alignment of flex items on the
          cross axis (the y-axis to start, x-axis if <code>flex-direction: column</code>). Choose from{' '}
          <code>start</code>, <code>end</code>, <code>center</code>, <code>baseline</code>, or{' '}
          <code>stretch (browser default).</code>
        </p>
      </CardHeader>
      <CardBody className="bg-light">
        <FalconEditor code={flexAlignItemCode} language="jsx" />
      </CardBody>
    </Card>
    <Card className="mb-3">
      <CardHeader>
        <h5 className="mb-1">Align self</h5>
        <p className="mb-0">
          Use <code>align-self </code>utilities on flexbox items to individually change their alignment on the cross
          axis (the y-axis to start, x-axis if <code>flex-direction: column</code>). Choose from the same options as{' '}
          <code>align-items: start, </code>
          <code>end</code>, <code>center</code>, <code>baseline</code>, or <code>stretch (browser default).</code>
        </p>
      </CardHeader>
      <CardBody className="bg-light">
        <FalconEditor code={alignSelfCode} language="jsx" />
      </CardBody>
    </Card>
    <Card className="mb-3">
      <CardHeader>
        <h5 className="mb-1">Fill</h5>
        <p className="mb-0">
          Use the <code>.flex-fill </code>class on a series of sibling elements to force them into widths equal to their
          content (or equal widths if their content does not surpass their border-boxes) while taking up all available
          horizontal space.
        </p>
      </CardHeader>
      <CardBody className="bg-light">
        <FalconEditor code={flexFillCode} />
      </CardBody>
    </Card>
    <Card className="mb-3">
      <CardHeader>
        <h5 className="mb-1">Grow and shrink</h5>
        <p className="mb-0">
          Use <code>.flex-grow-* </code>utilities to toggle a flex item’s ability to grow to fill available space. In
          the example below, the <code>.flex-grow-1 </code>elements uses all available space it can, while allowing the
          remaining two flex items their necessary space.
        </p>
      </CardHeader>
      <CardBody className="bg-light">
        <FalconEditor code={growAndShrinkCode} />
      </CardBody>
    </Card>
    <Card className="mb-3">
      <CardHeader>
        <h5 className="mb-1">Auto margins</h5>
        <p className="mb-0">
          Flexbox can do some pretty awesome things when you mix flex alignments with auto margins. Shown below are
          three examples of controlling flex items via auto margins: default (no auto margin), pushing two items to the
          right (<code>.mr-auto</code>), and pushing two items to the left (<code>.ml-auto</code>).
        </p>
      </CardHeader>
      <CardBody>
        <FalconEditor code={autoMarginCode} />
      </CardBody>
    </Card>
    <Card className="mb-3">
      <CardHeader>
        <h5 className="mb-1">With align items</h5>
        <p className="mb-0">
          Vertically move one flex item to the top or bottom of a container by mixing <code>align-items</code>,{' '}
          <code>flex-direction: column </code>, and <code>margin-top: auto or margin-bottom: auto.</code>
        </p>
      </CardHeader>
      <CardBody>
        <FalconEditor code={withAlignItemsCode} language="jsx" />
      </CardBody>
    </Card>
    <Card className="mb-3">
      <CardHeader>
        <h5 className="mb-1">Wrap</h5>
        <p className="mb-0">
          Change how flex items wrap in a flex container. Choose from no wrapping at all (the browser default) with{' '}
          <code>.flex-nowrap</code>, wrapping with <code>.flex-wrap</code>, or reverse wrapping with{' '}
          <code>.flex-wrap-reverse</code>.
        </p>
      </CardHeader>
      <CardBody className="bg-light">
        <FalconEditor code={flexWrapCode} language="jsx" />
      </CardBody>
    </Card>
    <Card className="mb-3">
      <CardHeader>
        <h5 className="mb-1">Order</h5>
        <p className="mb-0">
          Change the <em>visual </em>order of specific flex items with a handful of <code>order </code>utilities. We
          only provide options for making an item first or last, as well as a reset to use the DOM order. As
          <code>order </code>takes any integer value (e.g., <code>5</code>), add custom CSS for any additional values
          needed.
        </p>
      </CardHeader>
      <CardBody className="bg-light">
        <FalconEditor code={flexOrderCode} />
      </CardBody>
    </Card>
    <Card className="mb-3">
      <CardHeader>
        <h5 className="mb-1">Align content</h5>
        <p className="mb-0">
          Use <code>align-content </code>utilities on flexbox containers to align flex items <em>together </em>on the
          cross axis. Choose from <code>start (browser default)</code>, <code>end</code>, <code>center</code>,
          <code>between</code>, <code>around</code>, or
          <code>stretch. To demonstrate these utilities, we’ve enforced </code>
          <code>flex-wrap: wrap </code>and increased the number of flex items.
        </p>
      </CardHeader>
      <CardBody className="bg-light">
        <FalconEditor code={flexAlignContentCode} language="jsx" />
      </CardBody>
    </Card>
  </Fragment>
);

export default Flex;
