function WorkflowDiagram() {
  return (
    <div className="workflow-diagram">
      <div className="workflow-diagram__desktop">
        <svg
          viewBox="0 0 900 420"
          className="workflow-diagram__svg"
          role="img"
          aria-label="RAG query routing workflow diagram"
        >
          <defs>
            <marker
              id="arrowhead"
              markerWidth="8"
              markerHeight="6"
              refX="7"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 8 3, 0 6" fill="var(--color-text-muted)" />
            </marker>
            <marker
              id="arrowhead-accent"
              markerWidth="8"
              markerHeight="6"
              refX="7"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 8 3, 0 6" fill="var(--color-accent)" />
            </marker>
          </defs>

          <WorkflowNode x={30} y={170} label="User Query" type="input" width={120} />
          <WorkflowNode x={200} y={170} label="Intent Classifier" type="process" width={140} />

          <WorkflowNode x={400} y={60} label="Ideas Collection" type="store" sublabel="ideas_rag" width={150} />
          <WorkflowNode x={400} y={280} label="Hackathon Collection" type="store" sublabel="winners_rag" width={170} />

          <WorkflowNode x={610} y={170} label="Merge & Rank" type="process" width={130} />
          <WorkflowNode x={770} y={100} label="LLM Synthesis" type="process" width={120} />
          <WorkflowNode x={770} y={240} label="Pydantic Parser" type="output" width={120} />

          <Arrow x1={150} y1={195} x2={200} y2={195} />
          <Arrow x1={340} y1={195} x2={400} y2={110} label="ideas" labelX={355} labelY={145} accent />
          <Arrow x1={340} y1={195} x2={400} y2={305} label="hackathon" labelX={340} labelY={260} accent />
          <Arrow x1={340} y1={195} x2={400} y2={110} dashed label2="both" label2X={365} label2Y={175} />
          <Arrow x1={340} y1={195} x2={400} y2={305} dashed />

          <Arrow x1={550} y1={110} x2={610} y2={180} />
          <Arrow x1={550} y1={305} x2={610} y2={210} />
          <Arrow x1={740} y1={195} x2={770} y2={125} />
          <Arrow x1={830} y1={160} x2={830} y2={240} />
        </svg>
      </div>

      <div className="workflow-diagram__mobile">
        <ol className="workflow-flow">
          <li className="workflow-flow__step workflow-flow__step--input">
            <span className="workflow-flow__label">User Query</span>
          </li>
          <li className="workflow-flow__connector" aria-hidden="true" />
          <li className="workflow-flow__step workflow-flow__step--process">
            <span className="workflow-flow__label">Intent Classifier</span>
            <div className="workflow-flow__branches">
              <span className="workflow-flow__branch">→ ideas_rag</span>
              <span className="workflow-flow__branch">→ hackathon_winners_rag</span>
              <span className="workflow-flow__branch workflow-flow__branch--both">→ both (parallel)</span>
            </div>
          </li>
          <li className="workflow-flow__connector" aria-hidden="true" />
          <li className="workflow-flow__step workflow-flow__step--store">
            <span className="workflow-flow__label">Qdrant Vector Search</span>
          </li>
          <li className="workflow-flow__connector" aria-hidden="true" />
          <li className="workflow-flow__step workflow-flow__step--process">
            <span className="workflow-flow__label">Merge & Rank Chunks</span>
          </li>
          <li className="workflow-flow__connector" aria-hidden="true" />
          <li className="workflow-flow__step workflow-flow__step--process">
            <span className="workflow-flow__label">LLM Synthesis</span>
          </li>
          <li className="workflow-flow__connector" aria-hidden="true" />
          <li className="workflow-flow__step workflow-flow__step--output">
            <span className="workflow-flow__label">Pydantic Structured Response</span>
          </li>
        </ol>
      </div>
    </div>
  );
}

function WorkflowNode({ x, y, label, sublabel, type, width = 120 }) {
  const height = sublabel ? 56 : 44;
  const colors = {
    input: { fill: 'var(--color-accent-soft)', stroke: 'var(--color-accent)' },
    process: { fill: 'var(--color-surface-raised)', stroke: 'var(--color-border)' },
    store: { fill: 'rgba(52, 211, 153, 0.1)', stroke: 'var(--color-success)' },
    output: { fill: 'rgba(251, 191, 36, 0.1)', stroke: 'var(--color-warning)' },
  };
  const style = colors[type] || colors.process;

  return (
    <g transform={`translate(${x}, ${y})`}>
      <rect
        width={width}
        height={height}
        rx={8}
        fill={style.fill}
        stroke={style.stroke}
        strokeWidth={1.5}
      />
      <text
        x={width / 2}
        y={sublabel ? 22 : 26}
        textAnchor="middle"
        fill="var(--color-text-primary)"
        fontSize={12}
        fontWeight={600}
      >
        {label}
      </text>
      {sublabel && (
        <text
          x={width / 2}
          y={40}
          textAnchor="middle"
          fill="var(--color-text-muted)"
          fontSize={10}
          fontFamily="var(--font-mono)"
        >
          {sublabel}
        </text>
      )}
    </g>
  );
}

function Arrow({ x1, y1, x2, y2, label, labelX, labelY, label2, label2X, label2Y, dashed, accent }) {
  return (
    <g>
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={accent ? 'var(--color-accent)' : 'var(--color-text-muted)'}
        strokeWidth={1.5}
        strokeDasharray={dashed ? '4 3' : undefined}
        markerEnd={`url(#${accent ? 'arrowhead-accent' : 'arrowhead'})`}
        opacity={dashed ? 0.5 : 1}
      />
      {label && (
        <text x={labelX} y={labelY} fill="var(--color-accent)" fontSize={10} fontWeight={500}>
          {label}
        </text>
      )}
      {label2 && (
        <text x={label2X} y={label2Y} fill="var(--color-text-muted)" fontSize={9} fontStyle="italic">
          {label2}
        </text>
      )}
    </g>
  );
}

export default WorkflowDiagram;
