import { isEqualTo, validateObject } from "@figurl/core-utils"


export type AnnotationsViewData = {
    type: 'Annotations'
}

export const isAnnotationsViewData = (x: any): x is AnnotationsViewData => {
    return validateObject(x, {
        type: isEqualTo('Annotations')
    }, {allowAdditionalFields: true})
}