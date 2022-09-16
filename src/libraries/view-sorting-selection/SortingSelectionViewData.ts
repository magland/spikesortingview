import { validateObject } from "@figurl/core-utils"
import { isEqualTo } from "@figurl/core-utils"

export type SortingSelectionViewData = {
    type: 'SortingSelection'
}

export const isSortingSelectionViewData = (x: any): x is SortingSelectionViewData => {
    return validateObject(x, {
        type: isEqualTo('SortingSelection')
    })
}