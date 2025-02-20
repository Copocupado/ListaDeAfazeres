// global.d.ts
export {};

declare global {
  type ModelFactory<Model> = (data: any) => Model;
  type DefaultSortingFunction<Model, SortKey extends keyof Model> = (
    items: Model[],
    SortKey,
    operator: ComparisonOperator,
    value: T[K],
  ) => Model[];
  type SortOrder = "asc" | "desc" | "custom";
  type ComparisonOperator = "equals" | "notEquals" | "greaterThan" | "lessThan" | "includes";
}
