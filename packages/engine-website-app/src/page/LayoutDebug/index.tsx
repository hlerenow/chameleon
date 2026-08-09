import { LayoutDebug } from '@chamn/layout/debug';
import '@chamn/layout/dist/debug.css';
import '../../index.css';

const renderUrl = import.meta.env.DEV ? '/src/render.html' : './layout-debug-render.html';

export const LayoutDebugPage = () => <LayoutDebug renderUrl={renderUrl} />;
