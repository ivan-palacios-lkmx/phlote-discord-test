declare module "potrace" {
  interface PotraceOptions {
    threshold?: number;
    color?: string;
  }

  function trace(
    filePath: string,
    options: PotraceOptions,
    callback: (err: Error | null, svg: string) => void,
  ): void;

  export = { trace };
}
