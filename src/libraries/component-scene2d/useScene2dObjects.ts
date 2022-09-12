import { useCallback, useReducer } from "react"
import { Scene2dObject } from "./Scene2d"

type Scene2dObjectsAction = {
    type: 'add',
    object: Scene2dObject
} | {
    type: 'clear'
} | {
    type: 'setObjectPosition'
    objectId: string
    position: {x: number, y: number}
} | {
    type: 'setSelectedObjects',
    objectIds: string[]
}

const scene2dObjectsReducer = (s: Scene2dObject[], a: Scene2dObjectsAction): Scene2dObject[] => {
    if (a.type === 'add') {
        return [...s, a.object]
    }
    else if (a.type === 'clear') {
        return []
    }
    else if (a.type === 'setObjectPosition') {
        return s.map(o => (
            o.objectId === a.objectId ? setObjectPosition(o, {x: a.position.x, y: a.position.y}) : o
        ))
    }
    else if (a.type === 'setSelectedObjects') {
        return s.map(o => (
            {...o, selected: a.objectIds.includes(o.objectId)}
        ))
    }
    else return s
}

const setObjectPosition = (o: Scene2dObject, p: {x: number, y: number}) => {
    return {...o, ...p}
}

const useScene2dObjects = () => {
    const [objects, objectsDispatch] = useReducer(scene2dObjectsReducer, [])

    const clearObjects = useCallback(() => {
        objectsDispatch({type: 'clear'})
    }, [])

    const addObject = useCallback((object: Scene2dObject) => {
        objectsDispatch({type: 'add', object})
    }, [])

    const setObjectPosition = useCallback((objectId: string, position: {x: number, y: number}) => {
        objectsDispatch({type: 'setObjectPosition', objectId, position})
    }, [])

    const setSelectedObjects = useCallback((objectIds: string[]) => {
        objectsDispatch({type: 'setSelectedObjects', objectIds})
    }, [])

    return {
        objects,
        clearObjects,
        addObject,
        setObjectPosition,
        setSelectedObjects
    }
}

export default useScene2dObjects