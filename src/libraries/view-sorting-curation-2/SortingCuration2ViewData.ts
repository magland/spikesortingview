import { validateObject } from "@figurl/core-utils"
import { isEqualTo, isString } from "@figurl/core-utils"

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