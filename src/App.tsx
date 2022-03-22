import { MuiThemeProvider } from '@material-ui/core';
import RecordingSelectionContext, { defaultRecordingSelection, recordingSelectionReducer } from 'contexts/RecordingSelectionContext';
import RowSelectionContext, { defaultRowSelection, rowSelectionReducer } from 'contexts/RowSelectionContext';
import { getFigureData, useWindowDimensions } from 'figurl';
import React, { useEffect, useReducer, useState } from 'react';
import './localStyles.css';
import theme from './theme';
import View from './View';
import { isViewData, ViewData } from './ViewData';

function App() {
  const [data, setData] = useState<ViewData>()
  const [errorMessage, setErrorMessage] = useState<string>()
  const {width, height} = useWindowDimensions()

  const [rowSelection, rowSelectionDispatch] = useReducer(rowSelectionReducer, defaultRowSelection)
  const [recordingSelection, recordingSelectionDispatch] = useReducer(recordingSelectionReducer, defaultRecordingSelection)

  useEffect(() => {
    getFigureData().then((data: any) => {
      if (!isViewData(data)) {
        setErrorMessage(`Invalid figure data`)
        console.error('Invalid figure data', data)
        return
      }
      setData(data)
    }).catch(err => {
      setErrorMessage(`Error getting figure data`)
      console.error(`Error getting figure data`, err)
    })
  }, [])

  if (errorMessage) {
    return <div style={{color: 'red'}}>{errorMessage}</div>
  }

  if (!data) {
    return <div>Waiting for data</div>
  }

  return (
    <MuiThemeProvider theme={theme}>
      <RecordingSelectionContext.Provider value={{recordingSelection, recordingSelectionDispatch}}>
        <RowSelectionContext.Provider value={{rowSelection, rowSelectionDispatch}}>
            <View
            data={data}
            width={width - 10}
            height={height - 5}
            />
        </RowSelectionContext.Provider>
      </RecordingSelectionContext.Provider>
    </MuiThemeProvider>
  )
}

export default App;
