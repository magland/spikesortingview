import { FormControlLabel, FormGroup, Typography } from '@material-ui/core';
import Switch from '@material-ui/core/Switch';
import { RowSelectionAction } from 'contexts/RowSelectionContext';
import React, { Fragment, FunctionComponent } from 'react';
import SelectUnitsWidget from './SelectUnitsWidget';

type Props = {
    unitIds: number[]
    selectedUnitIds: Set<number>
    unitIdSelectionDispatch: (action: RowSelectionAction) => void
    locked: boolean
    toggleLockStateCallback: () => void
}

const LockableSelectUnitsWidget: FunctionComponent<Props> = ({ unitIds, selectedUnitIds, unitIdSelectionDispatch, locked, toggleLockStateCallback }) => {
    return (
        <Fragment>
            <FormGroup className={"lock-switch"}>
                <FormControlLabel
                    control={ <Switch checked={locked} size={"small"} onChange={() => toggleLockStateCallback()} /> }
                    label={<Typography variant="caption">Lock selection</Typography>}
                />
            </FormGroup>
            <SelectUnitsWidget unitIds={unitIds} selectedUnitIds={selectedUnitIds} unitIdSelectionDispatch={unitIdSelectionDispatch} selectionDisabled={locked} />
        </Fragment>
    )
}

export default LockableSelectUnitsWidget