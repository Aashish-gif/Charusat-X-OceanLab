import React, { memo } from 'react';
import { BaseEdge, EdgeLabelRenderer, getBezierPath, EdgeProps } from 'reactflow';

interface CustomEdgeData {
  connectionType?: 'database' | 'public' | 'private' | 'internet';
}

type CustomEdgeProps = EdgeProps & {
  data?: CustomEdgeData;
};

const CustomEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  data = {},
  markerEnd,
}: CustomEdgeProps) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  // Determine edge color based on connection type
  const getConnectionColor = () => {
    switch (data.connectionType) {
      case 'database':
        return '#10B981'; // Green for database connections
      case 'public':
        return '#3B82F6'; // Blue for public traffic
      case 'private':
        return '#8B5CF6'; // Purple for private connections
      case 'internet':
        return '#EF4444'; // Red for internet connections
      default:
        return '#6B7280'; // Gray for default connections
    }
  };

  // Determine animation based on connection type
  const getAnimationStyle = () => {
    if (data.connectionType === 'database' || data.connectionType === 'public') {
      return {
        animation: 'pulse 2s infinite',
      };
    }
    return {};
  };

  const strokeColor = getConnectionColor();

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          stroke: strokeColor,
          strokeWidth: 2,
          ...getAnimationStyle(),
        }}
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            fontSize: '12px',
            padding: '2px 4px',
            backgroundColor: 'rgba(255,255,255,0.8)',
            borderRadius: '4px',
            pointerEvents: 'all',
          }}
          className="nodrag nopan"
        >
          {data.connectionType}
        </div>
      </EdgeLabelRenderer>
      <style>{`
        @keyframes pulse {
          0% { opacity: 0.6; }
          50% { opacity: 1; }
          100% { opacity: 0.6; }
        }
      `}</style>
    </>
  );
};

export default memo(CustomEdge);