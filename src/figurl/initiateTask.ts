import sendRequestToParent from "./sendRequestToParent";
import { InitiateTaskRequest, isInitiateTaskResponse } from "./viewInterface/FigurlRequestTypes";
import { TaskJobStatus, TaskStatusUpdateMessage, TaskType } from "./viewInterface/MessageToChildTypes";

const allTasks: {[key: string]: Task<any>} = {}

export class Task<ReturnType> {
    #onStatusChangedCallbacks: (() => void)[] = []
    #taskJobId: string
    #status: TaskJobStatus
    #errorMessage?: string = undefined
    #result: ReturnType | undefined = undefined
    constructor(a: {taskJobId: string, status: TaskJobStatus}) {
        this.#taskJobId = a.taskJobId
        this.#status = a.status
    }
    onStatusChanged(cb: () => void) {
        this.#onStatusChangedCallbacks.push(cb)
    }
    public get taskJobId() {
        return this.#taskJobId
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
    _handleStatusChange(status: TaskJobStatus, o: {errorMessage?: string, returnValue?: any}) {
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

const initiateTask = async <ReturnType>(args: {taskName: string | undefined, taskInput: {[key: string]: any}, taskType: TaskType, onStatusChanged: () => void}) => {
    const { taskName, taskInput, taskType, onStatusChanged } = args
    if (!taskName) return undefined

    const req: InitiateTaskRequest = {
        type: 'initiateTask',
        taskName,
        taskInput,
        taskType
    }
    const resp = await sendRequestToParent(req)
    if (!isInitiateTaskResponse(resp)) throw Error('Unexpected response to initiateTask')

    const {taskJobId, status} = resp

    let t: Task<ReturnType>
    if (taskJobId.toString() in allTasks) {
        t = allTasks[taskJobId.toString()]
    }
    else {
        t = new Task<ReturnType>({taskJobId, status})
        allTasks[taskJobId.toString()] = t
    }
    t.onStatusChanged(onStatusChanged)
    return t
}

export const handleTaskStatusUpdate = (msg: TaskStatusUpdateMessage) => {
    const {taskJobId, status, errorMessage, returnValue} = msg
    if (taskJobId.toString() in allTasks) {
        const task = allTasks[taskJobId.toString()]
        task._handleStatusChange(status, {errorMessage, returnValue})
    }
}

export const getAllTasks = () => {
    return allTasks
}

export default initiateTask