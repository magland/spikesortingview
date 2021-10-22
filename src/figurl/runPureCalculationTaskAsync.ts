import { TaskFunctionId, TaskKwargs } from "./viewInterface/kacheryTypes"
import runTaskAsync from "./runTaskAsync"

const runPureCalculationTaskAsync = async <ReturnType>(functionId: TaskFunctionId | string, kwargs: TaskKwargs | { [key: string]: any }, opts: { }): Promise<ReturnType> => {
  return runTaskAsync<ReturnType>(functionId, kwargs, 'pure-calculation', opts)
}

export default runPureCalculationTaskAsync