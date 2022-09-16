import { isEqualTo, validateObject } from "@figurl/spikesortingview.core-utils"


export type AnnotationsViewData = {
    type: 'Annotations'
}

export const isAnnotationsViewData = (x: any): x is AnnotationsViewData => {
    return validateObject(x, {
        type: isEqualTo('Annotations')
    }, {allowAdditionalFields: true})
}