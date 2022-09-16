export declare type BstNode<T> = {
    value: T | undefined;
    baseListIndex: number | undefined;
    left: BstNode<T> | undefined;
    right: BstNode<T> | undefined;
};
export interface ValueWithPosition<T> {
    value: T;
    baseListIndex: number;
}
export interface BstSearchResult<T> extends ValueWithPosition<T> {
    offBy: number;
}
export declare type BstSearchFn<T> = (value: T, requireExact?: boolean) => BstSearchResult<T> | undefined;
export declare type MetricFn<T> = (a: T, b: T) => number;
export declare const makeBinaryTree: <T>(items: ValueWithPosition<T>[]) => BstNode<T>;
export declare const getSearchFn: <T>(metricFn: MetricFn<T>, root: BstNode<T>) => BstSearchFn<T>;
/**
 * Hook to create a reusable binary search tree for a fixed data set.
 * Note that no methods to extend or rebalance the tree are included, since we don't anticipate needing that
 * use case at this time.
 * (TODO: Could add a parameter to avoid checking sort on a pre-sorted list of data.)
 *
 * @param items (Typed) list of values to place in a binary search tree.
 * @param metricFn Appropriate comparator function for the value type.
 * @returns Search function for fast searches of the input list.
 */
declare const useBinarySearchTree: <T>(items: T[], metricFn: MetricFn<T>) => BstSearchFn<T>;
export default useBinarySearchTree;
