import { validateObject } from "libraries/util-validate-object"
import { isEqualTo, isString } from "libraries/util-validate-object"

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