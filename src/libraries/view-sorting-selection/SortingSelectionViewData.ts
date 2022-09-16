import { validateObject } from "@figurl/spikesortingview.core-utils"
import { isEqualTo } from "@figurl/spikesortingview.core-utils"

export type SortingSelectionViewData = {
    type: 'SortingSelection'
}

export const isSortingSelectionViewData = (x: any): x is SortingSelectionViewData => {
    return validateObject(x, {
        type: isEqualTo('SortingSelection')
    })
}