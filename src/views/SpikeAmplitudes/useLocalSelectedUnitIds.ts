import { COPY_STATE, defaultRowSelection, rowSelectionReducer, useSelectedUnitIds } from "contexts/RowSelectionContext"
import { useCallback, useEffect, useReducer, useState } from "react"

// In practice we freeze the controls when the local selection is being used, but this component could theoretically support a separate selector.
const useLocalSelectedUnitIds = () => {
    const [selectionLocked, setSelectionLocked] = useState<boolean>(false)
    const toggleSelectionLocked = useCallback(() => {
        setSelectionLocked(a => (!a))
    }, [])
    const {selectedUnitIds, orderedRowIds, visibleRowIds, page, rowsPerPage, unitIdSelectionDispatch} = useSelectedUnitIds()
    const [localSelectedUnitIds, localUnitIdSelectionDispatch] = useReducer(rowSelectionReducer, defaultRowSelection)
    
    useEffect(() => {
        if (!selectionLocked) {
            localUnitIdSelectionDispatch({
                type: COPY_STATE,
                incomingSelectedRowIds: [...selectedUnitIds],
                newRowOrder: orderedRowIds,
                targetRow: undefined,
                pageNumber: page,
                rowsPerPage: rowsPerPage,
                newVisibleRowIds: visibleRowIds
            })
        }
    }, [selectedUnitIds, orderedRowIds, page, rowsPerPage, visibleRowIds, selectionLocked])
    return {
        selectedUnitIds: selectionLocked ? localSelectedUnitIds.selectedRowIds : selectedUnitIds,
        unitIdSelectionDispatch: selectionLocked ? localUnitIdSelectionDispatch : unitIdSelectionDispatch,
        selectionLocked,
        toggleSelectionLocked
    }
}

export default useLocalSelectedUnitIds