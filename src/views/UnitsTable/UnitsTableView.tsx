import { INITIALIZE_ROWS, useSelectedUnitIds } from 'contexts/RowSelectionContext';
import { useSortingCuration } from 'contexts/SortingCurationContext';
import React, { FunctionComponent, useEffect, useMemo } from 'react';
import { SortableTableWidgetColumn, SortableTableWidgetRow } from 'views/common/SortableTableWidget/SortableTableWidgetTypes';
import ColorPatchUnitIdLabel, { ColorPatchUnitLabelProps, mergeGroupForUnitId } from '../common/SortableTableWidget/ColorPatchUnitIdLabel';
import SortableTableWidget from '../common/SortableTableWidget/SortableTableWidget';
import { UnitsTableViewData } from './UnitsTableViewData';

type Props = {
    data: UnitsTableViewData
    width: number
    height: number
}

const UnitsTableView: FunctionComponent<Props> = ({data, width, height}) => {
    const {selectedUnitIds, orderedRowIds, visibleRowIds, primarySortRule, checkboxClickHandlerGenerator, unitIdSelectionDispatch} = useSelectedUnitIds()
    const {sortingCuration} = useSortingCuration()

    const columns = useMemo(() => {
        const ret: SortableTableWidgetColumn[] = []
        ret.push({
            columnName: '_unitId',
            label: 'Unit',
            tooltip: 'Unit ID',
            sort: (a: any, b: any) => (a - b),
            dataElement: (d: ColorPatchUnitLabelProps ) => (<ColorPatchUnitIdLabel unitId={d.unitId} mergeGroup={d.mergeGroup} />),
            calculating: false
        })
        if (sortingCuration) {
            ret.push({
                columnName: '_labels',
                label: 'Labels',
                tooltip: 'Curation labels',
                sort: (a: any, b: any) => (a < b ? -1 : a > b ? 1 : 0),
                dataElement: (d: any) => (<span>{d.join(', ')}</span>),
                calculating: false
            })
        }
        // The filter is rather hacky
        data.columns.filter(c => c.key !== 'unitId').forEach(c => {
            ret.push({
                columnName: c.key,
                label: c.label,
                tooltip: c.label,
                sort: (a: any, b: any) => (a - b),
                dataElement: (d: any) => <span>{d}</span>,
                calculating: false
            })
        })
        return ret
    }, [data.columns, sortingCuration])

    const rows = useMemo(() => (
        data.rows.map(r => {
            const curationLabels = ((sortingCuration?.labelsByUnit || {})[`${r.unitId}`] || [])
            const unitIdData = {
                value: {unitId: r.unitId, mergeGroup: mergeGroupForUnitId(r.unitId, sortingCuration)},
                sortValue: r.unitId
            }
            const rowData: {[key: string]: any} = {
                _unitId: unitIdData,
                _labels: {
                    value: curationLabels,
                    sortValue: curationLabels.join(', ')
                }
            }
            for (let c of data.columns) {
                const text = `${r.values[c.key] !== undefined ? r.values[c.key] : ''}`
                rowData[c.key] = {
                    value: text,
                    sortValue: r.values[c.key]
                }
            }
            return {
                rowId: `${r.unitId}`,
                rowIdNumeric: r.unitId,
                data: rowData,
                checkboxFn: checkboxClickHandlerGenerator(r.unitId)
            }
        })
    ), [data.rows, data.columns, sortingCuration, checkboxClickHandlerGenerator])

    useEffect(() => {
        unitIdSelectionDispatch({ type: INITIALIZE_ROWS, newRowOrder: rows.map(r => r.rowIdNumeric).sort((a, b) => a - b) })
    }, [rows, unitIdSelectionDispatch])

    const rowMap = useMemo(() => {
        const draft = new Map<number, SortableTableWidgetRow>()
        rows.forEach(r => draft.set(r.rowIdNumeric, r))
        return draft
    }, [rows])

    const divStyle: React.CSSProperties = useMemo(() => ({
        width: width - 20, // leave room for the scrollbar
        height,
        position: 'relative',
        overflowY: 'auto'
    }), [width, height])

    return (
        <div style={divStyle}>
            <SortableTableWidget
                columns={columns}
                rows={rowMap}
                orderedRowIds={orderedRowIds}
                visibleRowIds={visibleRowIds}
                selectedRowIds={selectedUnitIds}
                selectionDispatch={unitIdSelectionDispatch}
                primarySortRule={primarySortRule}
            />
        </div>
    )
}

export default UnitsTableView