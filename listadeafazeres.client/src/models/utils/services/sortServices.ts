export function sortItems<T>(
  items: T[],
  key: keyof T,
  order: SortOrder = "asc",
  customOrder?: T[keyof T][]
): T[] {
  return [...items].sort((a, b) => {
    const valueA = a[key];
    const valueB = b[key];

    if (order === "asc" || order === "desc") {
      if (valueA < valueB) return order === "asc" ? -1 : 1;
      if (valueA > valueB) return order === "asc" ? 1 : -1;
      return 0;
    } else if (order === "custom" && customOrder) {
      const indexA = customOrder.indexOf(valueA);
      const indexB = customOrder.indexOf(valueB);
      if (indexA === -1 || indexB === -1) {
        console.warn("Um ou mais itens não foram encontrados na ordem personalizada.");
        return 0;
      }
      return indexA - indexB;
    } else {
      console.warn("Ordem de classificação inválida ou array de ordem personalizada ausente.");
      return 0;
    }
  });
}
export interface SortCriteria {
  option: SortOrder | undefined | null;
}
