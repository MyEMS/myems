import React from 'react';
import PropTypes from 'prop-types';
import { Col, Form, Input, InputGroup, InputGroupText, Label, Row } from 'reactstrap';

// A single numeric/text field with an optional unit suffix and a hint.
const Field = ({ t, id, label, value, onChange, unit, type = 'number', step, min, hint }) => (
  <div className="form-group">
    <Label for={id} className="fs--1 text-800">
      {t(label)}
    </Label>
    <InputGroup>
      <Input
        id={id}
        type={type}
        step={step}
        min={min}
        value={value}
        onChange={e => (type === 'number' ? onChange(e.target.value) : onChange(e.target.value))}
      />
      {unit && <InputGroupText>{unit}</InputGroupText>}
    </InputGroup>
    {hint && <small className="form-hint text-muted">{t(hint)}</small>}
  </div>
);

Field.propTypes = {
  t: PropTypes.func.isRequired,
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func.isRequired,
  unit: PropTypes.string,
  type: PropTypes.string,
  step: PropTypes.string,
  min: PropTypes.string,
  hint: PropTypes.string
};

const SelectField = ({ t, id, label, value, onChange, options }) => (
  <div className="form-group">
    <Label for={id} className="fs--1 text-800">
      {t(label)}
    </Label>
    <Input type="select" id={id} value={value} onChange={e => onChange(e.target.value)}>
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>
          {opt.labelKey ? t(opt.labelKey) : opt.label}
        </option>
      ))}
    </Input>
  </div>
);

SelectField.propTypes = {
  t: PropTypes.func.isRequired,
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func.isRequired,
  options: PropTypes.array.isRequired
};

const InputForm = ({ t, form, setField, standard }) => {
  const isBuried = form.method === 'buried';
  const usePower = form.inputMode === 'power';

  return (
    <Form>
      <Row form>
        <Col md={6}>
          <SelectField
            t={t}
            id="input-mode"
            label="Input Mode"
            value={form.inputMode}
            onChange={v => setField('inputMode', v)}
            options={[
              { value: 'power', labelKey: 'By Active Power' },
              { value: 'current', labelKey: 'By Current' }
            ]}
          />
        </Col>
        <Col md={6}>
          <SelectField
            t={t}
            id="phase-type"
            label="Phase"
            value={form.phaseType}
            onChange={v => setField('phaseType', v)}
            options={[
              { value: 'three', labelKey: 'Three Phase' },
              { value: 'single', labelKey: 'Single Phase' }
            ]}
          />
        </Col>
      </Row>

      <Row form>
        {usePower ? (
          <Col md={6}>
            <Field t={t} id="power" label="Active Power" value={form.powerkW} onChange={v => setField('powerkW', v)} unit="kW" step="0.1" min="0" />
          </Col>
        ) : (
          <Col md={6}>
            <Field t={t} id="current" label="Design Current Ib" value={form.designCurrentA} onChange={v => setField('designCurrentA', v)} unit="A" step="0.1" min="0" />
          </Col>
        )}
        <Col md={6}>
          <Field t={t} id="voltage" label="Voltage" value={form.voltageV} onChange={v => setField('voltageV', v)} unit="V" step="1" min="1" />
        </Col>
      </Row>

      <Row form>
        <Col md={6}>
          <Field t={t} id="power-factor" label="Power Factor" value={form.powerFactor} onChange={v => setField('powerFactor', v)} step="0.01" min="0" hint="Used for current and voltage drop" />
        </Col>
        <Col md={6}>
          <Field t={t} id="length" label="Circuit Length" value={form.lengthM} onChange={v => setField('lengthM', v)} unit="m" step="1" min="0" />
        </Col>
      </Row>

      <Row form>
        <Col md={6}>
          <SelectField t={t} id="material" label="Conductor Material" value={form.material} onChange={v => setField('material', v)} options={standard.materials} />
        </Col>
        <Col md={6}>
          <SelectField t={t} id="insulation" label="Insulation Type" value={form.insulation} onChange={v => setField('insulation', v)} options={standard.insulations} />
        </Col>
      </Row>

      <Row form>
        <Col md={6}>
          <SelectField t={t} id="method" label="Installation Method" value={form.method} onChange={v => setField('method', v)} options={standard.installMethods} />
        </Col>
        <Col md={6}>
          <SelectField t={t} id="cores" label="Number of Cores" value={form.cores} onChange={v => setField('cores', v)} options={standard.coresOptions} />
        </Col>
      </Row>

      <Row form>
        <Col md={4}>
          <Field t={t} id="ambient" label="Ambient Temperature" value={form.ambientTaC} onChange={v => setField('ambientTaC', v)} unit="C" step="1" min="0" />
        </Col>
        <Col md={4}>
          <Field t={t} id="circuits" label="Parallel Circuits" value={form.circuits} onChange={v => setField('circuits', v)} step="1" min="1" />
        </Col>
        <Col md={4}>{isBuried && <Field t={t} id="soil" label="Soil Resistivity" value={form.soilResistivity} onChange={v => setField('soilResistivity', v)} unit="K.m/W" step="0.1" min="0" />}</Col>
      </Row>

      <Row form>
        <Col md={6}>
          <Field t={t} id="breaker" label="Protection Device Rated Current" value={form.breakerInA} onChange={v => setField('breakerInA', v)} unit="A" step="1" min="0" hint="Leave 0 to skip In check" />
        </Col>
        <Col md={6}>
          <Field t={t} id="allowed-drop" label="Allowed Voltage Drop" value={form.allowedDropPercent} onChange={v => setField('allowedDropPercent', v)} unit="%" step="0.5" min="0" hint="Lighting 3%, power 5%" />
        </Col>
      </Row>

      <div className="form-group form-check">
        <Input
          className="form-check-input"
          type="checkbox"
          id="enable-thermal"
          checked={form.enableThermalStability}
          onChange={e => setField('enableThermalStability', e.target.checked)}
        />
        <Label className="form-check-label fs--1" for="enable-thermal">
          {t('Enable Thermal Stability Check')}
        </Label>
      </div>

      {form.enableThermalStability && (
        <Row form>
          <Col md={6}>
            <Field t={t} id="short-circuit" label="Short-circuit Current" value={form.shortCircuitCurrentA} onChange={v => setField('shortCircuitCurrentA', v)} unit="A" step="100" min="0" />
          </Col>
          <Col md={6}>
            <Field t={t} id="clearing-time" label="Clearing Time" value={form.clearingTimeS} onChange={v => setField('clearingTimeS', v)} unit="s" step="0.1" min="0" />
          </Col>
        </Row>
      )}
    </Form>
  );
};

InputForm.propTypes = {
  t: PropTypes.func.isRequired,
  form: PropTypes.object.isRequired,
  setField: PropTypes.func.isRequired,
  standard: PropTypes.object.isRequired
};

export default InputForm;
