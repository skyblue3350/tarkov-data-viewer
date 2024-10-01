import { Box, Checkbox, Group, RenderTreeNodePayload, Tabs, TreeNodeData, UseTreeInput, UseTreeReturnType } from "@mantine/core";
import { Icon24Hours, IconCheck, IconChevronDown, IconSquare, IconSquareRoot } from "@tabler/icons-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getAllTasks, getTasksByTrader, getTraders } from "utils/task";
import CheckboxTree from "react-checkbox-tree";
import TreeView, { flattenTree, NodeId } from "react-accessible-treeview";
import Tree, { CustomNodeElementProps } from "react-d3-tree";

const traders = getTraders();

const CustomTree = (props: {
    trader: string
}) => {
    const [selected, setSelected] = useState<NodeId[]>([])

    const renderRectSvgNode = useCallback(({nodeDatum, onNodeClick}: CustomNodeElementProps) => {
        return (
            <g>
                <rect width="250" height="100" x="-100" y="-50" onClick={(e) => onNodeClick(e)} fill={selected.includes(nodeDatum.attributes!.id.toString()) ? "#697565" : "#ECDFCC"} />
                <text fill="black" strokeWidth="1" x="-90" y="-25">{nodeDatum.name}</text>
                <a href={nodeDatum.attributes?.wikiLink.toString()} target="_blank"><text x="-90" y="0" strokeWidth="1" fill="blue">wiki</text></a>
                <text fill="black" strokeWidth="1" x="-90" y="25">Trader: {nodeDatum.attributes!.trader}</text>
            </g>
        )
    }, [selected])

    const data = getTasksByTrader(props.trader)
    return (<Box style={{width: "100%", height: "100vh", background: 'white'}}><Tree nodeSize={{x: 300, y:200}} renderCustomNodeElement={renderRectSvgNode} onNodeClick={(node, e) => {
        console.log(node.data.attributes!.id)
        setSelected(selected.includes(node.data.attributes!.id.toString()) ? selected.filter((id) => id !== node.data.attributes!.id.toString()) : [...selected, node.data.attributes!.id.toString()])
    }} collapsible={false} pathFunc={"step"} orientation={"vertical"}  data={data} /></Box>)
}

export function TaskList() {
    return (
        <>
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
