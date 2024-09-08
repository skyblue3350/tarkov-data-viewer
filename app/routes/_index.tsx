import type { MetaFunction } from "@remix-run/node";
import { TaskList } from "./../components/TaskList";


export const meta: MetaFunction = () => {
  return [
    { title: "Tarkov Task Tree Viewer" },
    { name: "description", content: "Welcome to Tarkov Task Tree Viewer!" },
  ];
};

export default function Index() {
  return (
    <div>
      <TaskList />
    </div>
  );
}
