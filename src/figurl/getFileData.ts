import { useEffect, useMemo, useState } from "react"
import sendRequestToParent from "./sendRequestToParent"
import { GetFileDataRequest, GetFileDataUrlRequest, isGetFileDataResponse, isGetFileDataUrlResponse, isStoreFileResponse, StoreFileRequest } from "./viewInterface/FigurlRequestTypes"

const getFileData = async (uri: string, onProgress: (a: {loaded: number, total: number}) => void) => {
    const request: GetFileDataRequest = {
        type: 'getFileData',
        uri
    }
    progressListeners[uri] = ({loaded, total}) => {
        onProgress({loaded, total})
    }
    const response = await sendRequestToParent(request)
    if (!isGetFileDataResponse(response)) throw Error('Invalid response to getFigureData')
    return response.fileData
}

export const getFileDataUrl = async (uri: string) => {
    const request: GetFileDataUrlRequest = {
        type: 'getFileDataUrl',
        uri
    }
    const response = await sendRequestToParent(request)
    if (!isGetFileDataUrlResponse(response)) throw Error('Invalid response to getFigureUrlData')
    return response.fileDataUrl
}

export const storeFileData = async (fileData: string): Promise<string> => {
    const request: StoreFileRequest = {
        type: 'storeFile',
        fileData
    }
    const response = await sendRequestToParent(request)
    if (!isStoreFileResponse(response)) throw Error('Invalid response to storeFile')
    return response.uri
}

const progressListeners: {[uri: string]: (a: {loaded: number, total: number}) => void} = {}

export const handleFileDownloadProgress: (a: {uri: string, loaded: number, total: number}) => void = ({uri, loaded, total}) => {
    const x = progressListeners[uri]
    if (x) {
        x({loaded, total})
    }
}

export type Progress = {
    onProgress: (callback: (a: {loaded: number, total: number}) => void) => void
}

export const useFileData = (uri: string) => {
    const [fileData, setFileData] = useState<any | undefined>(undefined)
    const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined)
    const {progress, reportProgress} = useMemo(() => {
        let _callback: (a: {loaded: number, total: number}) => void = ({loaded, total}) => {}
        const reportProgress = (a: {loaded: number, total: number}) => {
            _callback(a)
        }
        const progress: Progress = {
            onProgress: (callback: (a: {loaded: number, total: number}) => void) => {
                _callback = callback
            }
        }
        return {progress, reportProgress}
    }, [])
    useEffect(() => {
        setErrorMessage(undefined)
        setFileData(undefined)
        getFileData(uri, reportProgress).then(data => {
            setFileData(data)
        }).catch(err => {
            setErrorMessage(err.message)
        })
    }, [uri, reportProgress])
    return {fileData, progress, errorMessage}
}

export default getFileData