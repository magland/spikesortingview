import React, { useContext, useMemo } from "react"
import { getCheckboxClickHandlerGenerator, getPlotClickHandlerGenerator, selectUnique, setSelectionExplicit, toggleSelectAll, toggleSelectedRange, toggleSelectedRow } from "./RowSelectionFunctions"
import { resetRowOrder, updateSort } from "./RowSelectionSortingFunctions"
import { SortingCallback, SortingRule } from "./RowSelectionTypes"
import { setVisibleRows } from "./RowSelectionVisibilityFunctions"

export type RowSelection = {
    selectedRowIds: Set<number | string>,
    orderedRowIds: (number | string)[]
    lastClickedId?: number | string
    page?: number
    rowsPerPage?: number
    visibleRowIds?: (number | string)[]
    sortRules?: SortingRule[]
}

export type RowSelectionAction = {
    type: RowSelectionActionType
    incomingSelectedRowIds?: (number | string)[]
    targetRow?: number | string
    newRowOrder?: (number | string)[]
    newVisibleRowIds?: (number | string)[]
    pageNumber?: number
    rowsPerPage?: number
    newSortField?: string
    sortCallback?: SortingCallback
    sourceState?: RowSelection
}

export type RowSelectionState = 'all' | 'none' | 'partial'


export type RowSelectionActionType = 'SET_SELECTION' | 'UNIQUE_SELECT' | 'TOGGLE_ROW' | 'TOGGLE_RANGE' | 'TOGGLE_SELECT_ALL' | 'DESELECT_ALL' | 
                                     'INITIALIZE_ROWS' | 'SET_ROW_ORDER' | 'UPDATE_SORT_FIELDS' |
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
export const UPDATE_SORT_FIELDS: RowSelectionActionType = 'UPDATE_SORT_FIELDS'
export const SET_VISIBLE_ROWS: RowSelectionActionType = 'SET_VISIBLE_ROWS'

// Not sure if this is the best approach...?
export const COPY_STATE: RowSelectionActionType = 'COPY_STATE'

// NOTE: If we ever want to re-implement paint-bucket functionality, see
// https://github.com/magland/sortingview/blob/c71bdc5c095174cbda25866a6748223a715a3792/src/python/sortingview/gui/extensions/unitstable/Units/TableWidget.tsx#L200


export const defaultRowSelection = {
    selectedRowIds: new Set<number | string>(),
    orderedRowIds: []
}

export const rowSelectionReducer = (s: RowSelection, a: RowSelectionAction): RowSelection => {
    const { type } = a
    switch (type) { 
        case INITIALIZE_ROWS:
            if (s.orderedRowIds.length > 0) return s
            if (a.newRowOrder && a.newRowOrder.length > 1) {
                return {
                    selectedRowIds: new Set<number | string>(),
                    orderedRowIds: a.newRowOrder
                }
            }
            throw Error('Attempt to initialize table ordering with no actual rows passed.')
        case SET_SELECTION:
            return setSelectionExplicit(s, a)
        case UNIQUE_SELECT:
            return selectUnique(s, a)
        case TOGGLE_ROW:
            return toggleSelectedRow(s, a)
        case TOGGLE_RANGE:
            // range selection defaults to row toggle if last-clicked was cleared (e.g. by resorting)
            return s.lastClickedId ? toggleSelectedRange(s, a) : toggleSelectedRow(s, a)
        case TOGGLE_SELECT_ALL:
            return toggleSelectAll(s)
        case DESELECT_ALL:
            return { ...s, selectedRowIds: new Set<number | string>() }
        case SET_ROW_ORDER:
            return resetRowOrder(s, a)
        case UPDATE_SORT_FIELDS:
            return updateSort(s, a)
        case SET_VISIBLE_ROWS:
            return setVisibleRows(s, a)
        // case SET_WINDOW_SIZE:
        //     break;
        // case SET_PAGE_NUMBER:
        //     break;
        // This is kind of hacky but necessary to sync for useLocalSelectedUnitIds. There's probably a better way to do this.
        case COPY_STATE:
            if (!a.sourceState) throw Error('Attempt to copy state but no source state was provided.')
            return {
                ...a.sourceState
            }
        default: {
            throw Error(`Invalid mode for row selection reducer: ${type}`)
        }
    }
}

export const useRowSelection = () => {
    const c = useContext(RowSelectionContext)
    return c
}

const RowSelectionContext = React.createContext<{
    rowSelection: RowSelection,
    rowSelectionDispatch: (action: RowSelectionAction) => void
}>({
    rowSelection: defaultRowSelection,
    rowSelectionDispatch: (action: RowSelectionAction) => {}
    // this empty sortingSelectionDispatch function gets replaced by the xxContext.Provider element in App.tsx.
})

// TODO: Should we split this into a few more focused hooks?
export const useSelectedUnitIds = () => {
    const { rowSelection, rowSelectionDispatch } = useRowSelection()
    const checkboxClickHandlerGenerator = useMemo(() => getCheckboxClickHandlerGenerator(rowSelectionDispatch), [rowSelectionDispatch])
    const plotClickHandlerGenerator = useMemo(() => getPlotClickHandlerGenerator(rowSelectionDispatch), [rowSelectionDispatch])

    return {
        selectedUnitIds: rowSelection.selectedRowIds,
        orderedRowIds: rowSelection.orderedRowIds,
        visibleRowIds: rowSelection.visibleRowIds,
        primarySortRule: rowSelection.sortRules && rowSelection.sortRules.length > 0 ? rowSelection.sortRules[rowSelection.sortRules.length -1] : undefined,
        page: rowSelection.page,
        rowsPerPage: rowSelection.rowsPerPage,
        checkboxClickHandlerGenerator,
        plotClickHandlerGenerator,
        unitIdSelectionDispatch: rowSelectionDispatch,
        currentState: rowSelection
    }
}

export default RowSelectionContext