import NiceTable from 'components/NiceTable/NiceTable'
import React, { FunctionComponent, useCallback, useMemo } from 'react'
import colorForUnitId from 'views/common/colorForUnitId'

type Props = {
    unitIds: number[]
    selectedUnitIds: number[]
    setSelectedUnitIds: (x: number[]) => void
    selectionDisabled?: boolean
}

const SelectUnitsWidget: FunctionComponent<Props> = ({ unitIds, selectedUnitIds, setSelectedUnitIds, selectionDisabled }) => {
    const columns = useMemo(() => ([
        {
            key: 'unitId',
            label: 'Unit'
        }
    ]), [])
    const rows = useMemo(() => (
        unitIds.sort((u1, u2) => (u1 - u2)).map(unitId => (
            {
                key: `${unitId}`,
                columnValues: {
                    unitId: {
                        text: `${unitId}`,
                        element: <span><div style={{backgroundColor: colorForUnitId(unitId), width: 10, height: 10, position: 'relative', display: 'inline-block'}} /> {`${unitId}`}</span>
                    }
                }
            }
        ))
    ), [unitIds])
    const selectedRowKeys = useMemo(() => (
        selectedUnitIds.map(unitId => (`${unitId}`))
    ), [selectedUnitIds])
    const handleSelectedRowKeysChanged = useCallback((keys: string[]) => {
        setSelectedUnitIds(keys.map(k => (Number(k))))
    }, [setSelectedUnitIds])
    return (
        <NiceTable
            columns={columns}
            rows={rows}
            selectionMode="multiple"
            selectedRowKeys={selectedRowKeys}
            onSelectedRowKeysChanged={handleSelectedRowKeysChanged}
            selectionDisabled={selectionDisabled}
        />
    )
}

export default SelectUnitsWidget