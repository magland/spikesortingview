import React, { useContext } from "react"

export type RowSelection = {
    selectedRowIds: Set<number>,
    lastClickedId?: number
    // TODO: Cache list of valid row IDs?
    // TODO: Store sorting here too?
}

export const defaultRowSelection = {
    selectedRowIds: new Set<number>()
}

// type Modifier = null | 'shift' | 'ctrl'

export type RowSelectionActionType = 'SET_SELECTION' | 'UNIQUE_SELECT' | 'TOGGLE_ROW' | 'TOGGLE_RANGE' | 'SELECT_ALL' | 'DESELECT_ALL' | 'COPY_STATE' // sorting??

export const SET_SELECTION: RowSelectionActionType = 'SET_SELECTION'
export const UNIQUE_SELECT: RowSelectionActionType = 'UNIQUE_SELECT'
export const TOGGLE_ROW: RowSelectionActionType = 'TOGGLE_ROW'
export const TOGGLE_RANGE: RowSelectionActionType = 'TOGGLE_RANGE'
export const SELECT_ALL: RowSelectionActionType = 'SELECT_ALL'
export const DESELECT_ALL: RowSelectionActionType = 'DESELECT_ALL'
export const COPY_STATE: RowSelectionActionType = 'COPY_STATE'

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
    const { selectedRowIds } = s
    const { type, targetRow, allRowIds } = a
    switch (type) { 
        case SET_SELECTION:
            return {
                ...s,
                selectedRowIds: new Set((a.incomingSelectedRowIds ?? []))
            }
        case UNIQUE_SELECT:
            if (targetRow === undefined) {
                throw Error(`UNIQUE_SELECT for row selection requires a target row to be set.`)
            }
            return {
                ...s,
                lastClickedId: targetRow,
                selectedRowIds: new Set([targetRow])
            }
        case TOGGLE_ROW:
            if (!targetRow) throw new Error(`Attempt to toggle row with unset rowid.`)
            selectedRowIds.has(targetRow) ? selectedRowIds.delete(targetRow) : selectedRowIds.add(targetRow)
            return {
                selectedRowIds: new Set<number>(selectedRowIds), // shallow copy, to trigger rerender
                lastClickedId: targetRow
            }
        case TOGGLE_RANGE:
            return toggleSelectedRange(s, a)
        case SELECT_ALL:
            if (!allRowIds) throw new Error(`Attempt to select all rows without specifying full row set.`)
            return {
                selectedRowIds: new Set(allRowIds)
            }
        case DESELECT_ALL:
            // return defaultRowSelection
            return { selectedRowIds: new Set<number>() }
        case COPY_STATE:
            return {
                lastClickedId: targetRow,
                selectedRowIds: new Set((a.incomingSelectedRowIds ?? []))
            }
        default: {
            throw Error(`Invalid mode for row selection reducer: ${type}`)
        }
    }
}

export type checkboxClickCurriedDispatch = (rowId: number, allRowsSorted: number[], evt: React.MouseEvent) => void
export type checkboxDispatchRowIdCurried = (evt: React.MouseEvent, allRowsSorted: number[]) => void
export type checkboxRowsCurried = (rowId: number, evt: React.MouseEvent) => void

export const checkboxDispatchCurry = (reducer: React.Dispatch<RowSelectionAction>): checkboxClickCurriedDispatch => {
    return (rowId: number, allRowsSorted: number[], evt: React.MouseEvent) => { checkboxClick(rowId, reducer, allRowsSorted, evt) }
}

export const checkboxRowsCurry = (allRowsSorted: number[], dispatchCurry: checkboxClickCurriedDispatch): checkboxRowsCurried => {
    return (rowId: number, evt: React.MouseEvent) => { dispatchCurry(rowId, allRowsSorted, evt) }
}

export const checkboxFnNeedingRows = (rowId: number, dispatchCurry: checkboxClickCurriedDispatch): checkboxDispatchRowIdCurried => {
    return (evt: React.MouseEvent, allRowsSorted: number[]) => { dispatchCurry(rowId, allRowsSorted, evt) }
}

export const checkboxRowIdCurry = (rowId: number, curriedDispatch: checkboxRowsCurried) => {
    return (evt: React.MouseEvent) => { curriedDispatch(rowId, evt) }
}

export type curryOneT = (reducer: React.Dispatch<RowSelectionAction>) => checkboxClickCurriedDispatch
export type curryTwoT = (rowId: number, dispatch: checkboxClickCurriedDispatch) => void
export type intermed = (allRowsSorted: number[], evt: React.MouseEvent) => void
export type curryThreeT = (evt: React.MouseEvent, fn: curryTwoT) => void

// Curry one: add the dispatch. Fn will still need rowId, all rows sorted, and evt.
// Curry two: Given curry one, add the row id. Fn will still need all-rows-sorted and evt.
// Curry three: here's the snag. Given NOT CURRY TWO, BUT JUST all-rows-sorted, return a fn takes curry-two and evt and applies it.
export const curryOne = (reducer: React.Dispatch<RowSelectionAction>): checkboxClickCurriedDispatch => {
    return (rowId: number, allRowsSorted: number[], evt: React.MouseEvent) => { checkboxClick(rowId, reducer, allRowsSorted, evt) }
}
export const curryTwo = (rowId: number, dispatchCurry: checkboxClickCurriedDispatch) => {
    return (allRowsSorted: number[], evt: React.MouseEvent) => { dispatchCurry(rowId, allRowsSorted, evt) }
}
export const curryThree = (allRowsSorted: number[]): (evt: React.MouseEvent, fn: intermed) => void => {
    return (evt: React.MouseEvent, fn: intermed) => { fn(allRowsSorted, evt) }
}

export const checkboxClick = (rowId: number, reducer: React.Dispatch<RowSelectionAction>, allRowsSorted: number[], evt: React.MouseEvent) => {
    const action = {
        type: evt.shiftKey ? TOGGLE_RANGE : TOGGLE_ROW,
        targetRow: rowId,
        sortedRowIds: allRowsSorted
    }
    reducer(action)
}

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
    selectedRowIds.has(targetRow)
        ? toggledIds.forEach(id => selectedRowIds.delete(id))
        : toggledIds.forEach(id => selectedRowIds.add(id))

    return {
        lastClickedId: targetRow,
        selectedRowIds: new Set<number>(selectedRowIds) // shallow copy to trigger rerender
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