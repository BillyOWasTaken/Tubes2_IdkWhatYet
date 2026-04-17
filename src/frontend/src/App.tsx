import { TreeView } from "./TreeView";
import { tree } from "./Sample.tsx";

export default function App() {
  return (
    <div>
      <h1>DOM Tree</h1>
      {tree.root && <TreeView root={tree.root} />}
    </div>
  );
}