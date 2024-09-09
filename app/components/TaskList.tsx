import { Checkbox, Group, RenderTreeNodePayload, Tabs, Tree, TreeNodeData, UseTreeInput, UseTreeReturnType } from "@mantine/core";
import { Icon24Hours, IconCheck, IconChevronDown, IconSquare, IconSquareRoot } from "@tabler/icons-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getAllTasks, getTasksByTrader, getTraders } from "utils/task";
import CheckboxTree from "react-checkbox-tree";

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
    trader: string
}) => {
    const [checked, setChecked] = useState<string[]>([])
    const [expanded, setExpanded] = useState<string[]>([])
    const size = 12

    return <CheckboxTree
    nodes={getTasksByTrader(props.trader)}
    checked={checked}
    expanded={expanded}
    onCheck={(checked) => setChecked(checked)}
    onExpand={(expanded) => setExpanded(expanded)}
    showExpandAll
    showNodeIcon={false}
    optimisticToggle={false}
    noCascade={true}
    icons={{
        expandClose: <IconChevronDown size={size} />,
        expandOpen: <IconChevronDown size={size} style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }} />,
        check: <IconCheck size={size} />,
        uncheck: <IconSquare size={size} />,
        leaf: <Icon24Hours size={size} />,
    }}
/>
}

export function TaskList() {
    return (
        <>
            {/* <CustomTree localstorageKey="All" data={getAllTasks()} /> */}
            <Tabs defaultValue="Prapor">
                <Tabs.List justify="center">
                    {traders.map((trader) => <Tabs.Tab key={trader} value={trader}>{trader}</Tabs.Tab>)}
                </Tabs.List>

                {traders.map((trader) => {
                    return <Tabs.Panel key={trader} value={trader}>
                        <CustomTree trader={trader} />
                    </Tabs.Panel>
                })}
            </Tabs>
        </>
  );
}
