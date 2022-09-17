import { Checkbox } from "@material-ui/core";
import { SortingCuration, useSortingCuration } from "@figurl/spike-sorting-views";
import { useSelectedUnitIds } from "@figurl/spike-sorting-views";
import { FunctionComponent, useCallback, useMemo } from "react";
import { SortingCuration2ViewData } from "./SortingCuration2ViewData";

type Props = {
    data: SortingCuration2ViewData
    width: number
    height: number
}

const standardLabelChoices = ['accept', 'reject', 'noise', 'artifact', 'mua']

const SortingCuration2View: FunctionComponent<Props> = ({width, height}) => {
    const {sortingCuration, sortingCurationDispatch} = useSortingCuration()
    const {selectedUnitIds: selectedUnitIdsSet, orderedUnitIds} = useSelectedUnitIds()
    const selectedUnitIds = useMemo(() => (
        orderedUnitIds.filter(x => (selectedUnitIdsSet && selectedUnitIdsSet.has(x))
    )), [selectedUnitIdsSet, orderedUnitIds])
    const labelChoices = useMemo(() => (
        getAllLabelChoices(sortingCuration)
    ), [sortingCuration])
    const labelCheckboxStates = useMemo(() => (
        getLabelCheckboxStates(labelChoices, sortingCuration, selectedUnitIds, sortingCurationDispatch === undefined)
    ), [labelChoices, sortingCuration, selectedUnitIds, sortingCurationDispatch])
    const handleClick = useCallback((label: string, cbState: 'checked' | 'unchecked' | 'indeterminant' | 'disabled') => {
        if (sortingCurationDispatch) {
            if ((cbState === 'unchecked') || (cbState === 'indeterminant')) {
                sortingCurationDispatch({
                    type: 'ADD_UNIT_LABEL',
                    unitId: selectedUnitIds,
                    label
                })
            }
            else if (cbState === 'checked') {
                sortingCurationDispatch({
                    type: 'REMOVE_UNIT_LABEL',
                    unitId: selectedUnitIds,
                    label
                })
            }
        }
    }, [selectedUnitIds, sortingCurationDispatch])
    // const {updateUrlState} = useUrlState()
    // const handleSaveSelection = useCallback(() => {
    //     ;(async () => {
    //         const curationUri = await storeFileData(stringifyDeterministicWithSortedKeys(sortingCuration || {}))
    //         updateUrlState({
    //             curation: curationUri
    //         })
    //     })()
    // }, [sortingCuration, updateUrlState])
    return (
        <div style={{position: 'absolute', width, height, overflowY: 'auto'}}>
            <h3>Curation</h3>
            <div>
                Selected units:&nbsp;{getAbbreviatedUnitIdsString(selectedUnitIds, 25)}
            </div>
            <div>
                {
                    labelChoices.map(label => (
                        <span key={label}>
                            <Checkbox
                                checked={['checked', 'indeterminant'].includes(labelCheckboxStates[label])}
                                indeterminate={['indeterminant'].includes(labelCheckboxStates[label])}
                                disabled={['disabled'].includes(labelCheckboxStates[label])}
                                onClick={() => {handleClick(label, labelCheckboxStates[label])}}
                                style={{
                                    ...(labelCheckboxStates[label] === 'indeterminant' ? {color: 'gray'}
                                        : {}),
                                    paddingRight: 3,
                                    paddingLeft: 3,
                                }}
                            />
                            <span style={{paddingRight: 7}}>
                                {label}
                            </span>
                        </span>
                    ))
                }
            </div>
            <hr />
            {/* hide this button for now */}
            {/* <div>
                <Button onClick={handleSaveSelection}>Save curation</Button>
            </div> */}
        </div>
    )
}

const getLabelCheckboxStates = (labelChoices: string[], sortingCuration: SortingCuration | undefined, selectedUnitIds: (string | number)[], disabled: boolean) => {
    const ret: {[label: string]: 'checked' | 'unchecked' | 'indeterminant' | 'disabled'} = {}
    for (let label of labelChoices) {
        const idsWithLabel = selectedUnitIds.filter(id => (sortingCuration && ((sortingCuration.labelsByUnit || {})[id] || []).includes(label)))
        ret[label] = disabled ? 'disabled' :
            selectedUnitIds.length === 0 ? 'disabled' :
            idsWithLabel.length === 0 ? 'unchecked' :
            idsWithLabel.length === selectedUnitIds.length ? 'checked' :
            'indeterminant'
    }
    return ret
}

export const getAllLabelChoices = (curation: SortingCuration | undefined) => {
    const ret = [...standardLabelChoices]
    if (curation !== undefined) {
        for (let a of Object.values(curation.labelsByUnit || {})) {
            for (let label of a) {
                if (!ret.includes(label)) ret.push(label)
            }
        }
    }
    return ret
}

export const getAbbreviatedUnitIdsString = (unitIds: (string | number)[], maxLength: number) => {
    let ret: string = ''
    for (let id of unitIds) {
        if (ret.length > maxLength - 3) {
            ret = ret + '...'
            break
        }
        ret = ret + id + ' '
    }
    return ret
}

export default SortingCuration2View