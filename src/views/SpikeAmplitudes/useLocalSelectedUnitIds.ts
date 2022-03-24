import { defaultRowSelection, rowSelectionReducer, SET_SELECTION, useSelectedUnitIds } from "contexts/RowSelectionContext"
import { useCallback, useEffect, useReducer, useState } from "react"

const useLocalSelectedUnitIds = () => {
    const [selectionLocked, setSelectionLocked] = useState<boolean>(false)
    const toggleSelectionLocked = useCallback(() => {
        setSelectionLocked(a => (!a))
    }, [])
    const {selectedUnitIds, unitIdSelectionDispatch} = useSelectedUnitIds()
    const [localSelectedUnitIds, localUnitIdSelectionDispatch] = useReducer(rowSelectionReducer, defaultRowSelection)
    
    useEffect(() => {
        if (!selectionLocked) {
            localUnitIdSelectionDispatch({type: SET_SELECTION, incomingSelectedRowIds: [...selectedUnitIds]})
        }
    }, [selectedUnitIds, selectionLocked])
    return {
        selectedUnitIds: selectionLocked ? localSelectedUnitIds.selectedRowIds : selectedUnitIds,
        unitIdSelectionDispatch: selectionLocked ? localUnitIdSelectionDispatch : unitIdSelectionDispatch,
        selectionLocked,
        toggleSelectionLocked
    }
}

export default useLocalSelectedUnitIds