import { INITIALIZE_UNITS, UnitSelectionAction } from 'contexts/UnitSelection/UnitSelectionContext';
import { SortingRule } from 'contexts/UnitSelection/UnitSelectionTypes';
import { useSortingCuration } from 'contexts/SortingCurationContext';
import React, { FunctionComponent, useEffect, useMemo } from 'react';
import { idToNum } from 'views/AverageWaveforms/AverageWaveformsView';
import ColorPatchUnitIdLabel, { ColorPatchUnitLabelProps, mergeGroupForUnitId } from 'views/common/SortableTableWidget/ColorPatchUnitIdLabel';
import SortableTableWidget from 'views/common/SortableTableWidget/SortableTableWidget';
import { SortableTableWidgetRow } from 'views/common/SortableTableWidget/SortableTableWidgetTypes';


export type SelectUnitsWidgetProps = {
    unitIds: (number | string)[]
    selectedUnitIds: Set<number | string>,
    orderedUnitIds: (number | string)[],
    visibleUnitIds?: (number | string)[],
    primarySortRule?: SortingRule,
    unitIdSelectionDispatch: (action: UnitSelectionAction) => void,
    checkboxClickHandlerGenerator: (rowId: number | string) => (evt: React.MouseEvent) => void
    selectionDisabled?: boolean
}

const SelectUnitsWidget: FunctionComponent<SelectUnitsWidgetProps> = (props: SelectUnitsWidgetProps) => {
    const { unitIds, orderedUnitIds, visibleUnitIds, selectedUnitIds, primarySortRule, checkboxClickHandlerGenerator, unitIdSelectionDispatch, selectionDisabled }  = props
    const {sortingCuration} = useSortingCuration()

    const columns = useMemo(() => ([
        {
            columnName: '_unitId',
            label: 'Unit',
            tooltip: 'Unit ID',
            sort: (a: any, b: any) => (idToNum(a) - idToNum(b)),
            dataElement: (d: ColorPatchUnitLabelProps) => (<ColorPatchUnitIdLabel unitId={d.unitId} mergeGroup={d.mergeGroup}/>),
            calculating: false
        }
    ]), [])

    const rows = useMemo(() => (
        unitIds.map(id => {
            const unitIdData = {
                value: {unitId: id, mergeGroup: mergeGroupForUnitId(id, sortingCuration)},
                sortValue: id
            }
            const rowData = {
                _unitId: unitIdData
            }
            return {
                rowId: id,
                data: rowData,
                checkboxFn: checkboxClickHandlerGenerator(id)
            }
        })
    ), [unitIds, sortingCuration, checkboxClickHandlerGenerator])

    useEffect(() => {
        unitIdSelectionDispatch({ type: INITIALIZE_UNITS, newUnitOrder: rows.map(r => r.rowId).sort((a, b) => idToNum(a) - idToNum(b)) })
    }, [rows, unitIdSelectionDispatch])

    const rowMap = useMemo(() => {
        const draft = new Map<number | string, SortableTableWidgetRow>()
        rows.forEach(r => draft.set(r.rowId, r))
        return draft
    }, [rows])

    return (
        <SortableTableWidget
            selectedUnitIds={selectedUnitIds}
            selectionDispatch={unitIdSelectionDispatch}
            columns={columns}
            rows={rowMap}
            orderedUnitIds={orderedUnitIds}
            visibleUnitIds={visibleUnitIds}
            selectionDisabled={selectionDisabled}
            primarySortRule={primarySortRule}
        />
    )
}

export default SelectUnitsWidget