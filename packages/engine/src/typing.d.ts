declare module '*.scss' {
  const content: { [key: string]: any };
  export = content;
}

declare module '*.worker?worker' {
  const content: any;
  export = content;
}
