import getFileData from 'figurl/getFileData';
import { Sha1Hash } from 'figurl/viewInterface/kacheryTypes';
import React, { FunctionComponent, useEffect, useMemo, useState } from 'react';
import View, { TimeseriesLayoutOpts } from 'View';
import './MultiTimeseriesView.css';

type Props = {
    label: string
    figureDataSha1: Sha1Hash
    isBottomPanel: boolean
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

const ViewWrapper: FunctionComponent<Props> = ({ label, figureDataSha1, isBottomPanel, width, height }) => {
    const { fileData: figureData, errorMessage } = useFileData(figureDataSha1)

    const timeseriesLayoutOpts: TimeseriesLayoutOpts = useMemo(() => {
        return {
            hideToolbar: true,
            hideTimeAxis: !isBottomPanel,
            useYAxis: true // TODO: THIS IS FOR TESTING, REVERT ME
        }
    }, [isBottomPanel])

    const labelWidth = 40
    const contentWidth = width - labelWidth

    const content = figureData ? (
        <View
            data={figureData}
            timeseriesLayoutOpts={timeseriesLayoutOpts}
            width={contentWidth}
            height={height}
        />
    ) : (
        <div style={{ width: contentWidth, height }}>
            {
                errorMessage ? errorMessage : 'Waiting for data'
            }
        </div>
    )

    const parentDivStyle: React.CSSProperties = useMemo(() => ({
        width,
        height
    }), [width, height])

    const labelDivStyle: React.CSSProperties = useMemo(() => ({
        width: labelWidth,
        height
    }), [labelWidth, height])

    const contentDivStyle: React.CSSProperties = useMemo(() => ({
        left: labelWidth,
        width: contentWidth,
        height
    }), [labelWidth, contentWidth, height])

    return (
        <div className={"MultiTimeseriesViewParent"} style={parentDivStyle}>
            <div className={"MultiTimeseriesViewLabels"} style={labelDivStyle}>
                {label}
            </div>
            <div className={"MultiTimeseriesViewContent"} style={contentDivStyle}>
                {content}
            </div>
        </div>
    )
}

export default ViewWrapper