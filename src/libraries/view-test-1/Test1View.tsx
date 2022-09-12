import { Scene2d, Scene2dObject, useScene2dObjects } from 'libraries/component-scene2d';
import React, { FunctionComponent, useCallback, useEffect } from 'react';
import { Test1ViewData } from './Test1ViewData';

type Props = {
    data: Test1ViewData
    width: number
    height: number
}

const initialObjects: Scene2dObject[] = []
for (let i = 0; i < 20; i ++) {
    initialObjects.push({
        objectId: `${i}-a`,
        type: 'marker',
        clickable: true,
        draggable: true,
        x: 30 * i, y: 20,
        attributes: {fillColor: 'blue'}
    })
    initialObjects.push({
        objectId: `${i}-b`,
        type: 'marker',
        clickable: true,
        draggable: true,
        x: 30 * i, y: 100,
        attributes: {shape: 'square', fillColor: 'green', radius: 1 + i / 5}
    })
    initialObjects.push({
        type: 'connector',
        clickable: true,
        draggable: true,
        objectId: `${i}-connector`,
        objectId1: `${i}-a`,
        objectId2: `${i}-b`,
        attributes: {color: 'black', dash: [5, 5]}
    })
}

const Test1View: FunctionComponent<Props> = ({width, height}) => {
    const {objects, clearObjects, addObject, setObjectPosition, setSelectedObjects} = useScene2dObjects()
    useEffect(() => {
        clearObjects()
        for (let o of initialObjects) {
            addObject(o)
        }
    }, [clearObjects, addObject])
    const handleClickObject = useCallback((objectId: string, e: React.MouseEvent) => {
        console.info('CLICK', objectId, e.ctrlKey, e.shiftKey)
        setSelectedObjects([objectId])
    }, [setSelectedObjects])
    const handleDragObject = useCallback((objectId: string, p: {x: number, y: number}, e: React.MouseEvent) => {
        console.info('DRAG OBJECT', objectId, p, e.ctrlKey, e.shiftKey)
        setObjectPosition(objectId, p)
    }, [setObjectPosition])
    const handleSelectObjects = useCallback((objectIds: string[], e: React.MouseEvent | undefined) => {
        console.info('SELECT OBJECTS', objectIds, e?.ctrlKey, e?.shiftKey)
        setSelectedObjects(objectIds)
    }, [setSelectedObjects])
    const handleClick = useCallback((p: {x: number, y: number}, e: React.MouseEvent) => {
        console.info('CLICK', p, e.ctrlKey, e.shiftKey)
        setSelectedObjects([])
        addObject({
            objectId: randomAlphaString(10),
            type: 'marker',
            clickable: true,
            draggable: true,
            x: p.x, y: p.y,
            attributes: {shape: 'square', fillColor: 'purple', radius: 6}
        })
    }, [setSelectedObjects, addObject])
    return (
        <Scene2d
            width={width}
            height={height}
            objects={objects}
            onClickObject={handleClickObject}
            onDragObject={handleDragObject}
            onSelectObjects={handleSelectObjects}
            onClick={handleClick}
        />
    )
}

const randomAlphaString = (num_chars: number) => {
    if (!num_chars) {
        /* istanbul ignore next */
        throw Error('randomAlphaString: num_chars needs to be a positive integer.')
    }
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    for (var i = 0; i < num_chars; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
}

export default Test1View