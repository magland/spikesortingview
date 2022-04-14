import useTask from "./useTask";

const useCalculationTask = <ReturnType>(taskName: string | undefined, taskInput: {[key: string]: any}) => {
    return useTask<ReturnType>(taskName, taskInput, 'calculation')
}

export default useCalculationTask