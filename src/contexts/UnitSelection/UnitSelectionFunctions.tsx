import { UnitSelection, UnitSelectionAction, UnitSelectionState, TOGGLE_RANGE, TOGGLE_UNIT, UNIQUE_SELECT } from "./UnitSelectionContext"


export const selectUnique = (s: UnitSelection, a: UnitSelectionAction): UnitSelection => {
    const { targetUnit } = a
    if (targetUnit === undefined) {
        throw Error(`UNIQUE_SELECT for unit selection requires a target unit to be set.`)
    }
    if (!s.orderedUnitIds.includes(targetUnit)) {
        throw Error(`Requested unit ID ${targetUnit} is not present in the ordered unit set.`)
    }
    return {
        ...s,
        lastClickedId: targetUnit,
        selectedUnitIds: new Set(s.selectedUnitIds.has(targetUnit) ? [] : [targetUnit])
    }
}

export const setSelectionExplicit = (s: UnitSelection, a: UnitSelectionAction): UnitSelection => {
    if ((a.incomingSelectedUnitIds || []).some(unitId => !s.orderedUnitIds.includes(unitId))) {
        throw Error(`Attempt to set a selection including units that are not in known data.`)
    }
    return {
        ...s,
        selectedUnitIds: new Set((a.incomingSelectedUnitIds ?? []))
    }
}

export const allUnitSelectionState = (s: {selectedUnitIds: Set<number | string>, orderedUnitIds: (number | string)[], visibleUnitIds?: (number | string)[]}): UnitSelectionState => {
    if (s.selectedUnitIds.size === 0) return 'none'
    if (s.selectedUnitIds.size === s.orderedUnitIds.length) return 'all'
    if (!s.visibleUnitIds || s.visibleUnitIds.length === 0 || s.selectedUnitIds.size !== s.visibleUnitIds.length) return 'partial'
    // Some units are visible and some are set. So status is 'partial' if those are different sets and 'all' if they're the same set.
    if (s.visibleUnitIds.some(visibleId => !s.selectedUnitIds.has(visibleId))) return 'partial'
    return 'all'
}

export const toggleSelectedUnit = (s: UnitSelection, a: UnitSelectionAction): UnitSelection => {
    if (a.targetUnit === undefined) throw new Error(`Attempt to toggle unit with unset unitid.`)
    s.selectedUnitIds.has(a.targetUnit) ? s.selectedUnitIds.delete(a.targetUnit) : s.selectedUnitIds.add(a.targetUnit)
    return {
        ...s,
        selectedUnitIds: new Set<number | string>(s.selectedUnitIds), // shallow copy, to trigger rerender
        lastClickedId: a.targetUnit
    }
}

export const toggleSelectedRange = (s: UnitSelection, a: UnitSelectionAction): UnitSelection => {
    const { selectedUnitIds, lastClickedId, orderedUnitIds } = s
    const { targetUnit } = a
    if (orderedUnitIds.length === 0) throw Error(`Attempt to toggle range with no units initialized.`)
    if (!lastClickedId || !targetUnit) throw Error(`Cannot toggle range with undefined limit: last-clicked ${lastClickedId}, target ${targetUnit}`)
    const lastClickedIndex = orderedUnitIds.findIndex(id => id === lastClickedId)
    const targetIndex = orderedUnitIds.findIndex(id => id === targetUnit)
    if (lastClickedIndex === -1 || targetIndex === -1) {
        throw Error(`Requested to toggle unit range from ID ${lastClickedId} to ID ${targetUnit} but one of these was not found.`)
    }
    const toggledIds = orderedUnitIds.slice(Math.min(lastClickedIndex, targetIndex), Math.max(lastClickedIndex, targetIndex) + 1)
    selectedUnitIds.has(targetUnit)
        ? toggledIds.forEach(id => selectedUnitIds.delete(id))
        : toggledIds.forEach(id => selectedUnitIds.add(id))

    return {
        ...s,
        lastClickedId: targetUnit, // TODO: Check with client: should a range toggle update the last-selected-unit?
        selectedUnitIds: new Set<number | string>(selectedUnitIds) // shallow copy to trigger rerender
    }
}

export const toggleSelectAll = (s: UnitSelection): UnitSelection => {
    const selectionStatus = allUnitSelectionState(s)
    const newSelection = selectionStatus === 'all'
                            ? new Set<number>()
                            : s.visibleUnitIds && s.visibleUnitIds.length > 0
                                ? new Set<number | string>(s.visibleUnitIds)
                                : new Set<number | string>(s.orderedUnitIds)
    return {
        ...s,
        selectedUnitIds: newSelection
    }
}

export const getCheckboxClickHandlerGenerator = (reducer: React.Dispatch<UnitSelectionAction>) => {
    return (unitId: number | string) => (evt: React.MouseEvent) => { checkboxClick(unitId, reducer, evt) }
}

export const getPlotClickHandlerGenerator = (reducer: React.Dispatch<UnitSelectionAction>) => {
    return (unitId: number | string) => (evt: React.MouseEvent) => { plotElementClick(unitId, reducer, evt) }
}

export const checkboxClick = (unitId: number | string, reducer: React.Dispatch<UnitSelectionAction>, evt: React.MouseEvent) => {
    const action = {
        type: evt.shiftKey ? TOGGLE_RANGE : TOGGLE_UNIT,
        targetUnit: unitId,
    }
    reducer(action)
}

export const plotElementClick = (unitId: number | string, reducer: React.Dispatch<UnitSelectionAction>, evt: React.MouseEvent) => {
    const action = {
        type: evt.shiftKey ? TOGGLE_RANGE :
            evt.ctrlKey ? TOGGLE_UNIT : UNIQUE_SELECT,
        targetUnit: unitId
    }
    reducer(action)
}

export const voidClickHandler = (evt: React.MouseEvent) => {}