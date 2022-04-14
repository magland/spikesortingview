import { RowSelection, RowSelectionAction, RowSelectionState, TOGGLE_RANGE, TOGGLE_ROW, UNIQUE_SELECT } from "./RowSelectionContext"


export const selectUnique = (s: RowSelection, a: RowSelectionAction): RowSelection => {
    const { targetRow } = a
    if (targetRow === undefined) {
        throw Error(`UNIQUE_SELECT for row selection requires a target row to be set.`)
    }
    if (!s.orderedRowIds.includes(targetRow)) {
        throw Error(`Requested row ID ${targetRow} is not present in the ordered row set.`)
    }
    return {
        ...s,
        lastClickedId: targetRow,
        selectedRowIds: new Set(s.selectedRowIds.has(targetRow) ? [] : [targetRow])
    }
}

export const setSelectionExplicit = (s: RowSelection, a: RowSelectionAction): RowSelection => {
    if ((a.incomingSelectedRowIds || []).some(rowId => !s.orderedRowIds.includes(rowId))) {
        throw Error(`Attempt to set a selection including rows that are not in known data.`)
    }
    return {
        ...s,
        selectedRowIds: new Set((a.incomingSelectedRowIds ?? []))
    }
}

export const allRowSelectionState = (s: {selectedRowIds: Set<number>, orderedRowIds: number[], visibleRowIds?: number[]}): RowSelectionState => {
    if (s.selectedRowIds.size === 0) return 'none'
    if (s.selectedRowIds.size === s.orderedRowIds.length) return 'all'
    if (!s.visibleRowIds || s.visibleRowIds.length === 0 || s.selectedRowIds.size !== s.visibleRowIds.length) return 'partial'
    // Some rows are visible and some are set. So status is 'partial' if those are different sets and 'all' if they're the same set.
    if (s.visibleRowIds.some(visibleId => !s.selectedRowIds.has(visibleId))) return 'partial'
    return 'all'
}

export const toggleSelectedRow = (s: RowSelection, a: RowSelectionAction): RowSelection => {
    if (!a.targetRow) throw new Error(`Attempt to toggle row with unset rowid.`)
    s.selectedRowIds.has(a.targetRow) ? s.selectedRowIds.delete(a.targetRow) : s.selectedRowIds.add(a.targetRow)
    return {
        ...s,
        selectedRowIds: new Set<number>(s.selectedRowIds), // shallow copy, to trigger rerender
        lastClickedId: a.targetRow
    }
}

export const toggleSelectedRange = (s: RowSelection, a: RowSelectionAction): RowSelection => {
    const { selectedRowIds, lastClickedId, orderedRowIds } = s
    const { targetRow } = a
    if (orderedRowIds.length === 0) throw Error(`Attempt to toggle range with no rows initialized.`)
    if (!lastClickedId || !targetRow) throw Error(`Cannot toggle range with undefined limit: last-clicked ${lastClickedId}, target ${targetRow}`)
    const lastClickedIndex = orderedRowIds.findIndex(id => id === lastClickedId)
    const targetIndex = orderedRowIds.findIndex(id => id === targetRow)
    if (lastClickedIndex === -1 || targetIndex === -1) {
        throw Error(`Requested to toggle row range from ID ${lastClickedId} to ID ${targetRow} but one of these was not found.`)
    }
    const toggledIds = orderedRowIds.slice(Math.min(lastClickedIndex, targetIndex), Math.max(lastClickedIndex, targetIndex) + 1)
    selectedRowIds.has(targetRow)
        ? toggledIds.forEach(id => selectedRowIds.delete(id))
        : toggledIds.forEach(id => selectedRowIds.add(id))

    return {
        ...s,
        lastClickedId: targetRow, // TODO: Check with client: should a range toggle update the last-selected-row?
        selectedRowIds: new Set<number>(selectedRowIds) // shallow copy to trigger rerender
    }
}

export const toggleSelectAll = (s: RowSelection): RowSelection => {
    const selectionStatus = allRowSelectionState(s)
    const newSelection = selectionStatus === 'all'
                            ? new Set<number>()
                            : s.visibleRowIds && s.visibleRowIds.length > 0
                                ? new Set<number>(s.visibleRowIds)
                                : new Set<number>(s.orderedRowIds)
    return {
        ...s,
        selectedRowIds: newSelection
    }
}

export const getCheckboxClickHandlerGenerator = (reducer: React.Dispatch<RowSelectionAction>) => {
    return (rowId: number) => (evt: React.MouseEvent) => { checkboxClick(rowId, reducer, evt) }
}

export const getPlotClickHandlerGenerator = (reducer: React.Dispatch<RowSelectionAction>) => {
    return (rowId: number) => (evt: React.MouseEvent) => { plotElementClick(rowId, reducer, evt) }
}

export const checkboxClick = (rowId: number, reducer: React.Dispatch<RowSelectionAction>, evt: React.MouseEvent) => {
    const action = {
        type: evt.shiftKey ? TOGGLE_RANGE : TOGGLE_ROW,
        targetRow: rowId,
    }
    reducer(action)
}

export const plotElementClick = (rowId: number, reducer: React.Dispatch<RowSelectionAction>, evt: React.MouseEvent) => {
    const action = {
        type: evt.shiftKey ? TOGGLE_RANGE :
            evt.ctrlKey ? TOGGLE_ROW : UNIQUE_SELECT,
        targetRow: rowId
    }
    reducer(action)
}

export const voidClickHandler = (evt: React.MouseEvent) => {}