import React, { Fragment } from 'react';
import { Card, CardBody } from 'reactstrap';
import PageHeader from '../common/PageHeader';
import FalconCardHeader from '../common/FalconCardHeader';
import FalconEditor from '../common/FalconEditor';
import SearchBox from '../navbar/SearchBox';
import autoCompleteInitialItem from '../../data/autocomplete/autocomplete';

const alertCode = `function Searchbox () {
  return <SearchBox autoCompleteItem={autoCompleteInitialItem} />
}`;

const AutocompleteExample = () => (
  <Fragment>
    <PageHeader
      title="Autocomplete Search"
      description="An autocomplete search dropdown with clean and simple design."
      className="mb-3"
    />
    <Card className="mb-3">
      <FalconCardHeader title="Example" light={false} />
      <CardBody className="bg-light">
        <FalconEditor code={alertCode} scope={{ SearchBox, autoCompleteInitialItem }} language="jsx" />
      </CardBody>
    </Card>
  </Fragment>
);

export default AutocompleteExample;
