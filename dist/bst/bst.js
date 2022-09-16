import { useMemo } from "react";
export var makeBinaryTree = function (items) {
    switch (items.length) {
        case 0:
            console.log("Encountered empty array in building binary search tree: this probably shoudn't happen");
            return { value: undefined, left: undefined, right: undefined, baseListIndex: undefined };
        case 1:
            return { value: items[0].value, left: undefined, right: undefined, baseListIndex: items[0].baseListIndex };
        case 2: // the node will have only 1 child! Let's arbitrarily make it the left one
            return { value: items[1].value, left: makeBinaryTree([items[0]]), right: undefined, baseListIndex: items[1].baseListIndex };
        default:
            var split = Math.floor(items.length / 2);
            var leftChild = makeBinaryTree(items.slice(0, split));
            var thisNode = items[split];
            var rightChild = makeBinaryTree(items.slice(split + 1));
            return { value: thisNode.value, baseListIndex: thisNode.baseListIndex, left: leftChild, right: rightChild };
    }
};
var nodeToValue = function (node, difference) {
    if (!node || node.value === undefined || node.baseListIndex === undefined)
        return undefined;
    return {
        value: node.value, baseListIndex: node.baseListIndex, offBy: difference
    };
};
export var getSearchFn = function (metricFn, root) {
    return function (value, requireExact) {
        if (requireExact === void 0) { requireExact = false; }
        return _searchBinaryTree(value, metricFn, root, requireExact);
    };
};
var _searchBinaryTree = function (value, metricFn, node, requireExact) {
    if (requireExact === void 0) { requireExact = false; }
    if (!node || node.value === undefined)
        return undefined;
    var diff = metricFn(value, node.value);
    if (diff === 0)
        return nodeToValue(node, diff);
    // Negative means a sorts before b, i.e. the value is less than the node value.
    var candidateSubtree = diff < 0 ? node.left : node.right;
    var candidateNode = _searchBinaryTree(value, metricFn, candidateSubtree, requireExact);
    // candidateNode is now either a node with a match, or undefined (if we required exact and the value isn't in the BST.)
    // If we must return exact, return the candidate.
    // For inexact search, return the closest value, or the parent value if the child was undefined or the values tied.
    // TODO: consider if we would rather deterministically return the lower value.
    return requireExact
        ? candidateNode
        : candidateNode === undefined
            ? nodeToValue(node, diff)
            : Math.abs(candidateNode.offBy) < Math.abs(diff)
                ? candidateNode
                : nodeToValue(node, diff);
};
// TODO: This is all potentially unnecessary--if we don't support inserts, we don't need an actual tree; we could
// just use a binary search pattern on a sorted array.
// Do note though that we probably don't have O(1) random access to elements of a javascript array, so
// that might be a reason to still do this.
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
// export const useBinarySearchTree = <T,>(items: T[], metricFn: (a: T, b: T) => number): BstNode<T> => {
var useBinarySearchTree = function (items, metricFn) {
    return useMemo(function () {
        var labeledItems = items.map(function (item, index) { return { value: item, baseListIndex: index }; });
        var sorted = labeledItems.every(function (item, index, array) {
            return index === 0 || metricFn(item.value, array[index - 1].value) >= 0;
        });
        if (!sorted) {
            labeledItems.sort(function (a, b) { return metricFn(a.value, b.value); });
        }
        var root = makeBinaryTree(labeledItems);
        return getSearchFn(metricFn, root);
    }, [items, metricFn]);
};
export default useBinarySearchTree;
//# sourceMappingURL=bst.js.map