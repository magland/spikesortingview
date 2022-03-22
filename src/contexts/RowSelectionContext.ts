import React, { useContext } from "react"

export type RowSelection = {
    selectedRowIds: number[],
    lastClickedId?: number
    // TODO: Cache list of valid row IDs?
    // TODO: Store sorting here too?
}

export const defaultRowSelection = {
    selectedRowIds: []
}

// type Modifier = null | 'shift' | 'ctrl'

export type RowSelectionActionType = 'SET_SELECTION' | 'TOGGLE_ROW' | 'TOGGLE_RANGE' | 'SELECT_ALL' | 'DESELECT_ALL' // sorting??

export const SET_SELECTION: RowSelectionActionType = 'SET_SELECTION'
export const TOGGLE_ROW: RowSelectionActionType = 'TOGGLE_ROW'
export const TOGGLE_RANGE: RowSelectionActionType = 'TOGGLE_RANGE'
export const SELECT_ALL: RowSelectionActionType = 'SELECT_ALL'
export const DESELECT_ALL: RowSelectionActionType = 'DESELECT_ALL'

export type RowSelectionAction = {
    type: RowSelectionActionType
    incomingSelectedRowIds?: number[]
    targetRow?: number
    sortedRowIds?: number[]
    allRowIds?: number[]
}

// NOTE: If we ever want to re-implement paint-bucket functionality, see
// https://github.com/magland/sortingview/blob/c71bdc5c095174cbda25866a6748223a715a3792/src/python/sortingview/gui/extensions/unitstable/Units/TableWidget.tsx#L200

export const rowSelectionReducer = (s: RowSelection, a: RowSelectionAction): RowSelection => {
    const { selectedRowIds: selectedUnitIds } = s
    const { type, targetRow, allRowIds } = a
    switch (type) { 
        case SET_SELECTION:
            return {
                ...s,
                selectedRowIds: [...(a.incomingSelectedRowIds ?? [])]
            }
        case TOGGLE_ROW:
            if (!targetRow) throw new Error(`Attempt to toggle row with unset rowid.`) 
            return {
                selectedRowIds: selectedUnitIds.includes(targetRow) ? selectedUnitIds.filter(id => id !== targetRow) : [...selectedUnitIds, targetRow],
                lastClickedId: targetRow
            }
        case TOGGLE_RANGE:
            return toggleSelectedRange(s, a)
        case SELECT_ALL:
            if (!allRowIds) throw new Error(`Attempt to select all rows without specifying full row set.`)
            return {
                selectedRowIds: allRowIds
            }
        case DESELECT_ALL:
            return defaultRowSelection
        default: {
            throw Error(`Invalid mode for row selection reducer: ${type}`)
        }
    }
}

export type checkboxClickCurriedDispatch = (rowId: number, evt: React.MouseEvent) => void

export const checkboxDispatchCurry = (reducer: React.Dispatch<RowSelectionAction>) => {
    return (rowId: number, evt: React.MouseEvent) => { checkboxClick(rowId, reducer, evt) }
}

export const checkboxRowIdCurry = (rowId: number, curriedDispatch: checkboxClickCurriedDispatch) => {
    return (evt: React.MouseEvent) => { curriedDispatch(rowId, evt) }
}

export const checkboxClick = (rowId: number, reducer: React.Dispatch<RowSelectionAction>, evt: React.MouseEvent) => {
    const action = {
        type: evt.shiftKey ? TOGGLE_RANGE : TOGGLE_ROW,
        targetRow: rowId
    }
    reducer(action)
}

// export type checkboxClickCurriedDispatch = (rowId: number, modifier?: Modifier) => void

// export const checkboxDispatchCurry = (reducer: React.Dispatch<RowSelectionAction>) => {
//     return (rowId: number, modifier?: Modifier) => { checkboxClick(rowId, reducer, modifier) }
// }

// export const checkboxRowIdCurry = (rowId: number, curriedDispatch: checkboxClickCurriedDispatch) => {
//     return (modifier?: Modifier) => { curriedDispatch(rowId, modifier) }
// }

// export const checkboxClick = (rowId: number, reducer: React.Dispatch<RowSelectionAction>, modifier?: Modifier) => {
//     const action = {
//         type: modifier === 'shift' ? TOGGLE_RANGE : TOGGLE_ROW,
//         targetRow: rowId
//     }
//     reducer(action)
// }

const toggleSelectedRange = (s: RowSelection, a: RowSelectionAction): RowSelection => {
    const { selectedRowIds, lastClickedId } = s
    const { sortedRowIds, targetRow } = a
    if (!sortedRowIds) throw Error(`Cannot toggle range with undefined row id listing.`)
    if (!lastClickedId || !targetRow) throw Error(`Cannot toggle range with undefined limit: last-clicked ${lastClickedId}, target ${targetRow}`)
    const lastClickedIndex = sortedRowIds.findIndex(id => id === lastClickedId)
    const targetIndex = sortedRowIds.findIndex(id => id === targetRow)
    if (lastClickedIndex === -1 || targetIndex === -1) {
        throw Error(`Requested to toggle row range from ID ${lastClickedId} to ID ${targetRow} but one of these was not found.`)
    }
    const toggledIds = sortedRowIds.slice(Math.min(lastClickedIndex, targetIndex), Math.max(lastClickedIndex, targetIndex) + 1)
    if (selectedRowIds.includes(targetRow)) { // deselection
        return {
            lastClickedId: targetRow,
            selectedRowIds: selectedRowIds.filter(id => !toggledIds.includes(id))
        }
    }
    // selection
    const selectedSet = new Set([...selectedRowIds, ...toggledIds])
    return {
        lastClickedId: targetRow,
        selectedRowIds: Array.from(selectedSet)
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

export const useSelectedUnitIds = () => {
    const { rowSelection, rowSelectionDispatch } = useRowSelection()
    return {
        selectedUnitIds: rowSelection.selectedRowIds,
        unitIdSelectionDispatch: rowSelectionDispatch
    }
}

export default RowSelectionContext