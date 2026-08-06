import Editor from '@monaco-editor/react';
import React, {
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

type DemoCaseProps<T extends object> = {
  children: ReactNode;
  schema: T;
  schemaTitle?: string;
  onSchemaChange?: (schema: T) => void;
  updateDelay?: number;
};

const formatSchema = (schema: object) => JSON.stringify(schema, null, 2);
const ORIGINAL_SCHEMA_WIDTH = 480;
const RESERVED_SCHEMA_SPACE = 500;

export function DemoCase<T extends object>({
  children,
  schema,
  schemaTitle = '原始 Schema',
  onSchemaChange,
  updateDelay = 300,
}: DemoCaseProps<T>) {
  const [isSchemaExpanded, setIsSchemaExpanded] = useState(true);
  const [isSchemaFullscreen, setIsSchemaFullscreen] = useState(false);
  const [schemaText, setSchemaText] = useState(() => formatSchema(schema));
  const [schemaError, setSchemaError] = useState<string>();
  const updateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingSchemaRef = useRef<T | null>(null);
  const publishedSchemaRef = useRef<T | null>(null);
  const lastUpdateTimeRef = useRef(0);

  useEffect(() => {
    if (schema === publishedSchemaRef.current) {
      publishedSchemaRef.current = null;
      return;
    }

    setSchemaText(formatSchema(schema));
    setSchemaError(undefined);
  }, [schema]);

  useEffect(() => {
    return () => {
      if (updateTimerRef.current) {
        clearTimeout(updateTimerRef.current);
      }
      pendingSchemaRef.current = null;
    };
  }, []);

  const publishSchema = useCallback(
    (nextSchema: T) => {
      pendingSchemaRef.current = nextSchema;

      const updateRender = () => {
        const latestSchema = pendingSchemaRef.current;
        pendingSchemaRef.current = null;
        updateTimerRef.current = null;
        lastUpdateTimeRef.current = Date.now();

        if (latestSchema) {
          publishedSchemaRef.current = latestSchema;
          onSchemaChange?.(latestSchema);
        }
      };

      const elapsed = Date.now() - lastUpdateTimeRef.current;
      if (elapsed >= updateDelay) {
        updateRender();
      } else if (!updateTimerRef.current) {
        updateTimerRef.current = setTimeout(
          updateRender,
          updateDelay - elapsed
        );
      }
    },
    [onSchemaChange, updateDelay]
  );

  const handleSchemaTextChange = useCallback(
    (nextValue: string | undefined) => {
      const nextSchemaText = nextValue || '';
      setSchemaText(nextSchemaText);

      try {
        const nextSchema = JSON.parse(nextSchemaText);
        if (
          !nextSchema ||
          Array.isArray(nextSchema) ||
          typeof nextSchema !== 'object'
        ) {
          throw new Error('根节点必须是 JSON 对象');
        }

        setSchemaError(undefined);
        publishSchema(nextSchema as T);
      } catch (error) {
        setSchemaError(
          error instanceof Error ? error.message : 'JSON 格式错误'
        );
      }
    },
    [publishSchema]
  );

  return (
    <div
      style={{
        position: 'relative',
        minHeight: '100%',
      }}
    >
      <div
        style={{
          boxSizing: 'border-box',
          paddingRight:
            isSchemaExpanded && !isSchemaFullscreen
              ? RESERVED_SCHEMA_SPACE
              : 40,
        }}
      >
        {children}
      </div>
      <aside
        style={{
          position: isSchemaFullscreen ? 'fixed' : 'absolute',
          top: isSchemaFullscreen ? 12 : 0,
          right: isSchemaFullscreen ? 12 : 0,
          bottom: isSchemaFullscreen ? 12 : undefined,
          left: isSchemaFullscreen ? 12 : undefined,
          zIndex: isSchemaFullscreen ? 10 : 1,
          width: isSchemaFullscreen
            ? 'auto'
            : isSchemaExpanded
            ? ORIGINAL_SCHEMA_WIDTH
            : 40,
          border: '1px solid #e8e8e8',
          borderRadius: 8,
          background: '#fff',
          overflow: 'hidden',
          transition: 'width 200ms ease',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: 44,
            padding: isSchemaExpanded ? '0 8px 0 12px' : 0,
            borderBottom: isSchemaExpanded ? '1px solid #f0f0f0' : 0,
          }}
        >
          {isSchemaExpanded && (
            <strong style={{ whiteSpace: 'nowrap' }}>{schemaTitle}</strong>
          )}
          <div style={{ display: 'flex', gap: 4 }}>
            {isSchemaExpanded && (
              <button
                type="button"
                aria-label={
                  isSchemaFullscreen ? '切换为原始宽度' : '切换为全屏'
                }
                title={isSchemaFullscreen ? '切换为原始宽度' : '切换为全屏'}
                onClick={() =>
                  setIsSchemaFullscreen((fullscreen) => !fullscreen)
                }
                style={{
                  width: 32,
                  height: 32,
                  flexShrink: 0,
                  padding: 0,
                  border: 0,
                  borderRadius: 4,
                  color: '#1f1f1f',
                  background: 'transparent',
                  fontSize: 18,
                  lineHeight: 1,
                }}
              >
                <span aria-hidden="true">{isSchemaFullscreen ? '↙' : '⛶'}</span>
              </button>
            )}
            <button
              type="button"
              aria-label={
                isSchemaExpanded ? `收起 ${schemaTitle}` : `展开 ${schemaTitle}`
              }
              title={
                isSchemaExpanded ? `收起 ${schemaTitle}` : `展开 ${schemaTitle}`
              }
              onClick={() => setIsSchemaExpanded((expanded) => !expanded)}
              style={{
                width: 32,
                height: 32,
                flexShrink: 0,
                padding: 0,
                border: 0,
                borderRadius: 4,
                color: '#1f1f1f',
                background: 'transparent',
                fontSize: 20,
                lineHeight: 1,
              }}
            >
              <span aria-hidden="true">{isSchemaExpanded ? '›' : '‹'}</span>
            </button>
          </div>
        </div>
        {isSchemaExpanded && (
          <>
            {schemaError && (
              <div
                style={{ padding: '8px 12px', color: '#cf1322', fontSize: 12 }}
              >
                {schemaError}
              </div>
            )}
            <Editor
              height={
                isSchemaFullscreen
                  ? 'calc(100vh - 70px)'
                  : 'calc(100vh - 170px)'
              }
              language="json"
              value={schemaText}
              onChange={handleSchemaTextChange}
              options={{
                automaticLayout: true,
                formatOnPaste: true,
                formatOnType: true,
                minimap: { enabled: false },
                tabSize: 2,
                wordWrap: 'on',
              }}
            />
          </>
        )}
      </aside>
    </div>
  );
}
