import { validateObject } from "figurl"
import { isEqualTo } from "figurl/viewInterface/validateObject"

export type SortingCurationViewData = {
    type: 'SortingCuration'
}

export const isSortingCurationViewData = (x: any): x is SortingCurationViewData => {
    return validateObject(x, {
        type: isEqualTo('SortingCuration')
    })
}