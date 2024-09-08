import { TreeNodeData, Tree, memoize, CheckedNodeStatus } from "@mantine/core";
import { useLocalStorage } from "@uidotdev/usehooks";
import { TreeExpandedState, UseTreeInput, UseTreeReturnType } from "node_modules/@mantine/core/lib/components/Tree/use-tree";
import { useCallback, useEffect, useState } from "react";

function getAllCheckedNodes(
    data: TreeNodeData[],
    checkedState: string[],
    acc: CheckedNodeStatus[] = []
  ) {
    const currentTreeChecked: CheckedNodeStatus[] = [];
  
    for (const node of data) {
      if (Array.isArray(node.children) && node.children.length > 0) {
        const innerChecked = getAllCheckedNodes(node.children, checkedState, acc);
        if (innerChecked.currentTreeChecked.length === node.children.length) {
          const isChecked = innerChecked.currentTreeChecked.every((item) => item.checked);
          const item = {
            checked: isChecked,
            indeterminate: !isChecked,
            value: node.value,
            hasChildren: true,
          };
          currentTreeChecked.push(item);
          acc.push(item);
        } else if (innerChecked.currentTreeChecked.length > 0) {
          const item = { checked: false, indeterminate: true, value: node.value, hasChildren: true };
          currentTreeChecked.push(item);
          acc.push(item);
        }
      } else if (checkedState.includes(node.value)) {
        const item: CheckedNodeStatus = {
          checked: true,
          indeterminate: false,
          value: node.value,
          hasChildren: false,
        };
        currentTreeChecked.push(item);
        acc.push(item);
      }
    }
  
    return { result: acc, currentTreeChecked };
  }

function isNodeChecked(
    value: string,
    data: TreeNodeData[],
    checkedState: string[]
  ): boolean {
    if (checkedState.length === 0) {
      return false;
    }
  
    if (checkedState.includes(value)) {
      return true;
    }
  
    const checkedNodes = getAllCheckedNodes(data, checkedState).result;
    return checkedNodes.some((node) => node.value === value && node.checked);
  }

const memoizedIsNodeChecked = memoize(isNodeChecked)

function findTreeNode(value: string, data: TreeNodeData[]): TreeNodeData | null {
    for (const node of data) {
        if (node.value === value) {
            return node;
        }

        if (Array.isArray(node.children)) {
            const childNode = findTreeNode(value, node.children);
            if (childNode) {
                return childNode;
            }
        }
    }

    return null;
}

const getParentNodeValue = (value: string, data: TreeNodeData[]): string | null => {
    for (const node of data) {
        if (node.children && node.children.some((child) => child.value === value)) {
            return node.value;
        }
        if (node.children) {
            const parentValue = getParentNodeValue(value, node.children);
            if (parentValue) {
                return parentValue;
            }
        }
    }
    return null;
};

function getChildrenNodesValues(
    value: string,
    data: TreeNodeData[],
    acc: string[] = []
): string[] {
    const node = findTreeNode(value, data);
    if (!node) {
        return acc;
    }

    if (!Array.isArray(node.children) || node.children.length === 0) {
        return [node.value];
    }

    node.children.forEach((child) => {
        if (Array.isArray(child.children) && child.children.length > 0) {
            getChildrenNodesValues(child.value, data, acc);
        } else {
            acc.push(child.value);
        }
    });

    acc.push(node.value);

    return acc;
}

function getInitialExpandedState(
    initialState: TreeExpandedState,
    data: TreeNodeData[],
    value: string | string[] | undefined,
    acc: TreeExpandedState = {}
) {
    data.forEach((node) => {
        // acc[node.value] = true
        acc[node.value] = node.value in initialState ? initialState[node.value] : node.value === value;

        if (Array.isArray(node.children)) {
            getInitialExpandedState(initialState, node.children, value, acc);
        }
    });

    return acc;
}

interface CustomUseTreeInput extends UseTreeInput {
    onSelectedChange?: (value: string[]) => void;
    localstorageKey?: string
}

export function useTree({
    initialSelectedState = [],
    initialCheckedState = [],
    initialExpandedState = {},
    multiple = false,
    localstorageKey = "",
}: CustomUseTreeInput = {}) {
    const expandKey = `${localstorageKey}-expand`
    const checkedKey = `${localstorageKey}-checked`

    const [data, setData] = useState<TreeNodeData[]>([]);
    const [localExpandState, saveExpandLocalState] = useLocalStorage(expandKey, initialExpandedState)
    const [localCheckedState, saveCheckedLocalState] = useLocalStorage(checkedKey, initialCheckedState)
    const [checkedState, setCheckedState] = useState(localCheckedState);
    const [expandedState, setExpandedState] = useState(localExpandState);

    const [anchorNode, setAnchorNode] = useState<string | null>(null);
    const [hoveredNode, setHoveredNode] = useState<string | null>(null);
    const [selectedState, setSelectedState] = useState(initialSelectedState);

    useEffect(() => {
        if (JSON.stringify(localCheckedState) !== JSON.stringify(checkedState)) {
            saveCheckedLocalState(checkedState)
        }
    }, [checkedState])

    useEffect(() => {
        if (JSON.stringify(localCheckedState) !== JSON.stringify(expandedState)) {
            saveExpandLocalState(expandedState)
        }
    }, [expandedState])

    const initialize = useCallback(
        (_data: TreeNodeData[]) => {
            setData(_data);
        },
        [data]
    );

    const toggleExpanded = useCallback((value: string) => {
        setExpandedState((current) => ({ ...current, [value]: !current[value] }));
    }, []);

    const collapse = useCallback((value: string) => {
        setExpandedState((current) => ({ ...current, [value]: false }));
    }, []);

    const expand = useCallback((value: string) => {
        setExpandedState((current) => ({ ...current, [value]: true }));
    }, []);

    const expandAllNodes = useCallback(() => {
        setExpandedState((current) => {
            const next = { ...current };
            Object.keys(next).forEach((key) => {
                next[key] = true;
            });

            return next;
        });
    }, []);

    const collapseAllNodes = useCallback(() => {
        setExpandedState((current) => {
            const next = { ...current };
            Object.keys(next).forEach((key) => {
                next[key] = false;
            });

            return next;
        });
    }, []);

    const toggleSelected = useCallback(
        (value: string) =>
            setSelectedState((current) => {
                if (!multiple) {
                    if (current.includes(value)) {
                        setAnchorNode(null);
                        return [];
                    }

                    setAnchorNode(value);
                    return [value];
                }

                if (current.includes(value)) {
                    setAnchorNode(null);
                    return current.filter((item) => item !== value);
                }

                setAnchorNode(value);

                return [...current, value];
            }),
        []
    );

    const select = useCallback((value: string) => {
        setAnchorNode(value);
        setSelectedState((current) =>
            multiple ? (current.includes(value) ? current : [...current, value]) : [value]
        );
    }, []);

    const deselect = useCallback((value: string) => {
        anchorNode === value && setAnchorNode(null);
        setSelectedState((current) => current.filter((item) => item !== value));
    }, []);

    const clearSelected = useCallback(() => {
        setSelectedState([]);
        setAnchorNode(null);
    }, []);

    const checkNode = useCallback(
        (value: string) => {
            const checkedNodes = [value];
            let parentValue = getParentNodeValue(value, data);
            while (parentValue) {
                checkedNodes.push(parentValue);
                parentValue = getParentNodeValue(parentValue, data);
            }
            setCheckedState((current) => [...current, ...checkedNodes]);
        },
        [data]
    );

    const uncheckNode = useCallback(
        (value: string) => {
            const uncheckedNodes = [value, ...getChildrenNodesValues(value, data)];

            setCheckedState((current) => {
                return current.filter(node => !uncheckedNodes.includes(node))});
        },
        [data]
    );

    const getCheckedNodes = () => getAllCheckedNodes(data, checkedState).result;
    const isNodeChecked = (value: string) => memoizedIsNodeChecked(value, data, checkedState);
    const isNodeIndeterminate = useCallback(() => {return false}, [])

    console.log(expandedState)

    return {
        multiple,
        expandedState,
        selectedState,
        checkedState,
        anchorNode,
        initialize,

        toggleExpanded,
        collapse,
        expand,
        expandAllNodes,
        collapseAllNodes,
        setExpandedState,
        checkNode,
        uncheckNode,

        toggleSelected,
        select,
        deselect,
        clearSelected,
        setSelectedState,

        hoveredNode,
        setHoveredNode,
        getCheckedNodes,
        isNodeChecked,
        isNodeIndeterminate,
    };
}
