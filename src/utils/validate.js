export function validate(nodes, edges) {
  const issues = [];
  const byId = Object.fromEntries(nodes.map((n) => [n.id, n]));
  const nm = (n) => (n.data.name || '').trim() || 'Unnamed';
  const seen = {};

  nodes.forEach((n) => {
    const name = (n.data.name || '').trim();
    if (!name) {
      issues.push({ level: 'warn', text: 'A class has no name yet' });
      return;
    }
    const key = name.toLowerCase();
    if (seen[key]) issues.push({ level: 'error', text: `Duplicate class name "${name}"` });
    seen[key] = true;
    if (!/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(name)) {
      issues.push({ level: 'warn', text: `"${name}" is not a valid Java name` });
    }
  });

  nodes.forEach((n) => {
    if (n.data.kind === 'interface') return;
    const parents = edges.filter((e) => e.source === n.id && e.data?.relType === 'inheritance');
    if (parents.length > 1) {
      issues.push({ level: 'error', text: `${nm(n)} extends more than one class (Java allows only one)` });
    }
  });

  edges.forEach((e) => {
    const s = byId[e.source];
    const t = byId[e.target];
    if (!s || !t) return;
    const rel = e.data?.relType;
    if (rel === 'inheritance' && t.data.kind === 'interface' && s.data.kind !== 'interface') {
      issues.push({ level: 'warn', text: `${nm(s)} → ${nm(t)}: use Realization to implement an interface` });
    }
    if (rel === 'inheritance' && s.data.kind === 'interface' && t.data.kind !== 'interface') {
      issues.push({ level: 'error', text: `Interface ${nm(s)} cannot extend a class` });
    }
    if (rel === 'realization' && t.data.kind !== 'interface') {
      issues.push({ level: 'warn', text: `${nm(s)} realizes ${nm(t)}, which is not an interface` });
    }
  });

  return issues;
}