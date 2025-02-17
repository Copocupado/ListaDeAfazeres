// global.d.ts
export {};

declare global {
    type ModelFactory<Model> = (data: any) => Model;
}
