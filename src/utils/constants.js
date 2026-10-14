import { MarkerType } from 'reactflow';

export const REL_TYPES = {
  inheritance: { name: 'Inheritance', short: 'extends', hint: 'Child → Parent (extends)', color: '#2563eb', dashed: false, closed: true, marker: MarkerType.ArrowClosed },
  realization: { name: 'Realization', short: 'implements', hint: 'Class → Interface (implements)', color: '#7c3aed', dashed: true, closed: true, marker: MarkerType.ArrowClosed },
  association: { name: 'Association', short: 'association', hint: 'Adds a field of the other type', color: '#64748b', dashed: false, closed: false, marker: MarkerType.Arrow },
  aggregation: { name: 'Aggregation', short: 'aggregation', hint: 'Adds a List<Other> field', color: '#059669', dashed: false, closed: false, marker: MarkerType.Arrow },
  composition: { name: 'Composition', short: 'composition', hint: 'Part-of: owned field', color: '#dc2626', dashed: false, closed: false, marker: MarkerType.Arrow },
};

export const VISIBILITY = ['public', 'private', 'protected', 'package'];
export const VIS_SYMBOL = { public: '+', private: '-', protected: '#', package: '~' };