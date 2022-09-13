import { validateObject } from "libraries/util-validate-object"
import { isEqualTo } from "libraries/util-validate-object"

export type SortingSelectionViewData = {
    type: 'SortingSelection'
}

export const isSortingSelectionViewData = (x: any): x is SortingSelectionViewData => {
    return validateObject(x, {
        type: isEqualTo('SortingSelection')
    })
}