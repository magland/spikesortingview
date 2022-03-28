import React, { useContext } from "react"

export type RowSelection = {
    selectedRowIds: Set<number>,
    orderedRowIds: number[]
    lastClickedId?: number
    page?: number
    rowsPerPage?: number
    visibleRowIndices?: number[]
}

export const defaultRowSelection = {
    selectedRowIds: new Set<number>(),
    orderedRowIds: [],
}

// type Modifier = null | 'shift' | 'ctrl'


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

// Not sure this is actually needed...
export const COPY_STATE: RowSelectionActionType = 'COPY_STATE'

export type RowSelectionAction = {
    type: RowSelectionActionType
    incomingSelectedRowIds?: number[]
    targetRow?: number
    newRowOrder?: number[]
    newVisibleRows?: number[]
    pageNumber?: number
    rowsPerPage?: number
}

const DEFAULT_ROWS_PER_PAGE = 20

// NOTE: If we ever want to re-implement paint-bucket functionality, see
// https://github.com/magland/sortingview/blob/c71bdc5c095174cbda25866a6748223a715a3792/src/python/sortingview/gui/extensions/unitstable/Units/TableWidget.tsx#L200

export const rowSelectionReducer = (s: RowSelection, a: RowSelectionAction): RowSelection => {
    const { selectedRowIds } = s
    const { type, targetRow } = a
    switch (type) { 
        case SET_SELECTION:
            // TODO: Check that incoming selection all exists within the sorted rows?
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
            if (!targetRow) throw new Error(`Attempt to toggle row with unset rowid.`)
            selectedRowIds.has(targetRow) ? selectedRowIds.delete(targetRow) : selectedRowIds.add(targetRow)
            return {
                ...s,
                selectedRowIds: new Set<number>(selectedRowIds), // shallow copy, to trigger rerender
                lastClickedId: targetRow
            }
        case TOGGLE_RANGE:
            return toggleSelectedRange(s, a)
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
                lastClickedId: targetRow,
                selectedRowIds: new Set((a.incomingSelectedRowIds ?? [])),
                orderedRowIds: a.newRowOrder ?? []
            }
        default: {
            throw Error(`Invalid mode for row selection reducer: ${type}`)
        }
    }
}

export type checkboxClickCurriedDispatch = (rowId: number, evt: React.MouseEvent) => void
export type rowCheckboxClickHandlerType = (evt: React.MouseEvent) => void
// export type checkboxDispatchRowIdCurried = (evt: React.MouseEvent, allRowsSorted: number[]) => void
// export type checkboxRowsCurried = (rowId: number, evt: React.MouseEvent) => void

export const checkboxDispatchCurry = (reducer: React.Dispatch<RowSelectionAction>): checkboxClickCurriedDispatch => {
    return (rowId: number, evt: React.MouseEvent) => { checkboxClick(rowId, reducer, evt) }
}

export const rowCheckboxClickHandler = (rowId: number, reducer: checkboxClickCurriedDispatch): rowCheckboxClickHandlerType => {
    return (evt: React.MouseEvent) => { reducer(rowId, evt) }
}

// export type curryOneT = (reducer: React.Dispatch<RowSelectionAction>) => checkboxClickCurriedDispatch
// export type curryTwoT = (rowId: number, dispatch: checkboxClickCurriedDispatch) => void
// export type intermed = (allRowsSorted: number[], evt: React.MouseEvent) => void
// export type curryThreeT = (evt: React.MouseEvent, fn: curryTwoT) => void

// // Curry one: add the dispatch. Fn will still need rowId, all rows sorted, and evt.
// // Curry two: Given curry one, add the row id. Fn will still need all-rows-sorted and evt.
// // Curry three: here's the snag. Given NOT CURRY TWO, BUT JUST all-rows-sorted, return a fn takes curry-two and evt and applies it.
// export const curryOne = (reducer: React.Dispatch<RowSelectionAction>): checkboxClickCurriedDispatch => {
//     return (rowId: number, allRowsSorted: number[], evt: React.MouseEvent) => { checkboxClick(rowId, reducer, allRowsSorted, evt) }
// }
// export const curryTwo = (rowId: number, dispatchCurry: checkboxClickCurriedDispatch) => {
//     return (allRowsSorted: number[], evt: React.MouseEvent) => { dispatchCurry(rowId, allRowsSorted, evt) }
// }
// export const curryThree = (allRowsSorted: number[]): (evt: React.MouseEvent, fn: intermed) => void => {
//     return (evt: React.MouseEvent, fn: intermed) => { fn(allRowsSorted, evt) }
// }

export const checkboxClick = (rowId: number, reducer: React.Dispatch<RowSelectionAction>, evt: React.MouseEvent) => {
    const action = {
        type: evt.shiftKey ? TOGGLE_RANGE : TOGGLE_ROW,
        targetRow: rowId,
    }
    reducer(action)
}

export const allRowSelectionState = (s: {selectedRowIds: Set<number>, orderedRowIds: number[], visibleRowIndices?: number[]}): RowSelectionState => {
    if (s.selectedRowIds.size === 0) return 'none'
    if (s.selectedRowIds.size === s.orderedRowIds.length) return 'all'
    if (!s.visibleRowIndices || s.visibleRowIndices.length === 0 || s.selectedRowIds.size !== s.visibleRowIndices.length) return 'partial'
    // Some rows are visible and some are set. So status is 'partial' if those are different sets and 'all' if they're the same set.
    if (s.visibleRowIndices.some(visibleId => !s.selectedRowIds.has(visibleId))) return 'partial'
    return 'all'
}

export const realizeVisibleRowIndices = (orderedRowIds: number[], visibleRowIndices?: number[]) => {
    // In the vast majority of cases we can just slice with the visible indices, so maybe do that?
    return visibleRowIndices ? visibleRowIndices.map(r => orderedRowIds[r]) : orderedRowIds
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
        lastClickedId: targetRow,
        selectedRowIds: new Set<number>(selectedRowIds) // shallow copy to trigger rerender
    }
}

const toggleSelectAll = (s: RowSelection): RowSelection => {
    const selectionStatus = allRowSelectionState(s)
    const newSelection = selectionStatus === 'all'
                            ? new Set<number>()
                            : s.visibleRowIndices && s.visibleRowIndices.length > 0
                                ? new Set<number>(s.visibleRowIndices)
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
    if (!orderedRowIds.some((r, ii) => r === newRowOrder[ii])) return s
    return {
        ...s,
        orderedRowIds: newRowOrder,
        lastClickedId: undefined
    }
}

const setVisibleRows = (s: RowSelection, a: RowSelectionAction): RowSelection => {
    // If visible rows are manually specified, just assume caller knows what they're doing.
    if (a.newVisibleRows && a.newVisibleRows.length > 0) return { ...s, visibleRowIndices: a.newVisibleRows }

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
        visibleRowIndices: s.orderedRowIds.slice(windowStart, windowStart + newWindowSize)
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
        visibleRowIndices: rowSelection.visibleRowIndices,
        unitIdSelectionDispatch: rowSelectionDispatch
    }
}

export default RowSelectionContext