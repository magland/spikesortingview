import { Button } from '@material-ui/core';
import { TaskStatusView, useCalculationTask } from 'figurl';
import validateObject, { isEqualTo, isString } from 'figurl/viewInterface/validateObject';
import React, { FunctionComponent, useCallback, useEffect, useState } from 'react';

export type LiveEvaluateFunctionViewData = {
    type: 'LiveEvaluateFunction'
    functionId: string
}
export const isLiveEvaluateFunctionViewData = (x: any): x is LiveEvaluateFunctionViewData => {
    return validateObject(x, {
        type: isEqualTo('LiveEvaluateFunction'),
        functionId: isString
    })
}

type Props = {
    data: LiveEvaluateFunctionViewData
    width: number
    height: number
}

const LiveEvaluateFunctionView: FunctionComponent<Props> = ({data, width, height}) => {
    const {functionId} = data
    const [kwargs, setKwargs] = useState<any>(undefined)
    const {returnValue, task} = useCalculationTask<number>(kwargs ? `function.${functionId}` : undefined, kwargs)
    const [inputText, setInputText] = useState('0')
    const [submittedOnce, setSubmittedOnce] = useState(false)
    const handleChange= useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setInputText(event.target.value)
    }, [])
    const handleSubmit = useCallback(() => {
        setSubmittedOnce(true)
        setKwargs({x: parseInt(inputText)})
    }, [inputText])
    useEffect(() => {
        if (!submittedOnce) {
            handleSubmit()
        }
    }, [handleSubmit, submittedOnce])
    return (
        <div style={{margin: 20}}>
            <div>Function: {functionId}</div>
            <input type="text" value={inputText} onChange={handleChange} />
            <Button onClick={handleSubmit}>Submit</Button>
            <div>
                {
                    returnValue === undefined ? (
                        <TaskStatusView task={task} label={`${functionId}`} />
                    ) : (
                        <span>Result: {returnValue}</span>
                    )
                }
            </div>
        </div>
    )
}

export default LiveEvaluateFunctionView