import React, { ReactNode, useMemo, useState } from 'react';

type DemoCaseProps = {
  children: ReactNode;
  schema: unknown;
  schemaTitle?: string;
};

export function DemoCase({
  children,
  schema,
  schemaTitle = '原始 Schema',
}: DemoCaseProps) {
  const [isSchemaExpanded, setIsSchemaExpanded] = useState(true);
  const formattedSchema = useMemo(
    () => JSON.stringify(schema, null, 2),
    [schema]
  );

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 16,
        minHeight: '100%',
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>{children}</div>
      <aside
        style={{
          width: isSchemaExpanded ? 380 : 'auto',
          flexShrink: 0,
          border: '1px solid #e8e8e8',
          borderRadius: 8,
          background: '#fff',
        }}
      >
        <button
          type="button"
          aria-expanded={isSchemaExpanded}
          onClick={() => setIsSchemaExpanded((expanded) => !expanded)}
          style={{
            width: '100%',
            padding: '10px 12px',
            border: 0,
            borderRadius: 8,
            color: '#1f1f1f',
            background: 'transparent',
            textAlign: 'left',
          }}
        >
          {isSchemaExpanded ? '收起' : '展开'} {schemaTitle}
        </button>
        {isSchemaExpanded && (
          <pre
            style={{
              maxHeight: 'calc(100vh - 120px)',
              margin: 0,
              padding: '0 12px 12px',
              overflow: 'auto',
              color: '#333',
              fontSize: 12,
              lineHeight: 1.5,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            {formattedSchema}
          </pre>
        )}
      </aside>
    </div>
  );
}
