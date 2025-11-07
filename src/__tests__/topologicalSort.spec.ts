import {
  topologicalSort,
  type TopologicalSortNode,
  type TopologicalSortError,
} from '../index';

interface ExtendedNode extends TopologicalSortNode<ExtendedNode> {
  data?: any;
  version?: string;
}
describe('topologicalSort', () => {
  // 成功排序测试用例
  test('should correctly sort nodes with a simple linear dependency and return original node references (object dependencies)', () => {
    const nodeA: ExtendedNode = { name: 'A' };
    const nodeB: ExtendedNode = { name: 'B', dependencies: [nodeA] };
    const nodeC: ExtendedNode = { name: 'C', dependencies: [nodeB] };
    const nodes: Array<ExtendedNode> = [nodeA, nodeB, nodeC];
    const expected = [[nodeA], [nodeB], [nodeC]];
    const result = topologicalSort(nodes);
    expect(result).toEqual(expected);
    expect(result![0][0]).toBe(nodeA);
    expect(result![1][0]).toBe(nodeB);
    expect(result![2][0]).toBe(nodeC);
  });

  test('should correctly sort nodes when dependencies are specified as strings', () => {
    const nodeA: ExtendedNode = { name: 'A' };
    const nodeB: ExtendedNode = { name: 'B', dependencies: ['A'] };
    const nodeC: ExtendedNode = { name: 'C', dependencies: ['B'] };
    const nodes: Array<ExtendedNode> = [nodeA, nodeB, nodeC];
    const expected = [[nodeA], [nodeB], [nodeC]];
    const result = topologicalSort(nodes);
    expect(result).toEqual(expected);
    expect(result![0][0]).toBe(nodeA);
    expect(result![1][0]).toBe(nodeB);
    expect(result![2][0]).toBe(nodeC);
  });

  test('should correctly sort nodes when dependencies are a mix of objects and strings', () => {
    const nodeA: ExtendedNode = { name: 'A' };
    const nodeB: ExtendedNode = { name: 'B', dependencies: [nodeA, 'D'] }; // B depends on A (object) and D (string)
    const nodeC: ExtendedNode = { name: 'C', dependencies: ['A'] }; // C depends on A (string)
    const nodeD: ExtendedNode = { name: 'D' };
    const nodeE: ExtendedNode = { name: 'E', dependencies: [nodeB, 'C'] }; // E depends on B (object) and C (string)
    const nodes: Array<ExtendedNode> = [nodeA, nodeB, nodeC, nodeD, nodeE];
    const expected = [[nodeA, nodeD], [nodeB, nodeC], [nodeE]];
    const result = topologicalSort(nodes);
    expect(result).toEqual(expected);
    expect(result![0]).toContain(nodeA);
    expect(result![0]).toContain(nodeD);
    expect(result![1]).toContain(nodeB);
    expect(result![1]).toContain(nodeC);
    expect(result![2][0]).toBe(nodeE);
  });

  test('should handle nodes with no dependencies correctly, placing them in the first batch and returning original references', () => {
    const nodeZ: ExtendedNode = { name: 'Z' };
    const nodeY: ExtendedNode = { name: 'Y' };
    const nodeX: ExtendedNode = { name: 'X', dependencies: [nodeY] };
    const nodes: Array<ExtendedNode> = [nodeZ, nodeX, nodeY];
    const expected = [[nodeY, nodeZ], [nodeX]];
    const result = topologicalSort(nodes);
    expect(result).toEqual(expected);
    expect(result![0]).toContain(nodeY);
    expect(result![0]).toContain(nodeZ);
    expect(result![0].length).toBe(2);
    expect(result![1][0]).toBe(nodeX);
  });

  test('should return a single batch for all independent nodes, sorted by name, and return original references', () => {
    const nodeC: ExtendedNode = { name: 'C' };
    const nodeA: ExtendedNode = { name: 'A' };
    const nodeB: ExtendedNode = { name: 'B' };
    const nodes: Array<ExtendedNode> = [nodeC, nodeA, nodeB];
    const expected = [[nodeA, nodeB, nodeC]];
    const result = topologicalSort(nodes);
    expect(result).toEqual(expected);
    expect(result![0][0]).toBe(nodeA);
    expect(result![0][1]).toBe(nodeB);
    expect(result![0][2]).toBe(nodeC);
  });

  test('should return an empty array for an empty input node list', () => {
    const nodes: Array<ExtendedNode> = [];
    expect(topologicalSort(nodes)).toEqual([]);
  });

  test('should ensure nodes within the same batch are sorted alphabetically by name and return original references', () => {
    const taskA: ExtendedNode = { name: 'TaskA' };
    const taskB: ExtendedNode = { name: 'TaskB' };
    const taskC: ExtendedNode = { name: 'TaskC', dependencies: [taskA] };
    const nodes: Array<ExtendedNode> = [taskC, taskB, taskA];
    const expected = [[taskA, taskB], [taskC]];
    const result = topologicalSort(nodes);
    expect(result).toEqual(expected);
    expect(result![0][0]).toBe(taskA);
    expect(result![0][1]).toBe(taskB);
    expect(result![1][0]).toBe(taskC);
  });

  test('should preserve additional properties of extended node types', () => {
    const nodeA: ExtendedNode = {
      name: 'A',
      data: { value: 10 },
      version: '1.0',
    };
    const nodeB: ExtendedNode = {
      name: 'B',
      dependencies: [nodeA],
      data: { value: 20 },
    };
    const nodeC: ExtendedNode = {
      name: 'C',
      dependencies: [nodeB],
      data: 'some string',
    };
    const nodes: Array<ExtendedNode> = [nodeA, nodeB, nodeC];
    const result = topologicalSort(nodes);
    expect(result).toEqual([[nodeA], [nodeB], [nodeC]]);
    expect(result![0][0]).toBe(nodeA);
    expect(result![1][0]).toBe(nodeB);
    expect(result![2][0]).toBe(nodeC);
    expect(result![0][0].data).toEqual({ value: 10 });
    expect(result![0][0].version).toBe('1.0');
    expect(result![1][0].data).toEqual({ value: 20 });
    expect(result![1][0].version).toBeUndefined();
    expect(result![2][0].data).toBe('some string');
  });

  // 错误处理测试用例
  test('should throw an error for duplicate node names by default', () => {
    const nodeA1: ExtendedNode = { name: 'A' };
    const nodeB: ExtendedNode = { name: 'B' };
    const nodeA2: ExtendedNode = { name: 'A' }; // Duplicate
    const nodes: Array<ExtendedNode> = [nodeA1, nodeB, nodeA2];
    expect(() => topologicalSort(nodes)).toThrow(
      "Duplicate node name detected: 'A'",
    );
  });
  test('should throw an error for an unknown dependency specified as a string by default', () => {
    const nodeA: ExtendedNode = { name: 'A' };
    const nodeB: ExtendedNode = { name: 'B', dependencies: ['C'] }; // C is unknown
    const nodes: Array<ExtendedNode> = [nodeA, nodeB];
    expect(() => topologicalSort(nodes)).toThrow(
      "Node 'B' depends on unknown node 'C'",
    );
  });

  test('should throw an error for an unknown dependency specified as an object by default', () => {
    const nodeA: ExtendedNode = { name: 'A' };
    const unknownNodeC: ExtendedNode = { name: 'C' }; // This node is not in the input 'nodes' array
    const nodeB: ExtendedNode = { name: 'B', dependencies: [unknownNodeC] };
    const nodes: Array<ExtendedNode> = [nodeA, nodeB];
    expect(() => topologicalSort(nodes)).toThrow(
      "Node 'B' depends on unknown node 'C'",
    );
  });

  test('should throw an error for a circular dependency by default (object dependencies)', () => {
    const nodeA: ExtendedNode = { name: 'A', dependencies: [{ name: 'B' }] };
    const nodeB: ExtendedNode = { name: 'B', dependencies: [{ name: 'C' }] };
    const nodeC: ExtendedNode = { name: 'C', dependencies: [{ name: 'A' }] };
    const nodes: Array<ExtendedNode> = [nodeA, nodeB, nodeC];
    expect(() => topologicalSort(nodes)).toThrow(
      "Circular dependency detected among nodes: 'A', 'B', 'C'",
    );
  });

  test('should throw an error for a circular dependency by default (string dependencies)', () => {
    const nodeA: ExtendedNode = { name: 'A', dependencies: ['B'] };
    const nodeB: ExtendedNode = { name: 'B', dependencies: ['C'] };
    const nodeC: ExtendedNode = { name: 'C', dependencies: ['A'] };
    const nodes: Array<ExtendedNode> = [nodeA, nodeB, nodeC];
    expect(() => topologicalSort(nodes)).toThrow(
      "Circular dependency detected among nodes: 'A', 'B', 'C'",
    );
  });

  test('should throw an error for a self-referencing circular dependency (string dependency)', () => {
    const nodeA: ExtendedNode = { name: 'A', dependencies: ['A'] };
    const nodes: Array<ExtendedNode> = [nodeA];
    expect(() => topologicalSort(nodes)).toThrow(
      "Circular dependency detected among nodes: 'A'",
    );
  });

  test('should throw an error for a more complex circular dependency (mixed dependencies)', () => {
    const task1: ExtendedNode = { name: 'Task1', dependencies: ['Task2'] };
    const task2: ExtendedNode = {
      name: 'Task2',
      dependencies: [{ name: 'Task3' }],
    };
    const task3: ExtendedNode = {
      name: 'Task3',
      dependencies: ['Task1', 'Task4'],
    };
    const task4: ExtendedNode = { name: 'Task4' };
    const nodes: Array<ExtendedNode> = [task1, task2, task3, task4];
    expect(() => topologicalSort(nodes)).toThrow(
      "Circular dependency detected among nodes: 'Task1', 'Task2', 'Task3'",
    );
  });

  // 自定义错误处理测试用例
  test('should call custom onError handler for duplicate node names', () => {
    const mockOnError = jest.fn();
    const nodeA1: ExtendedNode = { name: 'A' };
    const nodeB: ExtendedNode = { name: 'B' };
    const nodeA2: ExtendedNode = { name: 'A' }; // Duplicate
    const nodes: Array<ExtendedNode> = [nodeA1, nodeB, nodeA2];
    topologicalSort(nodes, mockOnError);
    expect(mockOnError).toHaveBeenCalledTimes(1);
    expect(mockOnError).toHaveBeenCalledWith({
      errorType: 'duplicateNode',
      node: nodeA2,
    });
  });

  test('should call custom onError handler for unknown dependency (string dependency)', () => {
    const mockOnError = jest.fn();
    const nodeA: ExtendedNode = { name: 'A' };
    const nodeB: ExtendedNode = { name: 'B', dependencies: ['C'] };
    const nodes: Array<ExtendedNode> = [nodeA, nodeB];
    topologicalSort(nodes, mockOnError);
    expect(mockOnError).toHaveBeenCalledTimes(1);
    expect(mockOnError).toHaveBeenCalledWith({
      errorType: 'unknownDependency',
      node: nodeB,
      dependencyNodeName: 'C', // 验证 dependencyNodeName
    });
  });

  test('should call custom onError handler for unknown dependency (object dependency)', () => {
    const mockOnError = jest.fn();
    const nodeA: ExtendedNode = { name: 'A' };
    const unknownNodeC: ExtendedNode = { name: 'C' };
    const nodeB: ExtendedNode = { name: 'B', dependencies: [unknownNodeC] };
    const nodes: Array<ExtendedNode> = [nodeA, nodeB];
    topologicalSort(nodes, mockOnError);
    expect(mockOnError).toHaveBeenCalledTimes(1);
    expect(mockOnError).toHaveBeenCalledWith({
      errorType: 'unknownDependency',
      node: nodeB,
      dependencyNodeName: 'C', // 验证 dependencyNodeName
    });
  });

  test('should call custom onError handler for circular dependency', () => {
    const mockOnError = jest.fn();
    const nodeX: ExtendedNode = { name: 'X', dependencies: ['Y'] };
    const nodeY: ExtendedNode = { name: 'Y', dependencies: [nodeX] }; // Mixed dependency types
    const nodes: Array<ExtendedNode> = [nodeX, nodeY];
    topologicalSort(nodes, mockOnError);
    expect(mockOnError).toHaveBeenCalledTimes(1);
    expect(mockOnError).toHaveBeenCalledWith(
      expect.objectContaining({
        errorType: 'circularDependency',
        remainingNodes: expect.arrayContaining([
          expect.objectContaining({ name: 'X' }),
          expect.objectContaining({ name: 'Y' }),
        ]),
      }),
    );
    const errorArg = mockOnError.mock
      .calls[0][0] as TopologicalSortError<ExtendedNode>;
    if (errorArg.errorType === 'circularDependency') {
      expect(errorArg.remainingNodes).toContain(nodeX);
      expect(errorArg.remainingNodes).toContain(nodeY);
      expect(errorArg.remainingNodes.length).toBe(2);
    }
  });

  test('should return null when custom onError handler is provided and does not throw', () => {
    const mockOnError = jest.fn(() => {
      /* do nothing */
    });
    const nodeA1: ExtendedNode = { name: 'A' };
    const nodeB: ExtendedNode = { name: 'B' };
    const nodeA2: ExtendedNode = { name: 'A' }; // Duplicate
    const nodes: Array<ExtendedNode> = [nodeA1, nodeB, nodeA2];
    const result = topologicalSort(nodes, mockOnError);
    expect(result).toBeNull();
    expect(mockOnError).toHaveBeenCalledTimes(1);
  });
});
