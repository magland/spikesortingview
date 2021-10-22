import { ErrorMessage, TaskFunctionId, TaskFunctionType, TaskId, TaskKwargs, TaskStatus } from "./viewInterface/kacheryTypes";
import { InitiateTaskRequest, isInitiateTaskResponse } from "./viewInterface/FigurlRequestTypes";
import { TaskStatusUpdateMessage } from "./viewInterface/MessageToChildTypes";
import sendRequestToParent from "./sendRequestToParent";

const allTasks: {[key: string]: Task<any>} = {}

export class Task<ReturnType> {
    #onStatusChangedCallbacks: (() => void)[] = []
    #taskId: TaskId
    #status: TaskStatus
    #errorMessage?: ErrorMessage = undefined
    #result: ReturnType | undefined = undefined
    constructor(a: {taskId: TaskId, taskStatus: TaskStatus}) {
        this.#taskId = a.taskId
        this.#status = a.taskStatus
    }
    onStatusChanged(cb: () => void) {
        this.#onStatusChangedCallbacks.push(cb)
    }
    public get taskId() {
        return this.#taskId
    }
    public get status() {
        return this.#status
    }
    public get errorMessage() {
        return this.#errorMessage
    }
    public get result() {
        return this.#result
    }
    _handleStatusChange(status: TaskStatus, o: {errorMessage?: ErrorMessage, returnValue?: any}) {
        if (status === this.#status) return
        this.#status = status
        if (status === 'error') {
            this.#errorMessage = o.errorMessage
        }
        if (status === 'finished') {
            this.#result = o.returnValue as any as ReturnType
        }
        this.#onStatusChangedCallbacks.forEach(cb => {cb()})
    }
}

const initiateTask = async <ReturnType>(args: {functionId: TaskFunctionId | string | undefined, kwargs: TaskKwargs | {[key: string]: any}, functionType: TaskFunctionType, onStatusChanged: () => void, queryUseCache?: boolean, queryFallbackToCache?: boolean}) => {
    const { functionId, kwargs, functionType, onStatusChanged, queryUseCache, queryFallbackToCache } = args
    if (!functionId) return undefined

    const req: InitiateTaskRequest = {
        type: 'initiateTask',
        functionId: functionId as TaskFunctionId,
        kwargs,
        functionType,
        queryUseCache: queryUseCache || false,
        queryFallbackToCache: queryFallbackToCache || false
    }
    const resp = await sendRequestToParent(req)
    if (!isInitiateTaskResponse(resp)) throw Error('Unexpected response to initiateTask')

    const {taskId, taskStatus} = resp

    let t: Task<ReturnType>
    if (taskId.toString() in allTasks) {
        t = allTasks[taskId.toString()]
    }
    else {
        t = new Task<ReturnType>({taskId, taskStatus})
        allTasks[taskId.toString()] = t
    }
    t.onStatusChanged(onStatusChanged)
    return t
}

export const handleTaskStatusUpdate = (msg: TaskStatusUpdateMessage) => {
    const {taskId, status, errorMessage, returnValue} = msg
    if (taskId.toString() in allTasks) {
        const task = allTasks[taskId.toString()]
        task._handleStatusChange(status, {errorMessage, returnValue})
    }
}

export default initiateTask