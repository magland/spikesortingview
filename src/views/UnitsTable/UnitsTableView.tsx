import { useSelectedUnitIds } from 'contexts/SortingSelectionContext';
import React, { FunctionComponent, useCallback, useMemo } from 'react';
import SortableTableWidget from './SortableTableWidget/SortableTableWidget';
import { UnitsTableViewData } from './UnitsTableViewData';

type Props = {
    data: UnitsTableViewData
    width: number
    height: number
}

const UnitsTableView: FunctionComponent<Props> = ({data, width, height}) => {
    const {selectedUnitIds, setSelectedUnitIds} = useSelectedUnitIds()
    const selectedRowKeys = useMemo(() => (selectedUnitIds.map(u => (`${u}`))), [selectedUnitIds])
    const setSelectedRowKeys = useCallback((keys: string[]) => {
        setSelectedUnitIds(keys.map(k => (Number(k))))
    }, [setSelectedUnitIds])
    
    const columns = useMemo(() => (
        data.columns.map(c => ({
            columnName: c.key,
            label: c.label,
            tooltip: c.label,
            sort: (a: any, b: any) => (a - b),
            dataElement: (d: any) => <span>{d}</span>,
            calculating: false
        }))
    ), [data.columns])

    const rows = useMemo(() => (
        data.rows.sort((r1, r2) => (r1.unitId - r2.unitId)).map(r => {
            const rowData: {[key: string]: any} = {}
            for (let c of data.columns) {
                const text = `${r.values[c.key] !== undefined ? r.values[c.key] : ''}`
                // if (c.key === 'unitId') {
                //     rowData[c.key] = {
                //         text,
                //         element: <span><div style={{backgroundColor: colorForUnitId(r.unitId), width: 10, height: 10, position: 'relative', display: 'inline-block'}} /> {text}</span>
                //     }
                // }
                // else {
                //     rowData[c.key] = text
                // }
                rowData[c.key] = {
                    value: text,
                    sortValue: r.values[c.key]
                }
            }
            return {
                rowId: `${r.unitId}`,
                data: rowData
            }
        })
    ), [data.rows, data.columns])

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

export default UnitsTableView