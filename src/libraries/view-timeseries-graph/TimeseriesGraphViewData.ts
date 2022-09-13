import { isEqualTo, isNumber, optional, validateObject } from "libraries/util-validate-object"
import { isString } from "mathjs"


type Dataset = {
    name: string
    data: {[key: string]: any}
}

type Series = {
    type: string
    dataset: string
    encoding: {[key: string]: any}
    attributes: {[key: string]: any}
}

export type TimeseriesGraphViewData = {
    type: 'TimeseriesGraph',
    datasets: Dataset[],
    series: Series[]
    timeOffset?: number
}

export const isTimeseriesGraphViewData = (x: any): x is TimeseriesGraphViewData => {
    return validateObject(x, {
        type: isEqualTo('TimeseriesGraph'),
        datasets: y => (validateObject(y, {
            name: isString,
            data: () => (true)
        })),
        series: y => (validateObject(y, {
            type: isString,
            dataset: isString,
            encoding: () => (true),
            attributes: () => (true)
        })),
        timeOffset: optional(isNumber)
    }, {allowAdditionalFields: true})
}