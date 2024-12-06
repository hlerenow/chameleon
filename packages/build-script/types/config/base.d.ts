import { type LibraryOptions, type UserConfig } from 'vite';
export declare const CLI_ARGS_OBJ: {
    dev: boolean;
    build: boolean;
    watch: boolean;
    analyze: boolean;
    generateDTS: boolean;
    sourcemap: boolean;
};
export declare const PROJECT_ROOT: string;
export type BuildScriptConfig = {
    libMode?: boolean;
    entry: string;
    libName?: string;
    fileName?: string;
    external?: string[];
    global?: Record<string, string>;
    formats?: LibraryOptions['formats'];
    vite?: UserConfig;
};
export declare let CUSTOM_CONFIG: BuildScriptConfig;
export declare const isBuild: boolean;
export declare const getCustomConfig: () => Promise<BuildScriptConfig>;
