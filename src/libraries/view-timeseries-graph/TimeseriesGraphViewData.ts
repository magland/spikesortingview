import { isEqualTo, isNumber, optional, validateObject } from "@figurl/core-utils"
import { isString } from "mathjs"

type LegendOpts = {
    location: 'northwest' | 'northeast'
}

type Dataset = {
    name: string
    data: {[key: string]: any}
}

type Series = {
    type: string
    dataset: string
    title?: string
    encoding: {[key: string]: any}
    attributes: {[key: string]: any}
}

export type TimeseriesGraphViewData = {
    type: 'TimeseriesGraph',
    datasets: Dataset[],
    series: Series[]
    timeOffset?: number
    legendOpts?: LegendOpts
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
            attributes: () => (true),
            title: optional(isString)
        })),
        timeOffset: optional(isNumber),
        legendOpts: optional((y: any) => validateObject(y, {
            location: isString
        }))
    }, {allowAdditionalFields: true})
}