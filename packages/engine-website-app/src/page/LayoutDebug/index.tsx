import { LayoutDebug } from '@chamn/layout/debug';

const renderUrl = import.meta.env.DEV ? '/src/render.html' : './layout-debug-render.html';

export const LayoutDebugPage = () => <LayoutDebug renderUrl={renderUrl} />;
