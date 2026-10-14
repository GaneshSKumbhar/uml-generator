import { useState } from 'react';
import JSZip from 'jszip';
import Icon from './Icons';
import { downloadBlob } from '../utils/download';

const RE = /(\/\/.*$)|("(?:[^"\\]|\\.)*")|(@\w+)|\b(public|private|protected|abstract|class|interface|extends|implements|return|new|void|this|import|package|static|final|null|true|false)\b|\b(int|long|double|float|boolean|char|byte|short|String|List|ArrayList|Map|HashMap|Set|HashSet|Date|LocalDate|LocalDateTime|BigDecimal|Object)\b|\b([A-Z][A-Za-z0-9_]*)\b|\b(\d+(?:\.\d+)?[LlFf]?)\b/g;

function highlight(line) {
  const out = [];
  let last = 0;
  let m;
  let i = 0;
  RE.lastIndex = 0;
  while ((m = RE.exec(line)) !== null) {
    if (m.index > last) out.push(line.slice(last, m.index));
    const cls = m[1] ? 'tk-com' : m[2] ? 'tk-str' : m[3] ? 'tk-ann' : m[4] ? 'tk-kw' : m[5] ? 'tk-type' : m[6] ? 'tk-cls' : 'tk-num';
    out.push(<span key={i++} className={cls}>{m[0]}</span>);
    last = m.index + m[0].length;
  }
  if (last < line.length) out.push(line.slice(last));
  return out;
}

export default function CodePanel({ files, projectName, packageName }) {
  const [active, setActive] = useState(0);
  const [copied, setCopied] = useState(false);

  const cur = files.length ? files[Math.min(active, files.length - 1)] : null;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(cur.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1300);
    } catch { /* ignore */ }
  };

  const downloadOne = () => downloadBlob(cur.filename, new Blob([cur.code], { type: 'text/plain' }));

  const downloadZip = async () => {
    const zip = new JSZip();
    const dir = packageName.trim().replace(/\./g, '/');
    files.forEach((f) => zip.file(dir ? `${dir}/${f.filename}` : f.filename, f.code));
    const slug = (projectName || 'uml').trim().replace(/[^A-Za-z0-9_-]+/g, '-').toLowerCase() || 'uml';
    downloadBlob(`${slug}-java.zip`, await zip.generateAsync({ type: 'blob' }));
  };

  const lines = cur ? cur.code.replace(/\n$/, '').split('\n') : [];

  return (
    <aside className="code-panel">
      <div className="panel-head">
        <span className="panel-title"><Icon name="code" /> Java output</span>
        <span className="pill">{files.length} {files.length === 1 ? 'file' : 'files'}</span>
      </div>

      {!cur ? (
        <p className="empty">Add a class to see the generated Java code.</p>
      ) : (
        <>
          <div className="tabs">
            {files.map((f, i) => (
              <button key={f.id} className={f === cur ? 'tab active' : 'tab'} onClick={() => setActive(i)}>
                {f.filename}
              </button>
            ))}
          </div>

          <div className="code-bar">
            <span className="muted">{lines.length} lines</span>
            <div className="btn-row">
              <button className="btn" onClick={copy}>
                <Icon name={copied ? 'check' : 'copy'} /> {copied ? 'Copied' : 'Copy'}
              </button>
              <button className="btn" onClick={downloadOne}><Icon name="download" /> .java</button>
              <button className="btn primary" onClick={downloadZip}><Icon name="download" /> ZIP</button>
            </div>
          </div>

          <div className="code-scroll">
            <pre>
              {lines.map((l, i) => (
                <div className="line" key={i}>
                  <span className="ln">{i + 1}</span>
                  <span className="lc">{l ? highlight(l) : '\u00a0'}</span>
                </div>
              ))}
            </pre>
          </div>
        </>
      )}
    </aside>
  );
}