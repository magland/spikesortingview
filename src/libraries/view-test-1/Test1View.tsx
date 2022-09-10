import { FunctionComponent, useCallback, useMemo } from 'react';
import Scene2d, { Scene2dObject } from './Scene2d';
import { Test1ViewData } from './Test1ViewData';

type Props = {
    data: Test1ViewData
    width: number
    height: number
}

const Test1View: FunctionComponent<Props> = ({data, width, height}) => {
    const objects: Scene2dObject[] = useMemo(() => {
        return [
            {
                objectId: '1',
                type: 'line',
                x: 20, y: 20, dx: 30, dy: 60,
                attributes: {
                    color: 'red'
                }
            },
            {
                objectId: '2',
                type: 'marker',
                clickable: true,
                draggable: true,
                x: 50, y: 80,
                attributes: {
                    fillColor: 'blue'
                }
            },
            {
                objectId: '3',
                type: 'marker',
                clickable: true,
                x: 20, y: 20,
                attributes: {
                    lineColor: 'black',
                    shape: 'square'
                }
            }

        ]
    }, [])
    const handleClickObject = useCallback((objectId: string) => {
        console.info('clicked', objectId)
    }, [])
    const handleDragObject = useCallback((objectId: string, p: {x: number, y: number}) => {
        console.info('dragged', objectId, p)
    }, [])
    return (
        <Scene2d
            width={width}
            height={height}
            objects={objects}
            onClickObject={handleClickObject}
            onDragObject={handleDragObject}
        />
    )
}

export default Test1View