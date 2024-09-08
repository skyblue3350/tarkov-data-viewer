import { Tooltip, TreeNodeData } from "@mantine/core";
import taskData from "data/tasks.json";

type TarkovTask = typeof taskData.data.tasks

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
}

const convertTaskToTreeNode = (topTasks: TarkovTask, otherTasks: TarkovTask): TaskTreeNodeData[] => {
    // 他のタスクがない場合は終了
    if (otherTasks.length === 0) {
        return topTasks.map(task => {
            return {
                label: task.name,
                value: task.id,
                data: task,
                children: []
            }
        })
    }

    // 他のタスクから親タスクを見つけて、子タスクを追加
    return topTasks.map(task => {
        const children = otherTasks.filter(otherTask => otherTask.taskRequirements.some(requirement => requirement.task.name === task.name))
        return {
            label: task.name,
            value: task.id,
            data: task,
            children: convertTaskToTreeNode(children, otherTasks.filter(otherTask => !children.includes(otherTask)))
        }
    })
}

export const getTraders = ():string[] => {
    return traderOrder(Array.from(new Set(taskData.data.tasks.map((task) => task.trader.name))))
}

export const getTasksByTrader = (trader:string) => {
    const tasks = taskData.data.tasks.filter((task) => task.trader.name === trader)
    const topTask = tasks.filter(task => task.taskRequirements.length === 0)
    const otherTasks = tasks.filter(task => task.taskRequirements.length > 0)
    return convertTaskToTreeNode(topTask, otherTasks)
    
}

export const getAllTasks = () => {
    const tasks = taskData.data.tasks
    const topTask = tasks.filter(task => task.taskRequirements.length === 0)
    const otherTasks = tasks.filter(task => task.taskRequirements.length > 0)
    return convertTaskToTreeNode(topTask, otherTasks)
}
