import { useMemo } from "react"

export type BstNode<T> = {
    value: T | undefined
    left: BstNode<T> | undefined
    right: BstNode<T> | undefined
}

const makeBinaryTree = <T,>(items: T[]): BstNode<T> => {
    switch (items.length) {
        case 0:
            console.log(`Encountered empty array in building binary search tree: this probably shoudn't happen`)
            return { value: undefined, left: undefined, right: undefined } as BstNode<T>
        case 1:
            return { value: items[0], left: undefined, right: undefined } as BstNode<T>
        case 2: // the node will have only 1 child! Let's arbitrarily make it the left one
            return { value: items[1], left: makeBinaryTree([items[0]]), right: undefined } as BstNode<T>
        default:
            const split = Math.floor(items.length / 2)
            const leftChild = makeBinaryTree(items.slice(0, split))
            const value = items[split]
            const rightChild = makeBinaryTree(items.slice(split + 1))
            return { value: value, left: leftChild, right: rightChild } as BstNode<T>
    }
}


export const useBinarySearchTree = <T,>(items: T[], needsSort: boolean = false, compFn: (a: T, b: T) => number): BstNode<T> => {
    return useMemo(() => {
        if (needsSort) {
            items.sort((a, b) => compFn(a, b))
        }
        const sortedArray = needsSort ? items.sort() : items
        const sorted = sortedArray.every((item, index, array) => {
            return index === 0 || (item > array[index - 1])
        })
        if (!sorted) {
            throw new Error("Timestamp array not sorted.")
        }

        return makeBinaryTree(items)
    }, [items])
}


export const searchBinaryTree = <T,>(value: T, node: BstNode<T>, compFn: (a: T, b: T) => number, requireExact: boolean = false) => {
    // TODO: NEED TO REPORT THE ACTUAL INDEX? (Maybe for some applications)
    if (!node || node.value === undefined) return undefined
    const diff = compFn(value, node.value)
    if (diff === 0) return value

}

