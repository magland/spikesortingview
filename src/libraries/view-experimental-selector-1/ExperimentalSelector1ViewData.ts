import { isEqualTo, validateObject } from "libraries/util-validate-object"


export type ExperimentalSelector1ViewData = {
    type: 'ExperimentalSelector1'
}

export const isExperimentalSelector1ViewData = (x: any): x is ExperimentalSelector1ViewData => {
    return validateObject(x, {
        type: isEqualTo('ExperimentalSelector1')
    }, {allowAdditionalFields: true})
}