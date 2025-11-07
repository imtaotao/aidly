// https://en.wikipedia.org/wiki/Topological_sorting
interface DuplicateNodeError<T> {
  errorType: 'duplicateNode';
  node: TopologicalSortNode<T>;
}

interface UnknownDependencyError<T> {
  errorType: 'unknownDependency';
  node: TopologicalSortNode<T>;
  dependencyNodeName: string;
}

interface CircularDependencyError<T> {
  errorType: 'circularDependency';
  remainingNodes: Array<TopologicalSortNode<T>>;
}

export type TopologicalSortError<T> =
  | DuplicateNodeError<T>
  | UnknownDependencyError<T>
  | CircularDependencyError<T>;

export interface TopologicalSortNode<T> {
  name: string;
  dependencies?: Array<T | string>;
}

const defaultOnError = <T>(e: TopologicalSortError<T>): never | void => {
  switch (e.errorType) {
    case 'duplicateNode':
      throw new Error(`Duplicate node name detected: '${e.node?.name}'`);
    case 'unknownDependency':
      throw new Error(
        `Node '${e.node?.name}' depends on unknown node '${e.dependencyNodeName}'`,
      );
    case 'circularDependency':
      throw new Error(
        `Circular dependency detected among nodes: ${
          e.remainingNodes?.map((n) => `'${n.name}'`).join(', ') || 'unknown'
        }`,
      );
    default:
      throw new Error(`An unknown topological sort error occurred`);
  }
};

export function topologicalSort<T extends TopologicalSortNode<T>>(
  nodes: Array<T>,
  onError = defaultOnError,
) {
  const nodeMap = new Map<string, T>();
  const inDegree = new Map<string, number>();
  const reverseAdjacencyList = new Map<string, Array<string>>();

  for (const node of nodes) {
    if (nodeMap.has(node.name)) {
      onError({
        node,
        errorType: 'duplicateNode',
      });
      return null;
    }
    nodeMap.set(node.name, node);
    inDegree.set(node.name, 0);
    reverseAdjacencyList.set(node.name, []);
  }

  for (const node of nodes) {
    for (const dependency of node.dependencies || []) {
      const name =
        typeof dependency === 'string' ? dependency : dependency.name;
      if (!nodeMap.has(name)) {
        onError({
          node,
          dependencyNodeName: name,
          errorType: 'unknownDependency',
        });
        return null;
      }
      inDegree.set(node.name, (inDegree.get(node.name) || 0) + 1);
      reverseAdjacencyList.get(name)?.push(node.name);
    }
  }

  const processQueue: Array<string> = [];
  for (const [nodeName, degree] of inDegree.entries()) {
    if (degree === 0) {
      processQueue.push(nodeName);
    }
  }

  let processedCount = 0;
  const sortedBatches: Array<Array<T>> = [];

  while (processQueue.length > 0) {
    const currentBatchNames: Array<string> = [];
    const nextBatchQueue: Array<string> = [];

    while (processQueue.length > 0) {
      const currentNodeName = processQueue.shift()!;
      processedCount++;
      currentBatchNames.push(currentNodeName);

      for (const nodeName of reverseAdjacencyList.get(currentNodeName) || []) {
        inDegree.set(nodeName, (inDegree.get(nodeName) || 0) - 1);
        if (inDegree.get(nodeName) === 0) {
          nextBatchQueue.push(nodeName);
        }
      }
    }
    if (currentBatchNames.length > 0) {
      currentBatchNames.sort();
      sortedBatches.push(currentBatchNames.map((name) => nodeMap.get(name)!));
    }
    processQueue.push(...nextBatchQueue);
  }

  if (processedCount !== nodes.length) {
    const remainingNodes = nodes.filter(
      (node) => (inDegree.get(node.name) || 0) > 0,
    );
    onError({
      remainingNodes,
      errorType: 'circularDependency',
    });
    return null;
  }

  return sortedBatches;
}
