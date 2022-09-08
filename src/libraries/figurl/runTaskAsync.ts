import initiateTask, { Task } from "./initiateTask"
import { TaskType } from "./viewInterface/MessageToChildTypes"

const runTaskAsync = async <ReturnType>(taskName: string, taskInput: { [key: string]: any }, taskType: TaskType): Promise<ReturnType> => {
  return new Promise((resolve, reject) => {
    let task: Task<ReturnType> | undefined = undefined
    const check = () => {
      if (!task) return
      if (task.status === 'finished') {
        const result = task.result
        if (taskType === 'action') {
          resolve(undefined as any as ReturnType) // sort of a type hack
        }
        else {
          if (result) resolve(result)
          else {
            if (taskType === 'calculation') {
              reject(new Error('No result even though status is finished'))
            }
            else {
              resolve(undefined as any as ReturnType)
            }
          }
        }
      }
      else if (task.status === 'error') {
        reject(task.errorMessage)
      }
    }
    initiateTask<ReturnType>({
      taskName,
      taskInput,
      taskType,
      onStatusChanged: () => {
        check()
      }
    }).then(t => {
      if (!t) {
        reject('Unable to create get_timeseries_segment task')
        return
      }
      task = t
      check()
    })
  })
}

export default runTaskAsync