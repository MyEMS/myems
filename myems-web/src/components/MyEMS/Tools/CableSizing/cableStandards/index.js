import GB from './GB';

// Standard registry. Add new standards (IEC 60364, NEC, ...) by importing the
// module and registering it here. The UI and calc engine stay unchanged.
const standards = {
  GB
};

export function listStandards() {
  return Object.keys(standards).map(id => standards[id]);
}

export function getStandard(id) {
  return standards[id] || standards.GB;
}

export default standards;
