import React from 'react';
import PropTypes from 'prop-types';
import { Button, FormGroup, Label } from 'reactstrap';
import Flex from '../common/Flex';
import Loader from '../common/Loader';
import Select from '../common/Select';
import { isIterableArray } from '../../helpers/utils';

const EventCreateSelect = ({ loading, label, options, ...rest }) => (
  <FormGroup>
    <Flex justify="between" align="center">
      <Label className="mb-0">{label}</Label>
      <Button color="link" size="sm" className="pr-0">
        Add New
      </Button>
    </Flex>

    {loading ? <Loader /> : isIterableArray(options) && <Select options={options} {...rest} />}
  </FormGroup>
);

EventCreateSelect.propTypes = {
  loading: PropTypes.bool.isRequired,
  label: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  options: PropTypes.array.isRequired,
  value: PropTypes.array
};

export default EventCreateSelect;
