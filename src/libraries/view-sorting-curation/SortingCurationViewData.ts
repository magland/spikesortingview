import { validateObject } from "libraries/util-validate-object"
import { isEqualTo } from "libraries/util-validate-object"

export type SortingCurationViewData = {
    type: 'SortingCuration'
}

export const isSortingCurationViewData = (x: any): x is SortingCurationViewData => {
    return validateObject(x, {
        type: isEqualTo('SortingCuration')
    })
}