import { useCallback, useEffect, useMemo, useState } from "react"
import initiateTask, { Task } from "./initiateTask"
import { JSONStringifyDeterministic, TaskKwargs } from "./viewInterface/kacheryTypes"
import { TaskType } from "./viewInterface/MessageToChildTypes"

const useTask = <ReturnType>(taskName: string | undefined, taskInput: {[key: string]: any}, taskType: TaskType): {returnValue?: ReturnType, task?: Task<ReturnType>} => {
    const [task, setTask] = useState<Task<ReturnType> | undefined>(undefined)
    const [, setUpdateCode] = useState<number>(0)
    const incrementUpdateCode = useCallback(() => {setUpdateCode(c => (c+1))}, [])
    const taskInputString = JSONStringifyDeterministic(taskInput)
    useEffect(() => {
        if (!taskName) return
        let valid = true
        
        const taskInput2 = JSON.parse(taskInputString) as any as TaskKwargs

        const onStatusChanged = () => {
            if (!valid) return
            incrementUpdateCode()
        }

        initiateTask<ReturnType>({
            taskName,
            taskInput: taskInput2,
            taskType,
            onStatusChanged
        }).then(t => {
            setTask(t)
        })

        return () => {
            valid = false
        }
    }, [taskName, taskInputString, taskType, incrementUpdateCode])
    const taskStatus = task ? task.status : undefined
    const returnValue = useMemo(() => {
        if (!task) return undefined
        return taskStatus === 'finished' ? task.result : undefined
    }, [task, taskStatus])
    return useMemo(() => ({
        returnValue,
        task
    }), [returnValue, task])
}

export default useTask