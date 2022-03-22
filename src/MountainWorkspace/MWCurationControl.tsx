import { Grid, Paper } from '@material-ui/core';
import { useSelectedUnitIds } from 'contexts/RowSelectionContext';
import { SortingCuration, useSortingCuration } from 'contexts/SortingCurationContext';
import React, { FunctionComponent, useCallback } from 'react';
import sizeMe, { SizeMeProps } from 'react-sizeme';

type Props = {
}

// const buttonStyle = {
//     paddingTop: 3, paddingBottom: 3, border: 1, borderStyle: 'solid', borderColor: 'gray'
// }

const buttonStyle = {}

const MWCurationControl: FunctionComponent<Props & SizeMeProps> = ({ size }) => {
    const {sortingCuration, sortingCurationDispatch} = useSortingCuration()
    const {selectedUnitIds, setSelectedUnitIds} = useSelectedUnitIds()

    const width = size.width || 300
    const _handleApplyLabel = useCallback(
        (label: string) => {
            if (!sortingCurationDispatch) return
            sortingCurationDispatch({
                type: 'ADD_UNIT_LABEL',
                unitId: selectedUnitIds,
                label
            })
        },
        [sortingCurationDispatch, selectedUnitIds],
    )

    const _handleRemoveLabel = useCallback(
        (label: string) => {
            if (!sortingCurationDispatch) return
            sortingCurationDispatch({
                type: 'REMOVE_UNIT_LABEL',
                unitId: selectedUnitIds,
                label
            })
        },
        [sortingCurationDispatch, selectedUnitIds]
    )

    const handleMergeSelected = useCallback(() => {
        if (!sortingCurationDispatch) return
        sortingCurationDispatch({
            type: 'MERGE_UNITS',
            unitIds: selectedUnitIds
        })
        setSelectedUnitIds([])
    }, [sortingCurationDispatch, selectedUnitIds, setSelectedUnitIds])

    const handleUnmergeSelected = useCallback(() => {
        if (!sortingCurationDispatch) return
        sortingCurationDispatch({
            type: 'UNMERGE_UNITS',
            unitIds: selectedUnitIds
        })
        setSelectedUnitIds([])
    }, [sortingCurationDispatch, selectedUnitIds, setSelectedUnitIds])

    // const handleToggleCurationClosed = useCallback(() => {
    //     if (!sortingCuration) return
    //     const type = sortingCuration?.isClosed ? 'REOPEN_CURATION' : 'CLOSE_CURATION'
    //     sortingCurationDispatch({
    //         type: type
    //     })
    // }, [sortingCuration?.isClosed, sortingCurationDispatch])

    type LabelRecord = {
        label: string,
        partial: boolean
    }

    if (!sortingCuration) return <div>No sorting curation</div>
    if (!sortingCurationDispatch) return <div>Not authorized to curate this sorting</div>

    const labelCounts: {[key: string]: number} = {}
    for (const uid of selectedUnitIds) {
        const labels = (sortingCuration.labelsByUnit || {})[uid + ''] || []
        for (const label of labels) {
            let c = labelCounts[label] || 0
            c ++
            labelCounts[label] = c
        }
    }
    const labels = Object.keys(labelCounts).sort()
    const labelRecords: LabelRecord[] = labels.map(label => ({
        label,
        partial: labelCounts[label] < selectedUnitIds.length ? true : false
    }))
    const paperStyle: React.CSSProperties = {
        marginTop: 25,
        marginBottom: 25,
        backgroundColor: '#f9f9ff'
    }
    const enableApply = selectedUnitIds.length > 0
    const standardChoices = ['accept', 'reject', 'noise', 'artifact', 'mua']
    const labelChoices = [...standardChoices, ...(sortingCuration.labelChoices || []).filter(l => (!standardChoices.includes(l)))]
    return (
        <div style={{width, position: 'relative'}}>
            <Paper style={paperStyle} key="selected">
                Selected units: {selectedUnitIds.join(', ')}
            </Paper>
            <Paper style={paperStyle} key="labels">
                Labels (click to remove):
                <Grid container style={{flexFlow: 'wrap'}} spacing={0}>
                    {
                        labelRecords.map(r => (
                            <Grid item key={r.label}>
                                <Label
                                    label={r.label}
                                    partial={r.partial}
                                    onClick={() => {r.partial ? _handleApplyLabel(r.label) : _handleRemoveLabel(r.label)}}
                                    disabled={sortingCuration.isClosed}
                                />
                            </Grid>
                        ))
                    }
                </Grid>
            </Paper>
            <Paper style={paperStyle} key="apply">
                Apply labels:
                <Grid container style={{flexFlow: 'wrap'}} spacing={0}>
                    {
                        labelChoices.map(labelChoice => (
                            <Grid item key={labelChoice}>
                                {
                                    (((labelCounts[labelChoice] || 0) < selectedUnitIds.length) || (!enableApply)) ? (
                                        <button
                                            style={buttonStyle}
                                            disabled={!enableApply || (sortingCuration.isClosed)}
                                            onClick={() => {_handleApplyLabel(labelChoice)}}
                                        >
                                            {labelChoice}
                                        </button>
                                    ): <span />
                                }
                            </Grid>
                        ))
                    }
                </Grid>
            </Paper>

            <Paper style={paperStyle} key="merge">                
                Merge:
                {
                    (selectedUnitIds.length >= 2 && !unitsAreInMergeGroups(selectedUnitIds, sortingCuration)) &&
                        <button key="merge" onClick={handleMergeSelected} disabled={sortingCuration.isClosed}>
                            Merge selected units: {selectedUnitIds.join(', ')}
                        </button>
                }
                {
                    (selectedUnitIds.length > 0 && unitsAreInMergeGroups(selectedUnitIds, sortingCuration)) &&
                        <button key="unmerge" onClick={handleUnmergeSelected} disabled={sortingCuration.isClosed}>
                            Unmerge units: {selectedUnitIds.join(', ')}
                        </button>
                }
            </Paper>

            {/* disabling the curation complete button for now */}
            {/* <Button
                color={ sortingCuration.isClosed ? "primary" : "secondary" }
                variant={"contained"}
                onClick={() => {handleToggleCurationClosed()}}>
                { sortingCuration.isClosed ? 'Re-open curation' : 'Curation complete' }
            </Button> */}
        </div>
    )
}

const unitsAreInMergeGroups = (unitIds: number[], sortingCuration: SortingCuration) => {
    const mg = sortingCuration.mergeGroups || []
    const all = mg.reduce((prev, g) => [...prev, ...g], []) // all units in merge groups
    for (let unitId of unitIds) {
        if (!all.includes(unitId)) return false
    }
    return true
}

const Label: FunctionComponent<{label: string, partial: boolean, onClick: () => void, disabled?: boolean}> = ({label, partial, onClick, disabled}) => {
    const color = (disabled) ? '' : (partial) ? 'gray': 'black'
    return (
        <button style={{...buttonStyle, color}} disabled={disabled} onClick={onClick}>{label}</button>
    )
}

export default sizeMe()(MWCurationControl)