import runTaskAsync from "./runTaskAsync"

const runCalculationTaskAsync = async <ReturnType>(taskName: string, taskInput: { [key: string]: any }): Promise<ReturnType> => {
  return runTaskAsync<ReturnType>(taskName, taskInput, 'calculation')
}

export default runCalculationTaskAsync