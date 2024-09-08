import { Checkbox, Group, RenderTreeNodePayload, Tabs, Tree, TreeNodeData, UseTreeInput, UseTreeReturnType } from "@mantine/core";
import { IconChevronDown } from "@tabler/icons-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getAllTasks, getTasksByTrader, getTraders } from "utils/task";
import { useTree } from "../hooks/useTree";

const renderTreeNode = ({
    node,
    expanded,
    hasChildren,
    elementProps,
    tree,
  }: RenderTreeNodePayload) => {
    const checked = tree.isNodeChecked(node.value);
    
    return (
      <Group gap="xs" {...elementProps}>
        <Checkbox.Indicator
          checked={checked}
          indeterminate={false}
          onClick={() => {checked ? tree.uncheckNode(node.value) : tree.checkNode(node.value)}}
        />
  
        <Group gap={5} onClick={() => tree.toggleExpanded(node.value)}>
          <span>{node.label}</span>
            {hasChildren && <IconChevronDown
              size={18}
              style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
            />}
        </Group>
      </Group>
    );
  };

const traders = getTraders();

const CustomTree = (props: {
    localstorageKey: string
    data: TreeNodeData[]
}) => {
    const tree = useTree({
        localstorageKey: props.localstorageKey
    })
    return <Tree data={props.data} levelOffset={23} expandOnClick={false} renderNode={renderTreeNode} tree={tree} />
}

export function TaskList() {
    

    return (
        <>
            <CustomTree localstorageKey="All" data={getAllTasks()} />
            {/* <Tabs defaultValue="Therapist">
                <Tabs.List justify="center">
                    {traders.map((trader) => <Tabs.Tab key={trader} value={trader}>{trader}</Tabs.Tab>)}
                </Tabs.List>

                {traders.map((trader) => {
                    const tree = useTree()
                    return <Tabs.Panel key={trader} value={trader}>
                        <CustomTree localstorageKey={trader} data={getTasksByTrader(trader)} />
                    </Tabs.Panel>
                })}
            </Tabs> */}
        </>
  );
}
