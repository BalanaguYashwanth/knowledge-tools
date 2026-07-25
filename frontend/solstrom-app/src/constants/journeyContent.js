export const JOURNEY_STEPS = [
  {
    id: 'analyze',
    number: 1,
    title: 'Analyzing the Data',
    summary: 'Profiled two heterogeneous JSON sources to understand schema variance, field density, and retrieval relevance.',
    details: [
      'Ideas dataset: Airtable-exported records with nested fields, HTML article content, and multi-value categories.',
      'Hackathon winners dataset: Nested hackathon metadata, prize groups, and winner objects with team arrays.',
      'Identified high-signal fields for embedding (titles, problems, solutions, descriptions) vs. noise (IDs, timestamps, image URLs).',
      'Measured record counts and token distributions to plan chunking strategies per collection.',
    ],
    tags: ['Schema profiling', 'Field mapping', 'Token analysis'],
  },
  {
    id: 'clean',
    number: 2,
    title: 'Cleaning the Data',
    summary: 'Stripped HTML, normalized whitespace, and removed empty or duplicate fields before indexing.',
    details: [
      'Parsed and stripped HTML from Article Content fields using a DOM parser, preserving semantic structure.',
      'Removed null-heavy keys and standardized date formats across both datasets.',
      'Deduplicated records by slug/ID and validated required retrieval fields were present.',
      'Handled multi-line text blocks and URL references consistently for downstream embedding quality.',
    ],
    tags: ['HTML stripping', 'Deduplication', 'Null handling'],
  },
  {
    id: 'normalize',
    number: 3,
    title: 'Normalizing the Data',
    summary: 'Transformed each source into a unified document schema optimized for vector search and LLM context.',
    details: [
      'Mapped Ideas records to a flat document: title, problem, solution, category, author, difficulty, resources.',
      'Flattened hackathon winners into searchable documents: project name, description, hackathon, prize tier, tracks, team.',
      'Applied consistent chunking (semantic splits on section boundaries) with metadata tags for filtering.',
      'Generated collection-specific payloads for Qdrant with source identifiers and original record IDs.',
    ],
    tags: ['Schema unification', 'Chunking', 'Metadata tagging'],
  },
  {
    id: 'architect',
    number: 4,
    title: 'Architecting Multi-Collection RAG',
    summary: 'Built a LangChain runnable pipeline with intent routing across two Qdrant vector collections.',
    details: [
      'Query classifier determines intent: ideas-only, hackathon-only, or cross-collection search.',
      'Runnable chains fan out to the appropriate Qdrant collection(s) with parallel retrieval.',
      'Retrieved chunks are merged, deduplicated, and ranked before injection into the LLM prompt.',
      'Pydantic output parsers enforce structured responses with source attribution and confidence signals.',
    ],
    tags: ['LangChain', 'Runnables', 'Qdrant', 'Pydantic'],
  },
];

export const TECH_STACK = [
  { name: 'LangChain', role: 'Orchestration & tool chaining' },
  { name: 'Runnables', role: 'Composable pipeline primitives' },
  { name: 'LLM', role: 'Synthesis & reasoning' },
  { name: 'Qdrant', role: 'Vector storage & similarity search' },
  { name: 'Pydantic', role: 'Structured output parsing' },
];

export const WORKFLOW_NODES = [
  { id: 'query', label: 'User Query', type: 'input' },
  { id: 'classifier', label: 'Intent Classifier', type: 'process' },
  { id: 'ideas', label: 'Ideas Collection', type: 'store' },
  { id: 'hackathon', label: 'Hackathon Collection', type: 'store' },
  { id: 'merge', label: 'Merge & Rank', type: 'process' },
  { id: 'llm', label: 'LLM Synthesis', type: 'process' },
  { id: 'parser', label: 'Pydantic Parser', type: 'output' },
  { id: 'response', label: 'Structured Response', type: 'output' },
];

export const WORKFLOW_ROUTES = [
  { from: 'query', to: 'classifier' },
  { from: 'classifier', to: 'ideas', label: 'ideas intent' },
  { from: 'classifier', to: 'hackathon', label: 'hackathon intent' },
  { from: 'classifier', to: 'ideas', label: 'both intent', dashed: true },
  { from: 'classifier', to: 'hackathon', label: 'both intent', dashed: true },
  { from: 'ideas', to: 'merge' },
  { from: 'hackathon', to: 'merge' },
  { from: 'merge', to: 'llm' },
  { from: 'llm', to: 'parser' },
  { from: 'parser', to: 'response' },
];
