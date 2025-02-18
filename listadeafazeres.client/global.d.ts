// global.d.ts
export {}

declare global {
  type ModelFactory<Model> = (data: any) => Model
  type SortOrder = 'asc' | 'desc' | 'custom'
  type ComparisonOperator = 'equals' | 'notEquals' | 'greaterThan' | 'lessThan' | 'includes'
}
