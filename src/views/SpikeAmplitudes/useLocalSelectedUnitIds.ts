import { useSelectedUnitIds } from "contexts/RowSelectionContext"
import { useCallback, useEffect, useState } from "react"

const useLocalSelectedUnitIds = () => {
    const [selectionLocked, setSelectionLocked] = useState<boolean>(false)
    const toggleSelectionLocked = useCallback(() => {
        setSelectionLocked(a => (!a))
    }, [])
    const {selectedUnitIds, setSelectedUnitIds} = useSelectedUnitIds()
    const [localValue, setLocalValue] = useState<number[]>([])
    useEffect(() => {
        if (!selectionLocked) {
            setLocalValue(selectedUnitIds)
        }
    }, [selectedUnitIds, selectionLocked])
    if (!selectionLocked) return {selectedUnitIds, setSelectedUnitIds, selectionLocked, toggleSelectionLocked}
    else {
        return {selectedUnitIds: localValue, setSelectedUnitIds: setLocalValue, selectionLocked, toggleSelectionLocked}
    }
}

export default useLocalSelectedUnitIds