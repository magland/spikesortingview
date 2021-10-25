import getFileData from 'figurl/getFileData';
import { Sha1Hash } from 'figurl/viewInterface/kacheryTypes';
import React, { FunctionComponent, useEffect, useState } from 'react';
import View from 'View';

type Props = {
    figureDataSha1: Sha1Hash
    width: number
    height: number
}

const useFileData = (sha1: Sha1Hash) => {
    const [fileData, setFileData] = useState<any>()
    const [errorMessage, setErrorMessage] = useState<string>()

    useEffect(() => {
        setFileData(undefined)
        setErrorMessage(undefined)
        getFileData(sha1).then((data: any) => {
            setFileData(data)
        }).catch(err => {
            setErrorMessage(`Error getting file data`)
            console.error(`Error getting file data`, err)
        })
    }, [sha1])

    return {fileData, errorMessage}
}

const ViewWrapper: FunctionComponent<Props> = ({ figureDataSha1, width, height }) => {
    const { fileData: figureData, errorMessage } = useFileData(figureDataSha1)

    if (!figureData) {
        return (
            <div style={{ width, height }}>
                {
                    errorMessage ? errorMessage : 'Waiting for data'
                }
            </div>
        )
    }
    return (
        <View
            data={figureData}
            width={width}
            height={height}
        />
    )
}

export default ViewWrapper