import { validateObject } from "figurl"
import { isEqualTo } from "figurl/viewInterface/validateObject"

export type SortingSelectionViewData = {
    type: 'SortingSelection'
}

export const isSortingSelectionViewData = (x: any): x is SortingSelectionViewData => {
    return validateObject(x, {
        type: isEqualTo('SortingSelection')
    })
}