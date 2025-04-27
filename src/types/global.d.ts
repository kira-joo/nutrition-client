//src/types/global.d.ts
declare module "*.json" {
  const value: Record<string, any>;
  export default value;
}
