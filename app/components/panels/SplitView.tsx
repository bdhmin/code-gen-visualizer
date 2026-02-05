'use client';

import { useState, useRef, useCallback, useEffect, ReactNode, Children, Fragment } from 'react';

interface SplitViewProps {
  children: ReactNode;
  direction?: 'horizontal' | 'vertical';
  initialSizes?: number[];
  minSize?: number;
}

export function SplitView({
  children,
  direction = 'horizontal',
  initialSizes,
  minSize = 50,
}: SplitViewProps) {
  const childArray = Children.toArray(children);
  const childCount = childArray.length;
  const dividerCount = childCount - 1;
  const dividerWidth = 4; // px
  const defaultSizes = initialSizes || childArray.map(() => 100 / childCount);
  const [sizes, setSizes] = useState<number[]>(defaultSizes);
  const containerRef = useRef<HTMLDivElement>(null);
  const draggingIndex = useRef<number | null>(null);

  // Sync sizes with children count
  useEffect(() => {
    if (sizes.length !== childCount) {
      setSizes(initialSizes ?? Array.from({ length: childCount }, () => 100 / childCount));
    }
  }, [childCount, initialSizes, sizes.length]);

  const handleMouseDown = useCallback((index: number) => {
    draggingIndex.current = index;
    document.body.style.cursor = direction === 'horizontal' ? 'col-resize' : 'row-resize';
    document.body.style.userSelect = 'none';

    const handleMouseMove = (e: MouseEvent) => {
      if (draggingIndex.current === null || !containerRef.current) return;

      const container = containerRef.current;
      const rect = container.getBoundingClientRect();
      const totalDividerSize = dividerCount * dividerWidth;
      const totalSize = (direction === 'horizontal' ? rect.width : rect.height) - totalDividerSize;
      const position = direction === 'horizontal' ? e.clientX - rect.left : e.clientY - rect.top;
      
      // Adjust position to account for dividers before this point
      const idx = draggingIndex.current!;
      const adjustedPosition = position - (idx * dividerWidth) - (dividerWidth / 2);
      const percentage = (adjustedPosition / totalSize) * 100;

      setSizes((prevSizes) => {
        const newSizes = [...prevSizes];
        
        let cumulative = 0;
        for (let i = 0; i < idx; i++) {
          cumulative += prevSizes[i];
        }

        const minPercentage = (minSize / totalSize) * 100;
        const newLeftSize = Math.max(minPercentage, Math.min(percentage - cumulative, 100 - minPercentage));
        const diff = newLeftSize - prevSizes[idx];
        
        newSizes[idx] = newLeftSize;
        newSizes[idx + 1] = Math.max(minPercentage, prevSizes[idx + 1] - diff);

        return newSizes;
      });
    };

    const handleMouseUp = () => {
      draggingIndex.current = null;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [direction, minSize, dividerCount]);

  // Calculate width/height using calc to account for dividers
  const totalDividerPx = dividerCount * dividerWidth;

  return (
    <div
      ref={containerRef}
      className={`flex h-full w-full ${direction === 'horizontal' ? 'flex-row' : 'flex-col'}`}
    >
      {childArray.map((child, index) => (
        <Fragment key={index}>
          <div
            style={{
              [direction === 'horizontal' ? 'width' : 'height']: 
                `calc((100% - ${totalDividerPx}px) * ${sizes[index] / 100})`,
              flexShrink: 0,
              flexGrow: 0,
            }}
            className="overflow-hidden h-full"
          >
            {child}
          </div>
          {index < childArray.length - 1 && (
            <div
              onMouseDown={() => handleMouseDown(index)}
              style={{
                [direction === 'horizontal' ? 'width' : 'height']: `${dividerWidth}px`,
                flexShrink: 0,
              }}
              className={`
                ${direction === 'horizontal' ? 'cursor-col-resize h-full' : 'cursor-row-resize w-full'}
                bg-zinc-800 hover:bg-cyan-500 transition-colors
              `}
            />
          )}
        </Fragment>
      ))}
    </div>
  );
}
