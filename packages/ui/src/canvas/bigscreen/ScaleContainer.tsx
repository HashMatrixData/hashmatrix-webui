import { type ReactNode } from 'react';
import { useContainerSize } from '../../hooks/useContainerSize';

interface ScaleContainerProps {
  /** 设计基准分辨率（大屏按此尺寸绘制后等比缩放）。 */
  baseWidth?: number;
  baseHeight?: number;
  children: ReactNode;
}

/**
 * 数据大屏等比缩放容器（DoD #6，spec 大屏适配决策）。
 * 内容按基准分辨率绘制，再等比 scale 适配真实容器（投屏/拼接屏/4K），居中留边。
 */
export function ScaleContainer({ baseWidth = 1920, baseHeight = 1080, children }: ScaleContainerProps) {
  const [ref, size] = useContainerSize<HTMLDivElement>();
  const scale = size.width > 0 ? Math.min(size.width / baseWidth, size.height / baseHeight) : 0;

  return (
    <div
      ref={ref}
      data-testid="scale-container"
      style={{
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        position: 'relative',
        background: '#0b1f3a',
      }}
    >
      <div
        data-testid="scale-stage"
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: baseWidth,
          height: baseHeight,
          transform: `translate(-50%, -50%) scale(${scale || 0})`,
          transformOrigin: 'center center',
          visibility: scale > 0 ? 'visible' : 'hidden',
        }}
      >
        {children}
      </div>
    </div>
  );
}
