import { useEffect, useState } from "react"
import sendRequestToParent from "./sendRequestToParent"
import { GetFileDataRequest, isGetFileDataResponse } from "./viewInterface/FigurlRequestTypes"

const getFileData = async (uri: string) => {
    const request: GetFileDataRequest = {
        type: 'getFileData',
        uri
    }
    const response = await sendRequestToParent(request)
    if (!isGetFileDataResponse(response)) throw Error('Invalid response to getFigureData')
    return response.fileData
}

export const useFileData = (uri: string) => {
    const [fileData, setFileData] = useState<any | undefined>(undefined)
    const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined)
    useEffect(() => {
        setErrorMessage(undefined)
        setFileData(undefined)
        getFileData(uri).then(data => {
            setFileData(data)
        }).catch(err => {
            setErrorMessage(err.message)
        })
    }, [uri])
    return {fileData, errorMessage}
}

export default getFileData