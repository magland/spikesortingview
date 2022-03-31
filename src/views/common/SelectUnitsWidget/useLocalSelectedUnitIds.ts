import { COPY_STATE, defaultRowSelection, rowSelectionReducer, useSelectedUnitIds } from 'contexts/RowSelection/RowSelectionContext';
import { getCheckboxClickHandlerGenerator } from 'contexts/RowSelection/RowSelectionFunctions';
import { useCallback, useEffect, useMemo, useReducer, useState } from "react";

// In practice we freeze the controls when the local selection is being used, but this component could theoretically support a separate selector.
const useLocalSelectedUnitIds = () => {
    const [selectionLocked, setSelectionLocked] = useState<boolean>(false)
    const toggleSelectionLocked = useCallback(() => {
        setSelectionLocked(a => (!a))
    }, [])
    const {selectedUnitIds, orderedRowIds, visibleRowIds, primarySortRule, checkboxClickHandlerGenerator, unitIdSelectionDispatch, currentState} = useSelectedUnitIds()
    const [localSelectedUnitIds, localUnitIdSelectionDispatch] = useReducer(rowSelectionReducer, defaultRowSelection)
    
    useEffect(() => {
        if (!selectionLocked) {
            localUnitIdSelectionDispatch({
                type: COPY_STATE,
                sourceState: currentState
            })
        }
    }, [currentState, selectionLocked])

    const generator = useMemo(() => {
        return selectionLocked ? getCheckboxClickHandlerGenerator(localUnitIdSelectionDispatch) : checkboxClickHandlerGenerator
    }, [selectionLocked, checkboxClickHandlerGenerator])

    const realizedPrimarySortRule = useMemo(() => {
        const localRule = (localSelectedUnitIds.sortRules && localSelectedUnitIds.sortRules.length > 0)
            ? localSelectedUnitIds.sortRules[localSelectedUnitIds.sortRules.length - 1]
            : undefined
        return selectionLocked 
            ? localRule
            : primarySortRule
    }, [selectionLocked, primarySortRule, localSelectedUnitIds])

    return {
        selectedUnitIds: selectionLocked ? localSelectedUnitIds.selectedRowIds : selectedUnitIds,
        orderedRowIds: selectionLocked ? localSelectedUnitIds.orderedRowIds : orderedRowIds,
        visibleRowIds: selectionLocked ? localSelectedUnitIds.visibleRowIds : visibleRowIds,
        unitIdSelectionDispatch: selectionLocked ? localUnitIdSelectionDispatch : unitIdSelectionDispatch,
        primarySortRule: realizedPrimarySortRule,
        checkboxClickHandlerGenerator: generator,
        selectionLocked,
        toggleSelectionLocked
    }
}

export default useLocalSelectedUnitIds