import { TaskFunctionId, TaskKwargs } from "./viewInterface/kacheryTypes"
import runTaskAsync from "./runTaskAsync"

const runQueryTaskAsync = async <ReturnType>(functionId: TaskFunctionId | string, kwargs: TaskKwargs | { [key: string]: any }, opts: { useCache: boolean }): Promise<ReturnType> => {
  return runTaskAsync<ReturnType>(functionId, kwargs, 'query', {queryUseCache: opts.useCache})
}

export default runQueryTaskAsync