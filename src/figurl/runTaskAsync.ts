import initiateTask, { Task } from "./initiateTask"
import { TaskFunctionId, TaskFunctionType, TaskKwargs } from "./viewInterface/kacheryTypes"

const runTaskAsync = async <ReturnType>(functionId: TaskFunctionId | string, kwargs: TaskKwargs | { [key: string]: any }, functionType: TaskFunctionType, opts: { queryUseCache?: boolean }): Promise<ReturnType> => {
  return new Promise((resolve, reject) => {
    let task: Task<ReturnType> | undefined = undefined
    const check = () => {
      if (!task) return
      if (task.status === 'finished') {
        const result = task.result
        if (functionType === 'action') {
          resolve(undefined as any as ReturnType) // sort of a type hack
        }
        else {
          if (result) resolve(result)
          else {
            if (functionType)
            reject(new Error('No result even though status is finished'))
          }
        }
      }
      else if (task.status === 'error') {
        reject(task.errorMessage)
      }
    }
    initiateTask<ReturnType>({
      functionId,
      kwargs,
      functionType,
      onStatusChanged: () => {
        check()
      },
      queryUseCache: opts.queryUseCache
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