import { MuiThemeProvider } from '@material-ui/core';
import { getFigureData, useWindowDimensions } from 'figurl';
import React, { useEffect, useReducer, useState } from 'react';
import theme from './theme';
import View from './View';
import { isViewData, ViewData } from './ViewData';
import './localStyles.css'
import SortingSelectionContext, { defaultSortingSelection, sortingSelectionReducer } from 'contexts/SortingSelectionContext';

function App() {
  const [data, setData] = useState<ViewData>()
  const [errorMessage, setErrorMessage] = useState<string>()
  const {width, height} = useWindowDimensions()

  const [sortingSelection, sortingSelectionDispatch] = useReducer(sortingSelectionReducer, defaultSortingSelection)

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
      <SortingSelectionContext.Provider value={{sortingSelection, sortingSelectionDispatch}}>
        <View
          data={data}
          width={width - 10}
          height={height - 5}
        />
      </SortingSelectionContext.Provider>
    </MuiThemeProvider>
  )
}

export default App;
