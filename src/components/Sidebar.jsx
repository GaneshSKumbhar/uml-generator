import { useRef } from 'react';
import Icon from './Icons';
import { REL_TYPES } from '../utils/constants';

const ELEMENTS = [
  { kind: 'class', label: 'Class', letter: 'C' },
  { kind: 'abstract', label: 'Abstract', letter: 'A' },
  { kind: 'interface', label: 'Interface', letter: 'I' },
];

function Switch({ checked, onChange, label }) {
  return (
    <label className="switch">
      <span>{label}</span>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <i />
    </label>
  );
}

function RelSwatch({ cfg }) {
  return (
    <svg width="40" height="14" viewBox="0 0 40 14">
      <line x1="1" y1="7" x2="30" y2="7" stroke={cfg.color} strokeWidth="2"
        strokeDasharray={cfg.dashed ? '4 3' : undefined} />
      {cfg.closed ? (
        <polygon points="39,7 29,2 29,12" fill={cfg.color} />
      ) : (
        <polyline points="31,2 39,7 31,12" fill="none" stroke={cfg.color} strokeWidth="2" />
      )}
    </svg>
  );
}

export default function Sidebar({
  onAdd, relType, setRelType,
  selectedEdge, onChangeRel, onReverse, onDeleteEdge,
  packageName, setPackageName,
  constructors, setConstructors, accessors, setAccessors,
  issues, onSave, onLoad, onClear,
}) {
  const fileRef = useRef(null);

  return (
    <aside className="sidebar">
      <section>
        <h3 className="section-title">Add element</h3>
        <div className="add-grid">
          {ELEMENTS.map((e) => (
            <button key={e.kind} className="add-card" onClick={() => onAdd(e.kind)}>
              <span className={`badge ${e.kind}`}>{e.letter}</span>
              {e.label}
            </button>
          ))}
        </div>
      </section>

      <section>
        <h3 className="section-title">New relationship type</h3>
        <div className="rel-list">
          {Object.entries(REL_TYPES).map(([k, v]) => (
            <button key={k} className={`rel ${relType === k ? 'active' : ''}`} onClick={() => setRelType(k)}>
              <RelSwatch cfg={v} />
              <span>
                <b>{v.name}</b>
                <small>{v.hint}</small>
              </span>
            </button>
          ))}
        </div>
      </section>

      {selectedEdge && (
        <section className="card">
          <h3 className="section-title">Selected relationship</h3>
          <div className="edge-title">
            <b>{selectedEdge.from}</b> <span>→</span> <b>{selectedEdge.to}</b>
          </div>
          <select className="field" value={selectedEdge.relType} onChange={(e) => onChangeRel(e.target.value)}>
            {Object.entries(REL_TYPES).map(([k, v]) => (
              <option key={k} value={k}>{v.name}</option>
            ))}
          </select>
          <div className="btn-row" style={{ marginTop: 8 }}>
            <button className="btn" onClick={onReverse}><Icon name="swap" /> Reverse</button>
            <button className="btn danger" onClick={onDeleteEdge}><Icon name="trash" /> Delete</button>
          </div>
          <p className="tiny">For inheritance the arrow must point from the child to the parent. If it is the wrong way round, press Reverse.</p>
        </section>
      )}

      <section className="card">
        <h3 className="section-title">Java options</h3>
        <input className="field" placeholder="package name (optional)" value={packageName}
          onChange={(e) => setPackageName(e.target.value)} />
        <div className="switches">
          <Switch label="Constructors" checked={constructors} onChange={setConstructors} />
          <Switch label="Getters / Setters" checked={accessors} onChange={setAccessors} />
        </div>
      </section>

      <section className="card">
        <h3 className="section-title">Diagram checks</h3>
        {issues.length === 0 ? (
          <div className="ok-line"><Icon name="check" /> No problems found</div>
        ) : (
          issues.map((i, idx) => (
            <div key={idx} className={`issue ${i.level}`}>
              <Icon name="alert" size={14} />
              <span>{i.text}</span>
            </div>
          ))
        )}
      </section>

      <section>
        <h3 className="section-title">Project</h3>
        <div className="btn-row">
          <button className="btn" onClick={onSave}><Icon name="download" /> Save</button>
          <button className="btn" onClick={() => fileRef.current?.click()}><Icon name="upload" /> Load</button>
        </div>
        <button className="btn danger full" onClick={onClear}><Icon name="trash" /> Clear diagram</button>
        <input ref={fileRef} type="file" accept=".json,application/json" hidden
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onLoad(f);
            e.target.value = '';
          }} />
      </section>
    </aside>
  );
}