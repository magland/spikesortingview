import { validateObject } from "@figurl/core-utils"
import { isEqualTo } from "@figurl/core-utils"

export type SortingCurationViewData = {
    type: 'SortingCuration'
}

export const isSortingCurationViewData = (x: any): x is SortingCurationViewData => {
    return validateObject(x, {
        type: isEqualTo('SortingCuration')
    })
}