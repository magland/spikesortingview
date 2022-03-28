import NiceTable from 'components/NiceTable/NiceTable'
import { RowSelectionAction, SET_SELECTION } from 'contexts/RowSelectionContext'
import React, { FunctionComponent, useCallback, useMemo } from 'react'
import colorForUnitId from 'views/common/colorForUnitId'

type Props = {
    unitIds: number[]
    selectedUnitIds: Set<number>
    unitIdSelectionDispatch: (action: RowSelectionAction) => void
    selectionDisabled?: boolean
}

// TODO: Make this honor RowSelectionContext ordering & provide access to richer row-selection features?
const SelectUnitsWidget: FunctionComponent<Props> = ({ unitIds, selectedUnitIds, unitIdSelectionDispatch, selectionDisabled }) => {
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
    // TODO: Make this conform with the new system
    const selectedRowKeys = useMemo(() => (
        [...selectedUnitIds].map(unitId => (`${unitId}`))
    ), [selectedUnitIds])
    const handleSelectedRowKeysChanged = useCallback((keys: string[]) => {
        unitIdSelectionDispatch({type: SET_SELECTION, incomingSelectedRowIds: keys.map(k => (Number(k)))})
    }, [unitIdSelectionDispatch])
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