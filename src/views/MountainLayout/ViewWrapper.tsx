import getFileData from 'figurl/getFileData';
import { Sha1Hash } from 'figurl/viewInterface/kacheryTypes';
import React, { FunctionComponent, useEffect, useState } from 'react';
import View from 'View';

type Props = {
    figureDataSha1: Sha1Hash // old
    figureDataUri: string // new
    width: number
    height: number
}

const useFileData = (sha1OrUri: string) => {
    const [fileData, setFileData] = useState<any>()
    const [errorMessage, setErrorMessage] = useState<string>()

    useEffect(() => {
        setFileData(undefined)
        setErrorMessage(undefined)
        getFileData(sha1OrUri).then((data: any) => {
            setFileData(data)
        }).catch(err => {
            setErrorMessage(`Error getting file data`)
            console.error(`Error getting file data`, err)
        })
    }, [sha1OrUri])

    return {fileData, errorMessage}
}

const ViewWrapper: FunctionComponent<Props> = ({ figureDataSha1, figureDataUri, width, height }) => {
    const sha1OrUri = figureDataSha1 ? figureDataSha1.toString() : figureDataUri
    if (!sha1OrUri) throw Error('No figureDataSha1 or figureDataUri in ViewWrapper')
    const { fileData: figureData, errorMessage } = useFileData(sha1OrUri)

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