import React, { useCallback, useContext } from "react"

export type SortingSelection = {
    selectedUnitIds: number[]
}

export const defaultSortingSelection = {
    selectedUnitIds: []
}

export type SortingSelectionAction = {
    type: 'setSelectedUnitIds'
    selectedUnitIds: number[]
}

export const sortingSelectionReducer = (s: SortingSelection, a: SortingSelectionAction): SortingSelection => {
    if (a.type === 'setSelectedUnitIds') {
        return {
            ...s,
            selectedUnitIds: [...a.selectedUnitIds]
        }
    }
    else return s
}

const SortingSelectionContext = React.createContext<{
    sortingSelection: SortingSelection,
    sortingSelectionDispatch: (action: SortingSelectionAction) => void
}>({
    sortingSelection: defaultSortingSelection,
    sortingSelectionDispatch: (action: SortingSelectionAction) => {}
})

export const useSortingSelection = () => {
    const c = useContext(SortingSelectionContext)
    return c
}

export const useSelectedUnitIds = () => {
    const {sortingSelection, sortingSelectionDispatch} = useSortingSelection()
    const setSelectedUnitIds = useCallback((x: number[]) => {
        sortingSelectionDispatch({
            type: 'setSelectedUnitIds',
            selectedUnitIds: x
        })
    }, [sortingSelectionDispatch])
    return {
        selectedUnitIds: sortingSelection.selectedUnitIds,
        setSelectedUnitIds
    }
}

export default SortingSelectionContext