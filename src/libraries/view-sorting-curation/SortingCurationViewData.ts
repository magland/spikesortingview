import { validateObject } from "@figurl/spikesortingview.core-utils"
import { isEqualTo } from "@figurl/spikesortingview.core-utils"

export type SortingCurationViewData = {
    type: 'SortingCuration'
}

export const isSortingCurationViewData = (x: any): x is SortingCurationViewData => {
    return validateObject(x, {
        type: isEqualTo('SortingCuration')
    })
}