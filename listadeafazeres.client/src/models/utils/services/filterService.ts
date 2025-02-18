export function filterItems<T, K extends keyof T>(
    items: T[],
    key: K,
    operator: ComparisonOperator,
    value: T[K]
): T[] {
    return items.filter(item => {
        const itemValue = item[key];

        switch (operator) {
            case 'equals':
                return itemValue === value;
            case 'notEquals':
                return itemValue !== value;
            case 'greaterThan':
                if (itemValue instanceof Date && value instanceof Date) {
                    const itemTime = itemValue.getTime();
                    const compareTime = value.getTime();

                    return itemTime > compareTime
                }
                return typeof itemValue === 'number' && itemValue > (value as unknown as number);
            case 'lessThan':
                if (itemValue instanceof Date && value instanceof Date) {
                    const itemTime = itemValue.getTime();
                    const compareTime = value.getTime();

                    return itemTime < compareTime
                }
                return typeof itemValue === 'number' && itemValue < (value as unknown as number);
            case 'includes':
                return typeof itemValue === 'string' && (itemValue as string).includes(value as string);
            default:
                console.warn('Operador de comparação inválido.');
                return false;
        }
    });
}

export interface FilterCriteria {
    dateRange: Date[] | null;
    title: string | null;
    completionStatus: string | null;
}

