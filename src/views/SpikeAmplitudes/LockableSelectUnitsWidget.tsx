import { FormControlLabel, FormGroup, Typography } from '@material-ui/core';
import Switch from '@material-ui/core/Switch';
import React, { Fragment, FunctionComponent } from 'react';
import SelectUnitsWidget from './SelectUnitsWidget';

type Props = {
    unitIds: number[]
    selectedUnitIds: number[]
    setSelectedUnitIds: (x: number[]) => void
    locked: boolean
    toggleLockStateCallback: () => void
}

const LockableSelectUnitsWidget: FunctionComponent<Props> = ({ unitIds, selectedUnitIds, setSelectedUnitIds, locked, toggleLockStateCallback }) => {
    return (
        <Fragment>
            <FormGroup className={"lock-switch"}>
                <FormControlLabel
                    control={ <Switch checked={locked} size={"small"} onChange={() => toggleLockStateCallback()} /> }
                    label={<Typography variant="caption">Lock selection</Typography>}
                />
            </FormGroup>
            <SelectUnitsWidget unitIds={unitIds} selectedUnitIds={selectedUnitIds} setSelectedUnitIds={setSelectedUnitIds} selectionDisabled={locked} />
        </Fragment>
    )
}

export default LockableSelectUnitsWidget