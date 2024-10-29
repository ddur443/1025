import React, { useState, useCallback } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  removeElements,
  Controls,
  Background,
} from 'react-flow-renderer';

const initialElements = [
  {
    id: '1',
    type: 'input',
    data: { label: 'Start' },
    position: { x: 250, y: 5 },
  },
];

const BranchDiagram = () => {
  const [elements, setElements] = useState(initialElements);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);

  const onConnect = (params) => setElements((els) => addEdge(params, els));
  const onElementsRemove = (elementsToRemove) =>
    setElements((els) => removeElements(elementsToRemove, els));
  const onLoad = (rfi) => {
    setReactFlowInstance(rfi);
    rfi.fitView();
  };

  const addNode = useCallback(() => {
    const newNode = {
      id: (elements.length + 1).toString(),
      data: { label: `Node ${elements.length + 1}` },
      position: {
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
      },
    };
    setElements((els) => els.concat(newNode));
  }, [elements]);

  return (
    <div style={{ height: 500 }}>
      <ReactFlowProvider>
        <ReactFlow
          elements={elements}
          onConnect={onConnect}
          onElementsRemove={onElementsRemove}
          onLoad={onLoad}
          deleteKeyCode={46} /* 'delete'-key */
        >
          <Controls />
          <Background />
        </ReactFlow>
        <button onClick={addNode}>Add Node</button>
      </ReactFlowProvider>
    </div>
  );
};

export default BranchDiagram;
