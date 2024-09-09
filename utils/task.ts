import { Tooltip, TreeNodeData } from "@mantine/core";
import taskData from "data/tasks.json";

type TarkovTask = typeof taskData.data.tasks[0]

const traderOrder = (array: string[]): string[] => {
    const traders = ["Prapor", "Therapist", "Skier", "Peacekeeper", "Mechanic", "Ragman", "Jaeger",]
    return array.sort((a, b) => {
        const indexA = traders.indexOf(a);
        const indexB = traders.indexOf(b);

        if (indexA !== -1 && indexB !== -1) {
            return indexA - indexB;
        }
        if (indexA !== -1) {
            return -1;
        }
        if (indexB !== -1) {
            return 1;
        }

        return a.localeCompare(b)
    })
}

interface TaskTreeNodeData extends TreeNodeData {
    data: typeof taskData.data.tasks[0]
    children?: TaskTreeNodeData[]
}

export const getTraders = ():string[] => {
    return traderOrder(Array.from(new Set(taskData.data.tasks.map((task) => task.trader.name))))
}

const convertTaskListToTree = (taskList: TarkovTask[], trader?: string): TreeNodeData[] => {
    const taskMap: {[key: string]: TreeNodeData} = {}

    // 初期化
    taskList.forEach(task => {
        taskMap[task.id] = {
            label: `${task.name}`,
            value: task.id,
            children: []
        }
    })

    // 親子関係を定義
    taskList.forEach(task => {
        task.taskRequirements.forEach(req => {
            const parentTask = taskMap[req.task.id]
            const childTask = taskMap[task.id]
            parentTask.children?.push(childTask)
        })
    })

    if (trader) {
        const ownerTask = taskList.filter(task => task.trader.name === trader)

        const rootNodes: TreeNodeData[] = ownerTask.map(task => taskMap[task.id])

        return removeDuplicateNodes(rootNodes)

    } else {
        const rootNodes: TreeNodeData[] = taskList.filter(task => task.taskRequirements.every(req => !taskMap[req.task.id].children?.includes(taskMap[task.id]))).map(task => taskMap[task.id])
        return rootNodes
    }
}

const removeDuplicateNodes = (tree: TreeNodeData[]): TreeNodeData[] => {
    const seen = new Set<string>()

    function checkAndRmoveDuplicates(nodes: TreeNodeData[]): TreeNodeData[] {
        return nodes.filter(node => {
            if (seen.has(node.value)) {
                return false
            }
            seen.add(node.value)
            node.children = checkAndRmoveDuplicates(node.children!)
            return true
        })
    }

    return checkAndRmoveDuplicates(tree)
}

const removeEmptyChildren = (tree: TreeNodeData[]): TreeNodeData[] => {
    return tree.map(node => {
        if (node.children && node.children.length === 0) {
            delete node.children
        }
        return node
    })
}

export const getTasksByTrader = (trader:string) => {
    return removeEmptyChildren(convertTaskListToTree(taskData.data.tasks, trader))
    
}

export const getAllTasks = () => {
    return removeEmptyChildren(convertTaskListToTree(taskData.data.tasks))
}
