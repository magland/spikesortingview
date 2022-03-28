import React, { useContext } from "react"

export type RowSelection = {
    selectedRowIds: Set<number>,
    orderedRowIds: number[]
    lastClickedId?: number
    page?: number
    rowsPerPage?: number
    visibleRowIds?: number[]
}

export const defaultRowSelection = {
    selectedRowIds: new Set<number>(),
    orderedRowIds: [],
}

export type RowSelectionState = 'all' | 'none' | 'partial'

export type RowSelectionActionType = 'SET_SELECTION' | 'UNIQUE_SELECT' | 'TOGGLE_ROW' | 'TOGGLE_RANGE' | 'TOGGLE_SELECT_ALL' | 'DESELECT_ALL' | 
                                     'INITIALIZE_ROWS' | 'SET_ROW_ORDER' | 
                                     'SET_VISIBLE_ROWS' | // 'SET_WINDOW_SIZE' | 'SET_PAGE_NUMBER' |
                                     'COPY_STATE'

export const SET_SELECTION: RowSelectionActionType = 'SET_SELECTION'
export const UNIQUE_SELECT: RowSelectionActionType = 'UNIQUE_SELECT'
export const TOGGLE_ROW: RowSelectionActionType = 'TOGGLE_ROW'
export const TOGGLE_RANGE: RowSelectionActionType = 'TOGGLE_RANGE'
export const TOGGLE_SELECT_ALL: RowSelectionActionType = 'TOGGLE_SELECT_ALL'
export const DESELECT_ALL: RowSelectionActionType = 'DESELECT_ALL'
export const INITIALIZE_ROWS: RowSelectionActionType = 'INITIALIZE_ROWS'
export const SET_ROW_ORDER: RowSelectionActionType = 'SET_ROW_ORDER'
export const SET_VISIBLE_ROWS: RowSelectionActionType = 'SET_VISIBLE_ROWS'

// Not sure if this is the best approach...?
export const COPY_STATE: RowSelectionActionType = 'COPY_STATE'

export type RowSelectionAction = {
    type: RowSelectionActionType
    incomingSelectedRowIds?: number[]
    targetRow?: number
    newRowOrder?: number[]
    newVisibleRowIds?: number[]
    pageNumber?: number
    rowsPerPage?: number
}

const DEFAULT_ROWS_PER_PAGE = 20

// NOTE: If we ever want to re-implement paint-bucket functionality, see
// https://github.com/magland/sortingview/blob/c71bdc5c095174cbda25866a6748223a715a3792/src/python/sortingview/gui/extensions/unitstable/Units/TableWidget.tsx#L200

export const rowSelectionReducer = (s: RowSelection, a: RowSelectionAction): RowSelection => {
    const { type, targetRow } = a
    switch (type) { 
        case SET_SELECTION:
            // TODO: Check that the incoming selection contains only row ids we recognize from the sorted row list?
            return {
                ...s,
                selectedRowIds: new Set((a.incomingSelectedRowIds ?? []))
            }
        case UNIQUE_SELECT:
            if (targetRow === undefined) {
                throw Error(`UNIQUE_SELECT for row selection requires a target row to be set.`)
            }
            // TODO: Check that the target row even exists?
            return {
                ...s,
                lastClickedId: targetRow,
                selectedRowIds: new Set([targetRow])
            }
        case TOGGLE_ROW:
            return toggleSelectedRow(s, a)
        case TOGGLE_RANGE:
            // range selection should default to row toggle if last-clicked was cleared (e.g. by resorting)
            return s.lastClickedId ? toggleSelectedRange(s, a) : toggleSelectedRow(s, a)
        case TOGGLE_SELECT_ALL:
            return toggleSelectAll(s)
        case DESELECT_ALL:
            return { ...s, selectedRowIds: new Set<number>() }
        case INITIALIZE_ROWS:
            if (s.orderedRowIds.length > 0) return s
            if (a.newRowOrder && a.newRowOrder.length > 1) {
                return {
                    selectedRowIds: new Set<number>(),
                    orderedRowIds: a.newRowOrder
                }
            }
            throw Error('Attempt to initialize table ordering with no actual rows passed.')
        case SET_ROW_ORDER:
            return resetRowOrder(s, a)
        case SET_VISIBLE_ROWS:
            return setVisibleRows(s, a)
        // case SET_WINDOW_SIZE:
        //     break;
        // case SET_PAGE_NUMBER:
        //     break;
        case COPY_STATE:
            return {
                selectedRowIds: new Set((a.incomingSelectedRowIds ?? [])),
                orderedRowIds: a.newRowOrder ?? [],
                lastClickedId: targetRow,
                page: a.pageNumber,
                rowsPerPage: a.rowsPerPage,
                visibleRowIds: a.newVisibleRowIds
            }
        default: {
            throw Error(`Invalid mode for row selection reducer: ${type}`)
        }
    }
}

type clickCurriedDispatch = (rowId: number, evt: React.MouseEvent) => void
export type clickHandlerWithCurriedRow = (evt: React.MouseEvent) => void

export const checkboxDispatchCurry = (reducer: React.Dispatch<RowSelectionAction>): clickCurriedDispatch => {
    return (rowId: number, evt: React.MouseEvent) => { checkboxClick(rowId, reducer, evt) }
}

export const curriedRowClickHandler = (rowId: number, reducer: clickCurriedDispatch): clickHandlerWithCurriedRow => {
    return (evt: React.MouseEvent) => { reducer(rowId, evt) }
}

export const checkboxClick = (rowId: number, reducer: React.Dispatch<RowSelectionAction>, evt: React.MouseEvent) => {
    const action = {
        type: evt.shiftKey ? TOGGLE_RANGE : TOGGLE_ROW,
        targetRow: rowId,
    }
    reducer(action)
}

export const plotDispatchCurry = (reducer: React.Dispatch<RowSelectionAction>): clickCurriedDispatch => {
    return (rowId: number, evt: React.MouseEvent) => { plotElementClick(rowId, reducer, evt) }
}

export const plotElementClick = (rowId: number, reducer: React.Dispatch<RowSelectionAction>, evt: React.MouseEvent) => {
    const action = {
        type: evt.shiftKey ? TOGGLE_RANGE :
            evt.ctrlKey ? TOGGLE_ROW : UNIQUE_SELECT,
        targetRow: rowId
    }
    reducer(action)
}

export const allRowSelectionState = (s: {selectedRowIds: Set<number>, orderedRowIds: number[], visibleRowIds?: number[]}): RowSelectionState => {
    if (s.selectedRowIds.size === 0) return 'none'
    if (s.selectedRowIds.size === s.orderedRowIds.length) return 'all'
    if (!s.visibleRowIds || s.visibleRowIds.length === 0 || s.selectedRowIds.size !== s.visibleRowIds.length) return 'partial'
    // Some rows are visible and some are set. So status is 'partial' if those are different sets and 'all' if they're the same set.
    if (s.visibleRowIds.some(visibleId => !s.selectedRowIds.has(visibleId))) return 'partial'
    return 'all'
}

const toggleSelectedRow = (s: RowSelection, a: RowSelectionAction): RowSelection => {
    if (!a.targetRow) throw new Error(`Attempt to toggle row with unset rowid.`)
    s.selectedRowIds.has(a.targetRow) ? s.selectedRowIds.delete(a.targetRow) : s.selectedRowIds.add(a.targetRow)
    return {
        ...s,
        selectedRowIds: new Set<number>(s.selectedRowIds), // shallow copy, to trigger rerender
        lastClickedId: a.targetRow
    }
}

const toggleSelectedRange = (s: RowSelection, a: RowSelectionAction): RowSelection => {
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

const toggleSelectAll = (s: RowSelection): RowSelection => {
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

const resetRowOrder = (s: RowSelection, a: RowSelectionAction): RowSelection => {
    const { newRowOrder } = a
    const { orderedRowIds } = s
    // TODO: Ensure consistency of sets between new row order and old one?
    if (!newRowOrder || newRowOrder.length === 0) throw Error('Attempt to reset row ordering to empty set.')
    const oldRows = new Set<number>(orderedRowIds)
    if (oldRows.size > 0 && (newRowOrder.length !== oldRows.size || newRowOrder.some(id => !oldRows.has(id)))) {
        throw Error("Reordering rows, but the set of rows in the new and old ordering don't match.")
    }
    // If nothing actually changed, return identity. Prevents infinite loops.
    if (orderedRowIds.every((r, ii) => r === newRowOrder[ii])) return s
    // If pagination is active, changing the ordering should change the set of row indices that's visible.
    const windowStart = (s.rowsPerPage || DEFAULT_ROWS_PER_PAGE) * ((s.page || 1) - 1)
    const visibleRowIndices = (s.visibleRowIds && s.visibleRowIds.length > 0)
        ? newRowOrder.slice(windowStart, windowStart + (s.rowsPerPage || DEFAULT_ROWS_PER_PAGE))
        : undefined
    return {
        ...s,
        orderedRowIds: newRowOrder,
        lastClickedId: undefined,
        visibleRowIds: visibleRowIndices
    }
}

const setVisibleRows = (s: RowSelection, a: RowSelectionAction): RowSelection => {
    // If visible rows are manually specified, just assume caller knows what they're doing.
    if (a.newVisibleRowIds && a.newVisibleRowIds.length > 0) return { ...s, visibleRowIds: a.newVisibleRowIds }

    const newWindowSize = a.rowsPerPage || s.rowsPerPage || DEFAULT_ROWS_PER_PAGE
    const newPage = a.pageNumber || s.page || 1
    
    // Degenerate case: caller didn't ask us to do anything, so return identity.
    if (newWindowSize === s.rowsPerPage && newPage === s.page) return s

    // if the new page explicitly differs from the old, use that regardless; otherwise use the page under
    // the new window size that will contain the first row under the old window size.
    const realizedStartingPage = newPage !== s.page
        ? newPage
        : 1 + Math.floor(((s.rowsPerPage || DEFAULT_ROWS_PER_PAGE) * (newPage - 1)) / newWindowSize)
    const windowStart = newWindowSize * (realizedStartingPage - 1)

    return {
        ...s,
        page: realizedStartingPage,
        rowsPerPage: newWindowSize,
        visibleRowIds: s.orderedRowIds.slice(windowStart, windowStart + newWindowSize)
    }
}

const RowSelectionContext = React.createContext<{
    rowSelection: RowSelection,
    rowSelectionDispatch: (action: RowSelectionAction) => void
}>({
    rowSelection: defaultRowSelection,
    rowSelectionDispatch: (action: RowSelectionAction) => {}
    // this empty sortingSelectionDispatch function gets replaced by the
    // xxContext.Provider element in App.tsx.
})

export const useRowSelection = () => {
    const c = useContext(RowSelectionContext)
    return c
}

// TODO: Should we split this into two more focused functions?
export const useSelectedUnitIds = () => {
    const { rowSelection, rowSelectionDispatch } = useRowSelection()
    return {
        selectedUnitIds: rowSelection.selectedRowIds,
        orderedRowIds: rowSelection.orderedRowIds,
        visibleRowIds: rowSelection.visibleRowIds,
        page: rowSelection.page,
        rowsPerPage: rowSelection.rowsPerPage,
        unitIdSelectionDispatch: rowSelectionDispatch
    }
}

export default RowSelectionContext