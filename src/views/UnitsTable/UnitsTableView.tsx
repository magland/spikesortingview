import { checkboxDispatchCurry, checkboxRowIdCurry, useSelectedUnitIds } from 'contexts/RowSelectionContext';
import { SortingCuration, useSortingCuration } from 'contexts/SortingCurationContext';
import React, { FunctionComponent, useMemo } from 'react';
import colorForUnitId from 'views/common/colorForUnitId';
import SortableTableWidget, { SortableTableWidgetColumn } from './SortableTableWidget/SortableTableWidget';
import { UnitsTableViewData } from './UnitsTableViewData';

type Props = {
    data: UnitsTableViewData
    width: number
    height: number
}

const UnitsTableView: FunctionComponent<Props> = ({data, width, height}) => {
    const {selectedUnitIds, unitIdSelectionDispatch} = useSelectedUnitIds()
    const selectedRowKeys = useMemo(() => (selectedUnitIds.map(u => (`${u}`))), [selectedUnitIds])
    const wrappedDispatch = useMemo(() => checkboxDispatchCurry(unitIdSelectionDispatch), [unitIdSelectionDispatch])
    // const setSelectedRowKeys = useCallback((keys: string[]) => {
    //     setSelectedUnitIds(keys.map(k => (Number(k))))
    // }, [setSelectedUnitIds])
    const {sortingCuration} = useSortingCuration()
    
    const columns = useMemo(() => {
        const ret: SortableTableWidgetColumn[] = []
        ret.push({
            columnName: '_unitId',
            label: 'Unit',
            tooltip: 'Unit ID',
            sort: (a: any, b: any) => (a - b),
            dataElement: (d: any) => (
                <span>
                    <div style={{backgroundColor: colorForUnitId(d.unitId), width: 10, height: 10, position: 'relative', display: 'inline-block'}} />
                    &nbsp;{`${d.unitId}`}
                    {
                        ((d.mergeGroup) && (d.mergeGroup.length > 0)) && (
                            <span key="mergeGroup">{` (${d.mergeGroup.map((id: number) => (`${id}`)).join(", ")})`}</span>
                        )
                    }
                </span>
            ),
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
        data.columns.forEach(c => {
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
        data.rows.sort((r1, r2) => (r1.unitId - r2.unitId)).map(r => {
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
                data: rowData,
                checkboxFn: checkboxRowIdCurry(r.unitId, wrappedDispatch)
            }
        })
    ), [data.rows, data.columns, sortingCuration, wrappedDispatch])

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
                rows={rows}
                selectedRowIds={selectedRowKeys}
                onSelectedRowIdsChanged={setSelectedRowKeys}
                defaultSortColumnName="unitId"
            />
        </div>
    )
}

const mergeGroupForUnitId = (unitId: number, curation?: SortingCuration | undefined) => {
    const mergeGroups = (curation || {}).mergeGroups || []
    return mergeGroups.filter(g => (g.includes(unitId)))[0] || null
}

export default UnitsTableView