import runTaskAsync from "./runTaskAsync"

const runActionTaskAsync = async <ReturnType>(taskName: string, taskInput: { [key: string]: any }): Promise<ReturnType> => {
  return runTaskAsync<ReturnType>(taskName, taskInput, 'action')
}

export default runActionTaskAsync