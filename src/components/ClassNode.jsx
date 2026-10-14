import { Handle, Position, useReactFlow } from 'reactflow';
import { VISIBILITY, VIS_SYMBOL } from '../utils/constants';

const uid = () => Math.random().toString(36).slice(2, 8);

export default function ClassNode({ id, data, selected }) {
  const { setNodes, deleteElements } = useReactFlow();

  const update = (patch) =>
    setNodes((ns) => ns.map((n) => (n.id === id ? { ...n, data: { ...n.data, ...patch } } : n)));

  const updateItem = (key, itemId, patch) =>
    update({ [key]: data[key].map((i) => (i.id === itemId ? { ...i, ...patch } : i)) });

  const removeItem = (key, itemId) => update({ [key]: data[key].filter((i) => i.id !== itemId) });

  const addAttr = () =>
    update({ attributes: [...data.attributes, { id: uid(), visibility: 'private', type: 'String', name: '' }] });

  const addMethod = () =>
    update({
      methods: [
        ...data.methods,
        { id: uid(), visibility: 'public', returnType: 'void', name: '', params: '', abstract: data.kind === 'abstract' },
      ],
    });

  const stereotype = data.kind === 'interface' ? '«interface»' : data.kind === 'abstract' ? '«abstract»' : '';

  return (
    <div className={`uml-node ${data.kind} ${selected ? 'selected' : ''}`}>
      <Handle type="target" position={Position.Top} />

      {/* Header */}
      <div className="uml-header">
        <div className="uml-top-row">
          <select className="nodrag kind-select" value={data.kind} onChange={(e) => update({ kind: e.target.value })}>
            <option value="class">Class</option>
            <option value="abstract">Abstract</option>
            <option value="interface">Interface</option>
          </select>
          <button className="nodrag icon-btn" title="Delete class" onClick={() => deleteElements({ nodes: [{ id }] })}>✕</button>
        </div>
        {stereotype && <div className="stereotype">{stereotype}</div>}
        <input
          className="nodrag name-input"
          value={data.name}
          placeholder="ClassName"
          onChange={(e) => update({ name: e.target.value })}
        />
      </div>

      {/* Attributes */}
      {data.kind !== 'interface' && (
        <div className="uml-section">
          {data.attributes.map((a) => (
            <div className="row" key={a.id}>
              <select className="nodrag vis" value={a.visibility} onChange={(e) => updateItem('attributes', a.id, { visibility: e.target.value })}>
                {VISIBILITY.map((v) => <option key={v} value={v}>{VIS_SYMBOL[v]}</option>)}
              </select>
              <input className="nodrag" placeholder="name" value={a.name} onChange={(e) => updateItem('attributes', a.id, { name: e.target.value })} />
              <span>:</span>
              <input className="nodrag" placeholder="type" value={a.type} onChange={(e) => updateItem('attributes', a.id, { type: e.target.value })} />
              <button className="nodrag icon-btn" onClick={() => removeItem('attributes', a.id)}>−</button>
            </div>
          ))}
          <button className="nodrag add-btn" onClick={addAttr}>+ attribute</button>
        </div>
      )}

      {/* Methods */}
      <div className="uml-section">
        {data.methods.map((m) => (
          <div className="row" key={m.id}>
            <select className="nodrag vis" value={m.visibility} onChange={(e) => updateItem('methods', m.id, { visibility: e.target.value })}>
              {VISIBILITY.map((v) => <option key={v} value={v}>{VIS_SYMBOL[v]}</option>)}
            </select>
            <input className="nodrag" placeholder="method" value={m.name} onChange={(e) => updateItem('methods', m.id, { name: e.target.value })} />
            <span>(</span>
            <input className="nodrag params" placeholder="int a, String b" value={m.params} onChange={(e) => updateItem('methods', m.id, { params: e.target.value })} />
            <span>):</span>
            <input className="nodrag short" placeholder="void" value={m.returnType} onChange={(e) => updateItem('methods', m.id, { returnType: e.target.value })} />
            {data.kind === 'abstract' && (
              <label className="nodrag abs" title="abstract method">
                <input type="checkbox" checked={!!m.abstract} onChange={(e) => updateItem('methods', m.id, { abstract: e.target.checked })} />A
              </label>
            )}
            <button className="nodrag icon-btn" onClick={() => removeItem('methods', m.id)}>−</button>
          </div>
        ))}
        <button className="nodrag add-btn" onClick={addMethod}>+ method</button>
      </div>

      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}