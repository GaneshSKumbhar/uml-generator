const JAVA_IMPORTS = {
  List: 'java.util.List',
  ArrayList: 'java.util.ArrayList',
  Map: 'java.util.Map',
  HashMap: 'java.util.HashMap',
  Set: 'java.util.Set',
  HashSet: 'java.util.HashSet',
  Date: 'java.util.Date',
  LocalDate: 'java.time.LocalDate',
  LocalDateTime: 'java.time.LocalDateTime',
  BigDecimal: 'java.math.BigDecimal',
};

const ident = (s, fallback) => (s || '').replace(/[^A-Za-z0-9_$]/g, '') || fallback;
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const lowerFirst = (s) => s.charAt(0).toLowerCase() + s.slice(1);
const mod = (v) => (v === 'package' || !v ? '' : `${v} `);

function defaultValue(type) {
  const t = (type || 'void').trim();
  if (t === 'void') return null;
  if (t === 'boolean') return 'false';
  if (['int', 'short', 'byte'].includes(t)) return '0';
  if (t === 'long') return '0L';
  if (t === 'float') return '0.0f';
  if (t === 'double') return '0.0';
  if (t === 'char') return "'\\0'";
  return 'null';
}

function methodBody(ret) {
  const v = defaultValue(ret);
  return v === null
    ? '{\n        // TODO: implement\n    }'
    : `{\n        // TODO: implement\n        return ${v};\n    }`;
}

// collect abstract members that a concrete class must implement
function inheritedAbstract(node, edges, byId, seen = new Set()) {
  if (seen.has(node.id)) return [];
  seen.add(node.id);
  const result = [];
  edges
    .filter((e) => e.source === node.id && ['inheritance', 'realization'].includes(e.data?.relType))
    .forEach((e) => {
      const t = byId[e.target];
      if (!t) return;
      if (t.data.kind === 'interface') result.push(...t.data.methods);
      if (t.data.kind === 'abstract') result.push(...t.data.methods.filter((m) => m.abstract));
      result.push(...inheritedAbstract(t, edges, byId, seen));
    });
  return result;
}

export function generateAll(nodes, edges, opts = {}) {
  const { packageName = '', accessors = true, constructors = true } = opts;
  const byId = Object.fromEntries(nodes.map((n) => [n.id, n]));
  const nameOf = (n) => ident(n.data.name, 'Unnamed');

  return nodes.map((node) => {
    const d = node.data;
    const name = nameOf(node);
    const kind = d.kind; // class | abstract | interface
    const out = edges.filter((e) => e.source === node.id);
    const targetsOf = (rel) =>
      out.filter((e) => e.data?.relType === rel).map((e) => byId[e.target]).filter(Boolean);

    const parents = targetsOf('inheritance');
    const realized = targetsOf('realization');

    // ---------- header ----------
    let header;
    if (kind === 'interface') {
      const ext = [...parents, ...realized].map(nameOf);
      header = `public interface ${name}${ext.length ? ' extends ' + ext.join(', ') : ''} {`;
    } else {
      const ext = parents.length ? ` extends ${nameOf(parents[0])}` : '';
      const impl = realized.length ? ` implements ${realized.map(nameOf).join(', ')}` : '';
      header = `public ${kind === 'abstract' ? 'abstract ' : ''}class ${name}${ext}${impl} {`;
    }

    // ---------- fields ----------
    const typeText = [];
    const fieldLines = [];
    const attrs = [];
    if (kind !== 'interface') {
      d.attributes.forEach((a) => {
        const an = ident(a.name, '');
        if (!an) return;
        const type = a.type || 'String';
        attrs.push({ vis: a.visibility, type, name: an });
        typeText.push(type);
        fieldLines.push(`    ${mod(a.visibility)}${type} ${an};`);
      });

      out
        .filter((e) => ['association', 'aggregation', 'composition'].includes(e.data?.relType))
        .forEach((e) => {
          const t = byId[e.target];
          if (!t) return;
          const tn = nameOf(t);
          const rel = e.data.relType;
          const isList = rel === 'aggregation';
          const type = isList ? `List<${tn}>` : tn;
          const fname = lowerFirst(tn) + (isList ? 'List' : '');
          if (attrs.some((a) => a.name === fname)) return;
          attrs.push({ vis: 'private', type, name: fname, relation: true });
          typeText.push(type);
          if (isList) typeText.push('ArrayList');
          fieldLines.push(
            `    private ${type} ${fname}${isList ? ' = new ArrayList<>()' : ''}; // ${rel}`
          );
        });
    }

    // ---------- constructors ----------
    const ctorLines = [];
    const ownAttrs = attrs.filter((a) => !a.relation);
    if (kind !== 'interface' && constructors) {
      ctorLines.push(`    public ${name}() {\n    }`);
      if (ownAttrs.length) {
        const params = ownAttrs.map((a) => `${a.type} ${a.name}`).join(', ');
        const assigns = ownAttrs.map((a) => `        this.${a.name} = ${a.name};`).join('\n');
        ctorLines.push(`    public ${name}(${params}) {\n${assigns}\n    }`);
      }
    }

    // ---------- accessors ----------
    const accessorLines = [];
    if (kind !== 'interface' && accessors) {
      attrs
        .filter((a) => a.vis === 'private')
        .forEach((a) => {
          const prefix = a.type === 'boolean' ? 'is' : 'get';
          accessorLines.push(
            `    public ${a.type} ${prefix}${cap(a.name)}() {\n        return this.${a.name};\n    }`
          );
          accessorLines.push(
            `    public void set${cap(a.name)}(${a.type} ${a.name}) {\n        this.${a.name} = ${a.name};\n    }`
          );
        });
    }

    // ---------- methods ----------
    const methodLines = [];
    const declared = new Set();
    d.methods.forEach((m) => {
      const mn = ident(m.name, '');
      if (!mn) return;
      const ret = m.returnType || 'void';
      declared.add(mn);
      typeText.push(ret, m.params || '');
      if (kind === 'interface') {
        methodLines.push(`    ${ret} ${mn}(${m.params || ''});`);
      } else if (kind === 'abstract' && m.abstract) {
        methodLines.push(`    ${mod(m.visibility)}abstract ${ret} ${mn}(${m.params || ''});`);
      } else {
        methodLines.push(`    ${mod(m.visibility)}${ret} ${mn}(${m.params || ''}) ${methodBody(ret)}`);
      }
    });

    // auto-generate stubs for unimplemented interface / abstract methods
    if (kind === 'class') {
      inheritedAbstract(node, edges, byId).forEach((m) => {
        const mn = ident(m.name, '');
        if (!mn || declared.has(mn)) return;
        declared.add(mn);
        const ret = m.returnType || 'void';
        typeText.push(ret, m.params || '');
        methodLines.push(
          `    @Override\n    public ${ret} ${mn}(${m.params || ''}) ${methodBody(ret)}`
        );
      });
    }

    // ---------- imports ----------
    const joined = typeText.join(' ');
    const imports = Object.keys(JAVA_IMPORTS)
      .filter((k) => new RegExp(`\\b${k}\\b`).test(joined))
      .map((k) => `import ${JAVA_IMPORTS[k]};`)
      .sort();

    // ---------- assemble ----------
    const blocks = [];
    if (packageName.trim()) blocks.push(`package ${packageName.trim()};`);
    if (imports.length) blocks.push(imports.join('\n'));

    const bodyParts = [];
    if (fieldLines.length) bodyParts.push(fieldLines.join('\n'));
    if (ctorLines.length) bodyParts.push(ctorLines.join('\n\n'));
    if (accessorLines.length) bodyParts.push(accessorLines.join('\n\n'));
    if (methodLines.length) bodyParts.push(methodLines.join('\n\n'));

    blocks.push(`${header}${bodyParts.length ? '\n' + bodyParts.join('\n\n') + '\n' : ''}}`);

    return { id: node.id, name, filename: `${name}.java`, code: blocks.join('\n\n') + '\n' };
  });
}