import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ReactFlow, {
  Background, BackgroundVariant, Controls, MiniMap, addEdge,
  useNodesState, useEdgesState, useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';

import ClassNode from './components/ClassNode';
import CodePanel from './components/CodePanel';
import Sidebar from './components/Sidebar';
import Icon from './components/Icons';
import { generateAll } from './utils/javaGenerator';
import { validate } from './utils/validate';
import { downloadBlob } from './utils/download';
import { REL_TYPES } from './utils/constants';

const nodeTypes = { umlClass: ClassNode };
const STORAGE_KEY = 'uml-diagram-v1';
const THEME_KEY = 'uml-theme';
const uid = () => Math.random().toString(36).slice(2, 8);

const makeNode = (kind, position, name = '') => ({
  id: uid(),
  type: 'umlClass',
  position,
  data: { name, kind, attributes: [], methods: [] },
});

const relProps = (relType) => {
  const cfg = REL_TYPES[relType];
  return {
    label: cfg.short,
    data: { relType },
    markerEnd: { type: cfg.marker, color: cfg.color, width: 22, height: 22 },
    style: { stroke: cfg.color, strokeWidth: 2, strokeDasharray: cfg.dashed ? '6 4' : undefined },
    labelStyle: { fill: cfg.color, fontWeight: 600, fontSize: 11 },
    labelBgPadding: [6, 3],
    labelBgBorderRadius: 4,
  };
};

const makeEdge = (conn, relType) => ({
  ...conn,
  id: `e-${uid()}`,
  type: 'smoothstep',
  ...relProps(relType),
});

function initialDiagram() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved?.nodes) {
      return {
        projectName: saved.projectName || 'Untitled diagram',
        nodes: saved.nodes,
        edges: saved.edges || [],
      };
    }
  } catch { /* ignore */ }

  const animal = makeNode('abstract', { x: 250, y: 20 }, 'Animal');
  animal.data.attributes = [{ id: uid(), visibility: 'private', type: 'String', name: 'name' }];
  animal.data.methods = [{ id: uid(), visibility: 'public', returnType: 'void', name: 'makeSound', params: '', abstract: true }];
  const dog = makeNode('class', { x: 250, y: 330 }, 'Dog');
  dog.data.attributes = [{ id: uid(), visibility: 'private', type: 'String', name: 'breed' }];

  return {
    projectName: 'Untitled diagram',
    nodes: [animal, dog],
    edges: [makeEdge({ source: dog.id, target: animal.id }, 'inheritance')],
  };
}

function initialTheme() {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved) return saved;
  } catch { /* ignore */ }
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export default function App() {
  const init = useMemo(initialDiagram, []);
  const [nodes, setNodes, onNodesChange] = useNodesState(init.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(init.edges);
  const [projectName, setProjectName] = useState(init.projectName);

  const [relType, setRelType] = useState('inheritance');
  const [packageName, setPackageName] = useState('');
  const [accessors, setAccessors] = useState(true);
  const [constructors, setConstructors] = useState(true);

  const [theme, setTheme] = useState(initialTheme);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [codeOpen, setCodeOpen] = useState(true);

  const wrapper = useRef(null);
  const { screenToFlowPosition, fitView } = useReactFlow();

  // theme
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try { localStorage.setItem(THEME_KEY, theme); } catch { /* ignore */ }
  }, [theme]);

  // autosave
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ projectName, nodes, edges }));
    } catch { /* ignore */ }
  }, [projectName, nodes, edges]);

  const onConnect = useCallback(
    (conn) => {
      if (conn.source === conn.target) return;
      setEdges((eds) => addEdge(makeEdge(conn, relType), eds));
    },
    [relType, setEdges]
  );

  const addClass = (kind) => {
    const r = wrapper.current.getBoundingClientRect();
    const c = screenToFlowPosition({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
    const jitter = (nodes.length % 5) * 30;
    setNodes((ns) => [
      ...ns.map((n) => ({ ...n, selected: false })),
      { ...makeNode(kind, { x: c.x - 170 + jitter, y: c.y - 100 + jitter }), selected: true },
    ]);
  };

  const clearAll = () => {
    if (window.confirm('Clear the whole diagram?')) {
      setNodes([]);
      setEdges([]);
    }
  };

  // selected relationship
  const byId = useMemo(() => Object.fromEntries(nodes.map((n) => [n.id, n])), [nodes]);
  const nameOf = (id) => (byId[id]?.data.name || '').trim() || 'Unnamed';
  const sel = edges.find((e) => e.selected);
  const selectedEdge = sel && {
    id: sel.id,
    relType: sel.data?.relType || 'association',
    from: nameOf(sel.source),
    to: nameOf(sel.target),
  };

  const changeRel = (t) =>
    setEdges((es) => es.map((e) => (e.id === sel.id ? { ...e, ...relProps(t) } : e)));
  const reverseEdge = () =>
    setEdges((es) =>
      es.map((e) =>
        e.id === sel.id
          ? { ...e, source: e.target, target: e.source, sourceHandle: null, targetHandle: null }
          : e
      )
    );
  const deleteEdge = () => setEdges((es) => es.filter((e) => e.id !== sel.id));

  // save / load
  const saveJson = () => {
    const blob = new Blob([JSON.stringify({ projectName, nodes, edges }, null, 2)], { type: 'application/json' });
    const slug = (projectName || 'diagram').trim().replace(/[^A-Za-z0-9_-]+/g, '-').toLowerCase();
    downloadBlob(`${slug || 'diagram'}.json`, blob);
  };

  const loadJson = (file) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const d = JSON.parse(reader.result);
        if (!Array.isArray(d.nodes) || !Array.isArray(d.edges)) throw new Error('bad file');
        setNodes(d.nodes.map((n) => ({ ...n, selected: false })));
        setEdges(d.edges.map((e) => ({ ...e, selected: false })));
        setProjectName(d.projectName || 'Untitled diagram');
        setTimeout(() => fitView({ padding: 0.2 }), 80);
      } catch {
        alert('That file is not a valid diagram JSON.');
      }
    };
    reader.readAsText(file);
  };

  const files = useMemo(
    () => generateAll(nodes, edges, { packageName, accessors, constructors }),
    [nodes, edges, packageName, accessors, constructors]
  );
  const issues = useMemo(() => validate(nodes, edges), [nodes, edges]);

  return (
    <div className="app">
      <header className="topbar">
        <div className="left">
          <button className={`icon-btn-lg ${sidebarOpen ? 'on' : ''}`} title="Toggle sidebar"
            onClick={() => setSidebarOpen((o) => !o)}>
            <Icon name="panel-left" />
          </button>
          <div className="brand">
            <span className="logo">U</span>
            <div>
              <b>UML Studio</b>
              <small>Class diagram → Java</small>
            </div>
          </div>
        </div>

        <input className="project-name" value={projectName}
          onChange={(e) => setProjectName(e.target.value)} aria-label="Project name" />

        <div className="right">
          <span className="stat"><b>{nodes.length}</b> classes</span>
          <span className="stat"><b>{edges.length}</b> relations</span>
          <button className="icon-btn-lg" title="Toggle light / dark mode"
            onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}>
            <Icon name={theme === 'dark' ? 'sun' : 'moon'} />
          </button>
          <button className={`icon-btn-lg ${codeOpen ? 'on' : ''}`} title="Toggle code panel"
            onClick={() => setCodeOpen((o) => !o)}>
            <Icon name="panel-right" />
          </button>
        </div>
      </header>

      <div className="body">
        {sidebarOpen && (
          <Sidebar
            onAdd={addClass}
            relType={relType} setRelType={setRelType}
            selectedEdge={selectedEdge}
            onChangeRel={changeRel} onReverse={reverseEdge} onDeleteEdge={deleteEdge}
            packageName={packageName} setPackageName={setPackageName}
            constructors={constructors} setConstructors={setConstructors}
            accessors={accessors} setAccessors={setAccessors}
            issues={issues}
            onSave={saveJson} onLoad={loadJson} onClear={clearAll}
          />
        )}

        <main className="canvas" ref={wrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            deleteKeyCode={['Backspace', 'Delete']}
            fitView
          >
            <Background variant={BackgroundVariant.Dots} gap={22} size={1.6} color="var(--grid)" />
            <Controls />
            <MiniMap pannable zoomable nodeColor={() => '#3b82f6'} />
          </ReactFlow>
          <div className="hint">
            Drag from a box's <b>bottom dot</b> to another box's <b>top dot</b>. Click an arrow to edit it.
          </div>
        </main>

        {codeOpen && <CodePanel files={files} projectName={projectName} packageName={packageName} />}
      </div>
    </div>
  );
}