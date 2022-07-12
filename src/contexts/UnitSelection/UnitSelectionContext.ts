import React, { useContext, useMemo } from "react"
import { getCheckboxClickHandlerGenerator, getPlotClickHandlerGenerator, selectUnique, setSelectionExplicit, toggleSelectAll, toggleSelectedRange, toggleSelectedUnit } from "./UnitSelectionFunctions"
import { resetUnitOrder, updateSort } from "./UnitSelectionSortingFunctions"
import { SortingCallback, SortingRule } from "./UnitSelectionTypes"
import { setVisibleUnits } from "./UnitSelectionVisibilityFunctions"

export type UnitSelection = {
    selectedUnitIds: Set<number | string>,
    orderedUnitIds: (number | string)[]
    lastClickedId?: number | string
    page?: number
    unitsPerPage?: number
    visibleUnitIds?: (number | string)[]
    sortRules?: SortingRule[]
}

export type UnitSelectionAction = {
    type: UnitSelectionActionType
    incomingSelectedUnitIds?: (number | string)[]
    targetUnit?: number | string
    newUnitOrder?: (number | string)[]
    newVisibleUnitIds?: (number | string)[]
    pageNumber?: number
    unitsPerPage?: number
    newSortField?: string
    sortCallback?: SortingCallback
    sourceState?: UnitSelection
}

export type UnitSelectionState = 'all' | 'none' | 'partial'


export type UnitSelectionActionType = 'SET_SELECTION' | 'UNIQUE_SELECT' | 'TOGGLE_UNIT' | 'TOGGLE_RANGE' | 'TOGGLE_SELECT_ALL' | 'DESELECT_ALL' | 
                                     'INITIALIZE_UNITS' | 'SET_UNIT_ORDER' | 'UPDATE_SORT_FIELDS' |
                                     'SET_VISIBLE_UNITS' | // 'SET_WINDOW_SIZE' | 'SET_PAGE_NUMBER' |
                                     'COPY_STATE'

export const SET_SELECTION: UnitSelectionActionType = 'SET_SELECTION'
export const UNIQUE_SELECT: UnitSelectionActionType = 'UNIQUE_SELECT'
export const TOGGLE_UNIT: UnitSelectionActionType = 'TOGGLE_UNIT'
export const TOGGLE_RANGE: UnitSelectionActionType = 'TOGGLE_RANGE'
export const TOGGLE_SELECT_ALL: UnitSelectionActionType = 'TOGGLE_SELECT_ALL'
export const DESELECT_ALL: UnitSelectionActionType = 'DESELECT_ALL'
export const INITIALIZE_UNITS: UnitSelectionActionType = 'INITIALIZE_UNITS'
export const SET_UNIT_ORDER: UnitSelectionActionType = 'SET_UNIT_ORDER'
export const UPDATE_SORT_FIELDS: UnitSelectionActionType = 'UPDATE_SORT_FIELDS'
export const SET_VISIBLE_UNITS: UnitSelectionActionType = 'SET_VISIBLE_UNITS'

// Not sure if this is the best approach...?
export const COPY_STATE: UnitSelectionActionType = 'COPY_STATE'

// NOTE: If we ever want to re-implement paint-bucket functionality, see
// https://github.com/magland/sortingview/blob/c71bdc5c095174cbda25866a6748223a715a3792/src/python/sortingview/gui/extensions/unitstable/Units/TableWidget.tsx#L200


export const defaultUnitSelection = {
    selectedUnitIds: new Set<number | string>(),
    orderedUnitIds: []
}

export const unitSelectionReducer = (s: UnitSelection, a: UnitSelectionAction): UnitSelection => {
    const { type } = a
    switch (type) { 
        case INITIALIZE_UNITS:
            if (s.orderedUnitIds.length > 0) return s
            if (a.newUnitOrder && a.newUnitOrder.length > 1) {
                return {
                    selectedUnitIds: new Set<number | string>(),
                    orderedUnitIds: a.newUnitOrder
                }
            }
            throw Error('Attempt to initialize table ordering with no actual units passed.')
        case SET_SELECTION:
            return setSelectionExplicit(s, a)
        case UNIQUE_SELECT:
            return selectUnique(s, a)
        case TOGGLE_UNIT:
            return toggleSelectedUnit(s, a)
        case TOGGLE_RANGE:
            // range selection defaults to unit toggle if last-clicked was cleared (e.g. by resorting)
            return s.lastClickedId ? toggleSelectedRange(s, a) : toggleSelectedUnit(s, a)
        case TOGGLE_SELECT_ALL:
            return toggleSelectAll(s)
        case DESELECT_ALL:
            return { ...s, selectedUnitIds: new Set<number | string>() }
        case SET_UNIT_ORDER:
            return resetUnitOrder(s, a)
        case UPDATE_SORT_FIELDS:
            return updateSort(s, a)
        case SET_VISIBLE_UNITS:
            return setVisibleUnits(s, a)
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
            throw Error(`Invalid mode for unit selection reducer: ${type}`)
        }
    }
}

export const useUnitSelection = () => {
    const c = useContext(UnitSelectionContext)
    return c
}

const UnitSelectionContext = React.createContext<{
    unitSelection: UnitSelection,
    unitSelectionDispatch: (action: UnitSelectionAction) => void
}>({
    unitSelection: defaultUnitSelection,
    unitSelectionDispatch: (action: UnitSelectionAction) => {}
    // this empty sortingSelectionDispatch function gets replaced by the xxContext.Provider element in App.tsx.
})

// TODO: Should we split this into a few more focused hooks?
export const useSelectedUnitIds = () => {
    const { unitSelection, unitSelectionDispatch } = useUnitSelection()
    const checkboxClickHandlerGenerator = useMemo(() => getCheckboxClickHandlerGenerator(unitSelectionDispatch), [unitSelectionDispatch])
    const plotClickHandlerGenerator = useMemo(() => getPlotClickHandlerGenerator(unitSelectionDispatch), [unitSelectionDispatch])

    return {
        selectedUnitIds: unitSelection.selectedUnitIds,
        orderedUnitIds: unitSelection.orderedUnitIds,
        visibleUnitIds: unitSelection.visibleUnitIds,
        primarySortRule: unitSelection.sortRules && unitSelection.sortRules.length > 0 ? unitSelection.sortRules[unitSelection.sortRules.length -1] : undefined,
        page: unitSelection.page,
        unitsPerPage: unitSelection.unitsPerPage,
        checkboxClickHandlerGenerator,
        plotClickHandlerGenerator,
        unitIdSelectionDispatch: unitSelectionDispatch,
        currentState: unitSelection
    }
}

export default UnitSelectionContext