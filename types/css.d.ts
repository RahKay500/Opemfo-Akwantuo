// Next's own ambient types (next/types/global.d.ts) only declare *.module.css
// (CSS Modules). Plain side-effect imports like `import "./globals.css"` have
// no ambient declaration anywhere, which some editors' TS servers flag even
// though `tsc` itself tolerates it under moduleResolution: "bundler".
declare module "*.css";
