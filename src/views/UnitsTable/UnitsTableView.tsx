import NiceTable from 'components/NiceTable/NiceTable';
import { useSelectedUnitIds } from 'contexts/SortingSelectionContext';
import React, { FunctionComponent, useCallback, useMemo } from 'react';
import { UnitsTableViewData } from './UnitsTableViewData';

type Props = {
    data: UnitsTableViewData
    width: number
    height: number
}

const RasterPlotView: FunctionComponent<Props> = ({data, width, height}) => {
    const {selectedUnitIds, setSelectedUnitIds} = useSelectedUnitIds()
    const selectedRowKeys = useMemo(() => (selectedUnitIds.map(u => (`${u}`))), [selectedUnitIds])
    const setSelectedRowKeys = useCallback((keys: string[]) => {
        setSelectedUnitIds(keys.map(k => (Number(k))))
    }, [setSelectedUnitIds])
    
    const columns = useMemo(() => (
        data.columns.map(c => ({
            key: c.key,
            label: c.label
        }))
    ), [data.columns])

    const rows = useMemo(() => (
        data.rows.map(r => {
            const columnValues: {[key: string]: any} = {}
            for (let c of data.columns) {
                columnValues[c.key] = `${r.values[c.key] || ''}`
            }
            return {
                key: `${r.unitId}`,
                columnValues
            }
        })
    ), [data.rows, data.columns])

    return (
        <NiceTable
            columns={columns}
            rows={rows}
            selectedRowKeys={selectedRowKeys}
            onSelectedRowKeysChanged={setSelectedRowKeys}
            selectionMode="multiple"
        />
    )
}

export default RasterPlotView