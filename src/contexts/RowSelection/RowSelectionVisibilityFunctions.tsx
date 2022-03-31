import { RowSelection, RowSelectionAction } from "./RowSelectionContext"

export const DEFAULT_ROWS_PER_PAGE = 20

export const setVisibleRows = (s: RowSelection, a: RowSelectionAction): RowSelection => {
    // If visible rows are manually specified, just assume caller knows what they're doing.
    if (a.newVisibleRowIds && a.newVisibleRowIds.length > 0) return { ...s, visibleRowIds: a.newVisibleRowIds }

    const newWindowSize = a.rowsPerPage || s.rowsPerPage || DEFAULT_ROWS_PER_PAGE
    const newPage = a.pageNumber || s.page || 1
    
    // Degenerate case: caller didn't ask us to do anything, so return identity.
    if (newWindowSize === s.rowsPerPage && newPage === s.page) return s

    // if the new page explicitly differs from the old, use that regardless; otherwise use the page under
    // the new window size that will contain the first row under the old window size.
    const realizedStartingPage = newPage !== s.page
        ? newPage
        : 1 + Math.floor(((s.rowsPerPage || DEFAULT_ROWS_PER_PAGE) * (newPage - 1)) / newWindowSize)
    const windowStart = newWindowSize * (realizedStartingPage - 1)

    return {
        ...s,
        page: realizedStartingPage,
        rowsPerPage: newWindowSize,
        visibleRowIds: s.orderedRowIds.slice(windowStart, windowStart + newWindowSize)
    }
}

export const getVisibleRowsOnSortUpdate = (s: RowSelection, newOrder: number[]) => {
    const windowStart = (s.rowsPerPage || DEFAULT_ROWS_PER_PAGE) * ((s.page || 1) - 1)
    return (s.visibleRowIds && s.visibleRowIds.length > 0)
        ? newOrder.slice(windowStart, windowStart + (s.rowsPerPage || DEFAULT_ROWS_PER_PAGE))
        : undefined
}
