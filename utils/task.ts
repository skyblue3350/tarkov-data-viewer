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

interface TaskTreeNodeData {
    name: string
    children?: TaskTreeNodeData[]
    attributes?: {[key: string]: string}
}

export const getTraders = ():string[] => {
    return traderOrder(Array.from(new Set(taskData.data.tasks.map((task) => task.trader.name))))
}

const convertTaskListToTree = (taskList: TarkovTask[], trader?: string): TaskTreeNodeData[] => {
    const taskMap: {[key: string]: TaskTreeNodeData} = {}

    // 初期化
    taskList.forEach(task => {
        taskMap[task.id] = {
            name: `${task.name}`,
            attributes: {
                id: task.id,
                trader: task.trader.name,
                wikiLink: task.wikiLink,
            },
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

        const rootNodes: TaskTreeNodeData[] = ownerTask.map(task => taskMap[task.id])

        return removeDuplicateNodes(rootNodes)

    } else {
        const rootNodes: TaskTreeNodeData[] = taskList.filter(task => task.taskRequirements.every(req => !taskMap[req.task.id].children?.includes(taskMap[task.id]))).map(task => taskMap[task.id])
        return rootNodes
    }
}

const removeDuplicateNodes = (tree: TaskTreeNodeData[]): TaskTreeNodeData[] => {
    const seen = new Set<string>()

    function checkAndRmoveDuplicates(nodes: TaskTreeNodeData[]): TaskTreeNodeData[] {
        return nodes.filter(node => {
            if (seen.has(node.name)) {
                return false
            }
            seen.add(node.name)
            node.children = checkAndRmoveDuplicates(node.children!)
            return true
        })
    }

    return checkAndRmoveDuplicates(tree)
}

const removeEmptyChildren = (tree: TaskTreeNodeData[]): TaskTreeNodeData[] => {
    return tree.map(node => {
        if (node.children && node.children.length === 0) {
            delete node.children
        }
        return node
    })
}

export const getTaskById = (id: string, node: TaskTreeNodeData): TaskTreeNodeData | undefined => {
    if (node.data.id === id) {
        return node
    }
    if (node.children) {
        for (const child of node.children) {
            const result = getTaskById(id, child)
            if (result) {
                return result
            }
        }
    }
    return undefined
}

export const getTasksByTrader = (trader:string) => {
    return removeEmptyChildren(convertTaskListToTree(taskData.data.tasks, trader))
    
}

export const getAllTasks = () => {
    return removeEmptyChildren(convertTaskListToTree(taskData.data.tasks))
}
