import { INITIALIZE_ROWS, RowSelectionAction } from 'contexts/RowSelection/RowSelectionContext';
import { SortingRule } from 'contexts/RowSelection/RowSelectionTypes';
import { useSortingCuration } from 'contexts/SortingCurationContext';
import React, { FunctionComponent, useEffect, useMemo } from 'react';
import { idToNum } from 'views/AverageWaveforms/AverageWaveformsView';
import ColorPatchUnitIdLabel, { ColorPatchUnitLabelProps, mergeGroupForUnitId } from 'views/common/SortableTableWidget/ColorPatchUnitIdLabel';
import SortableTableWidget from 'views/common/SortableTableWidget/SortableTableWidget';
import { SortableTableWidgetRow } from 'views/common/SortableTableWidget/SortableTableWidgetTypes';


export type SelectUnitsWidgetProps = {
    unitIds: (number | string)[]
    selectedUnitIds: Set<number | string>,
    orderedRowIds: (number | string)[],
    visibleRowIds?: (number | string)[],
    primarySortRule?: SortingRule,
    unitIdSelectionDispatch: (action: RowSelectionAction) => void,
    checkboxClickHandlerGenerator: (rowId: number | string) => (evt: React.MouseEvent) => void
    selectionDisabled?: boolean
}

const SelectUnitsWidget: FunctionComponent<SelectUnitsWidgetProps> = (props: SelectUnitsWidgetProps) => {
    const { unitIds, orderedRowIds, visibleRowIds, selectedUnitIds, primarySortRule, checkboxClickHandlerGenerator, unitIdSelectionDispatch, selectionDisabled }  = props
    const {sortingCuration} = useSortingCuration()

    const columns = useMemo(() => ([
        {
            columnName: '_unitId',
            label: 'Unit',
            tooltip: 'Unit ID',
            sort: (a: any, b: any) => (a - b),
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
        unitIdSelectionDispatch({ type: INITIALIZE_ROWS, newRowOrder: rows.map(r => r.rowId).sort((a, b) => idToNum(a) - idToNum(b)) })
    }, [rows, unitIdSelectionDispatch])

    const rowMap = useMemo(() => {
        const draft = new Map<number | string, SortableTableWidgetRow>()
        rows.forEach(r => draft.set(r.rowId, r))
        return draft
    }, [rows])

    return (
        <SortableTableWidget
            selectedRowIds={selectedUnitIds}
            selectionDispatch={unitIdSelectionDispatch}
            columns={columns}
            rows={rowMap}
            orderedRowIds={orderedRowIds}
            visibleRowIds={visibleRowIds}
            selectionDisabled={selectionDisabled}
            primarySortRule={primarySortRule}
        />
    )
}

export default SelectUnitsWidget