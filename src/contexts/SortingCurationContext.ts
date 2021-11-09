import React, { useContext } from "react"
import SortingCurationAction from "./SortingCurationAction"

export type SortingCuration = {
    labelsByUnit?: {[key: string]: string[]}
    labelChoices?: string[]
    mergeGroups?: (number[])[]
    isClosed?: boolean
}

export const sortingCurationReducer = (state: SortingCuration, action: SortingCurationAction): SortingCuration => {
    // disable state changes for a closed curation
    if (action.type !== 'REOPEN_CURATION' && state.isClosed) {
        console.log(`WARNING: Attempt to curate a closed sorting curation:\n\tAction: ${action.type}`)
        return state
    }

    if (action.type === 'SET_CURATION') {
        return action.curation
    }
    else if (action.type === 'CLOSE_CURATION') {
        return { ...state, isClosed: true }
    }
    else if (action.type === 'REOPEN_CURATION') {
        return { ...state, isClosed: false }
    }
    else if (action.type === 'ADD_UNIT_LABEL') {
        const uids: number[] = typeof(action.unitId) === 'object' ? action.unitId : [action.unitId]
        const newLabelsByUnit = {...(state.labelsByUnit || {})}
        let somethingChanged = false
        for (let uid of uids) {
            const labels = newLabelsByUnit[uid + ''] || []
            if (!labels.includes(action.label)) {
                somethingChanged = true
                newLabelsByUnit[uid + ''] = [...labels, action.label].sort()
            }
        }
        if (somethingChanged) {
            return {
                ...state,
                labelsByUnit: newLabelsByUnit
            }
        }
        else return state
    }
    else if (action.type === 'REMOVE_UNIT_LABEL') {
        const uids: number[] = typeof(action.unitId) === 'object' ? action.unitId : [action.unitId]
        const newLabelsByUnit = {...(state.labelsByUnit || {})}
        let somethingChanged = false
        for (let uid of uids) {
            const labels = newLabelsByUnit[uid + ''] || []
            if (labels.includes(action.label)) {
                somethingChanged = true
                newLabelsByUnit[uid + ''] = labels.filter(l => (l !== action.label))
            }
        }
        if (somethingChanged) {
            return {
                ...state,
                labelsByUnit: newLabelsByUnit
            }
        }
        else return state
    }
    else if (action.type === 'MERGE_UNITS') {
        return {
            ...state,
            mergeGroups: simplifyMergeGroups([...(state.mergeGroups || []), action.unitIds])
        }
    }
    else if (action.type === 'UNMERGE_UNITS') {
        return {
            ...state,
            mergeGroups: simplifyMergeGroups((state.mergeGroups || []).map(g => (g.filter(x => (!action.unitIds.includes(x))))))
        }
    }
    else return state
}

const SortingCurationContext = React.createContext<{
    sortingCuration?: SortingCuration,
    sortingCurationDispatch?: (action: SortingCurationAction) => void
}>({})

export const useSortingCuration = () => {
    const c = useContext(SortingCurationContext)
    return c
}

const intersection = (a: number[], b: number[]) => (
    a.filter(x => (b.includes(x)))
)
const union = (a: number[], b: number[]) => (
    [...a, ...b.filter(x => (!a.includes(x)))].sort()
)

const simplifyMergeGroups = (mg: (number[])[]): (number[])[] => {
    const newMergeGroups = mg.map(g => [...g]) // make a copy
    let somethingChanged = true
    while (somethingChanged) {
        somethingChanged = false
        for (let i = 0; i < newMergeGroups.length; i ++) {
            const g1 = newMergeGroups[i]
            for (let j = i + 1; j < newMergeGroups.length; j ++) {
                const g2 = newMergeGroups[j]
                if (intersection(g1, g2).length > 0) {
                    newMergeGroups[i] = union(g1, g2)
                    newMergeGroups[j] = []
                    somethingChanged = true
                }
            }
        }
    }
    return newMergeGroups.filter(g => (g.length >= 2))
}

export default SortingCurationContext