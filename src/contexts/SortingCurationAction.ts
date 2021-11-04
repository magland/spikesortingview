import { SortingCuration } from "./SortingCurationContext"

export interface AddUnitLabelCurationAction {
    type: 'ADD_UNIT_LABEL'
    unitId: number | number[]
    label: string
}

export interface RemoveUnitLabelCurationAction {
    type: 'REMOVE_UNIT_LABEL'
    unitId: number | number[]
    label: string
}

export interface MergeUnitsCurationAction {
    type: 'MERGE_UNITS'
    unitIds: number[]
}

export interface UnmergeUnitsCurationAction {
    type: 'UNMERGE_UNITS'
    unitIds: number[]
}

export interface SetCurationCurationAction {
    type: 'SET_CURATION'
    curation: SortingCuration
}

export interface CloseCurationCurationAction {
    type: 'CLOSE_CURATION'
}

export interface ReopenCurationCurationAction {
    type: 'REOPEN_CURATION'
}

type SortingCurationAction = AddUnitLabelCurationAction | RemoveUnitLabelCurationAction | MergeUnitsCurationAction | UnmergeUnitsCurationAction | SetCurationCurationAction | CloseCurationCurationAction | ReopenCurationCurationAction

export default SortingCurationAction