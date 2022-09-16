import { validateObject } from "@figurl/spikesortingview.core-utils"
import { isEqualTo, isString } from "@figurl/spikesortingview.core-utils"

export type SortingCuration2ViewData = {
    type: 'SortingCuration2'
    sortingId: string
}

export const isSortingCuration2ViewData = (x: any): x is SortingCuration2ViewData => {
    return validateObject(x, {
        type: isEqualTo('SortingCuration2'),
        sortingId: isString
    })
}