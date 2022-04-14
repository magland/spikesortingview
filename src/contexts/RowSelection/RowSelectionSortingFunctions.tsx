import { RowSelection, RowSelectionAction } from "./RowSelectionContext"
import { SortingRule } from "./RowSelectionTypes"
import { getVisibleRowsOnSortUpdate } from "./RowSelectionVisibilityFunctions"


export const resetRowOrder = (s: RowSelection, a: RowSelectionAction): RowSelection => {
    const { newRowOrder } = a
    const { orderedRowIds } = s
    if (!newRowOrder || newRowOrder.length === 0) throw Error('Attempt to reset row ordering to empty set.')
    const oldRows = new Set<number>(orderedRowIds)
    if (oldRows.size > 0 && (newRowOrder.length !== oldRows.size || newRowOrder.some(id => !oldRows.has(id)))) {
        throw Error("Reordering rows, but the set of rows in the new and old ordering don't match.")
    }
    // If nothing actually changed, return identity. Prevents infinite loops.
    if (orderedRowIds.every((r, ii) => r === newRowOrder[ii])) return s
    // If pagination is active, changing the ordering should change the set of row indices that's visible.
    const visibleRowIds = getVisibleRowsOnSortUpdate(s, newRowOrder)
    return {
        ...s,
        orderedRowIds: newRowOrder,
        lastClickedId: undefined,
        visibleRowIds: visibleRowIds,
        sortRules: [] // clear these out, since we have no guarantee they determined the current sort order
    }
}

// This one tracks the sort field order and uses a callback to get the resulting sorted row ordering.
export const updateSort = (s: RowSelection, a: RowSelectionAction): RowSelection => {
    const { sortRules } = s
    const { newSortField, sortCallback } = a
    if (newSortField === undefined || sortCallback === undefined) throw Error('Attempt to update sort fields with undefined field or callback.')
    const newSortRules = addFieldToSortRules((sortRules || []), newSortField)
    const newOrder = sortCallback(newSortRules)
    const newVisibleRows = getVisibleRowsOnSortUpdate(s, newOrder)
    return {
        ...s,
        sortRules: newSortRules,
        orderedRowIds: newOrder,
        visibleRowIds: newVisibleRows,
        lastClickedId: undefined
    }
}

export const addFieldToSortRules = (rules: SortingRule[], newField: string): SortingRule[] => {
    const lastItem = rules.pop()
    
    const newItemAscending = lastItem?.columnName === newField
        ? !lastItem.sortAscending
        : true
    if (lastItem && lastItem.columnName !== newField){
        rules.push(lastItem)
    }
    const newRules = rules.filter(r => r.columnName !== newField)
    return [...newRules, {columnName: newField, sortAscending: newItemAscending}]
}
