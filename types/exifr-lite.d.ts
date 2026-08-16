// Type shim for the lite build — the default exifr entry (full.umd) pulls in a
// Node http/https dynamic-import loader that Hermes' release compiler rejects
// ("Invalid expression encountered" on `import(/* webpackIgnore: true */e)`).
declare module "exifr/dist/lite.esm.js" {
  export interface ExifrLiteTags {
    DateTimeOriginal?: Date;
    CreateDate?: Date;
    ModifyDate?: Date;
    [key: string]: unknown;
  }
  const exifr: {
    parse(input: Uint8Array | ArrayBuffer, options?: Record<string, unknown>): Promise<ExifrLiteTags | undefined>;
  };
  export default exifr;
}