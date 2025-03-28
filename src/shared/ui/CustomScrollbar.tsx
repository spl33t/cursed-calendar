import React, { useEffect, useRef, useState, ReactNode, forwardRef, useImperativeHandle } from 'react';

interface CustomScrollbarProps {
  children: ReactNode;
  height?: string | number;
  width?: string | number;
  trackColor?: string;
  thumbColor?: string;
  thumbHoverColor?: string;
  showXScrollbar?: boolean;
  showYScrollbar?: boolean;
  scrollbarSize?: number;
  scrollbarRadius?: number;
  className?: string;
  style?: React.CSSProperties;
  onScroll?: (event: React.UIEvent<HTMLDivElement>) => void;
}

export interface CustomScrollbarRef {
  contentRef: React.RefObject<HTMLDivElement>;
  scrollToLeft: (left: number) => void;
  scrollToTop: (top: number) => void;
}

export const CustomScrollbar = forwardRef<CustomScrollbarRef, CustomScrollbarProps>(({
  children,
  height = '100%',
  width = '100%',
  trackColor = '#f1f1f1',
  thumbColor = '#c1c1c1',
  thumbHoverColor = '#a1a1a1',
  showXScrollbar = true,
  showYScrollbar = true,
  scrollbarSize = 8,
  scrollbarRadius = 4,
  className = '',
  style = {},
  onScroll
}, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const xThumbRef = useRef<HTMLDivElement>(null);
  const yThumbRef = useRef<HTMLDivElement>(null);
  
  const [isDraggingX, setIsDraggingX] = useState(false);
  const [isDraggingY, setIsDraggingY] = useState(false);
  const [startDragX, setStartDragX] = useState(0);
  const [startDragY, setStartDragY] = useState(0);
  const [startScrollLeft, setStartScrollLeft] = useState(0);
  const [startScrollTop, setStartScrollTop] = useState(0);
  
  // Экспортируем API для родительского компонента через forwardRef
  useImperativeHandle(ref, () => ({
    contentRef: contentRef as React.RefObject<HTMLDivElement>,
    scrollToLeft: (left: number) => {
      if (contentRef.current) {
        contentRef.current.scrollLeft = left;
      }
    },
    scrollToTop: (top: number) => {
      if (contentRef.current) {
        contentRef.current.scrollTop = top;
      }
    }
  }));
  
  // Обновление положения скроллбаров при прокрутке
  const updateScrollbars = () => {
    if (!containerRef.current || !contentRef.current) return;
    
    const container = containerRef.current;
    const content = contentRef.current;
    
    // Вычисляем видимость скроллбаров
    const hasXScrollbar = content.scrollWidth > container.clientWidth;
    const hasYScrollbar = content.scrollHeight > container.clientHeight;
    
    // Обновляем горизонтальный скроллбар
    if (hasXScrollbar && xThumbRef.current && showXScrollbar) {
      const { scrollLeft, clientWidth, scrollWidth } = content;
      const thumbWidth = Math.max((clientWidth / scrollWidth) * clientWidth, 30);
      const thumbX = (scrollLeft / (scrollWidth - clientWidth)) * (clientWidth - thumbWidth);
      
      xThumbRef.current.style.width = `${thumbWidth}px`;
      xThumbRef.current.style.transform = `translateX(${thumbX}px)`;
      xThumbRef.current.style.display = 'block';
    } else if (xThumbRef.current) {
      xThumbRef.current.style.display = 'none';
    }
    
    // Обновляем вертикальный скроллбар
    if (hasYScrollbar && yThumbRef.current && showYScrollbar) {
      const { scrollTop, clientHeight, scrollHeight } = content;
      const thumbHeight = Math.max((clientHeight / scrollHeight) * clientHeight, 30);
      const thumbY = (scrollTop / (scrollHeight - clientHeight)) * (clientHeight - thumbHeight);
      
      yThumbRef.current.style.height = `${thumbHeight}px`;
      yThumbRef.current.style.transform = `translateY(${thumbY}px)`;
      yThumbRef.current.style.display = 'block';
    } else if (yThumbRef.current) {
      yThumbRef.current.style.display = 'none';
    }
  };
  
  // Обработчик скролла
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    updateScrollbars();
    if (onScroll) {
      onScroll(e);
    }
  };
  
  // Обработчики для горизонтального скроллбара
  const handleXThumbMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!contentRef.current) return;
    
    setIsDraggingX(true);
    setStartDragX(e.clientX);
    setStartScrollLeft(contentRef.current.scrollLeft);
  };
  
  // Обработчики для вертикального скроллбара
  const handleYThumbMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!contentRef.current) return;
    
    setIsDraggingY(true);
    setStartDragY(e.clientY);
    setStartScrollTop(contentRef.current.scrollTop);
  };
  
  // Обработчик движения мыши
  const handleMouseMove = (e: MouseEvent) => {
    if (!contentRef.current || !containerRef.current) return;
    
    const content = contentRef.current;
    const container = containerRef.current;
    
    if (isDraggingX) {
      const deltaX = e.clientX - startDragX;
      const scrollRatio = content.scrollWidth / container.clientWidth;
      content.scrollLeft = startScrollLeft + deltaX * scrollRatio;
    }
    
    if (isDraggingY) {
      const deltaY = e.clientY - startDragY;
      const scrollRatio = content.scrollHeight / container.clientHeight;
      content.scrollTop = startScrollTop + deltaY * scrollRatio;
    }
  };
  
  // Обработчик отпускания мыши
  const handleMouseUp = () => {
    setIsDraggingX(false);
    setIsDraggingY(false);
  };
  
  // Инициализация скроллбаров и обработчиков событий
  useEffect(() => {
    if (!containerRef.current || !contentRef.current) return;
    
    const content = contentRef.current;
    
    updateScrollbars();
    
    content.addEventListener('scroll', handleScroll as any);
    window.addEventListener('resize', updateScrollbars);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseleave', handleMouseUp);
    
    return () => {
      content.removeEventListener('scroll', handleScroll as any);
      window.removeEventListener('resize', updateScrollbars);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseUp);
    };
  }, [isDraggingX, isDraggingY, startDragX, startDragY, startScrollLeft, startScrollTop, onScroll]);
  
  return (
    <div 
      ref={containerRef}
      className={`custom-scrollbar-container ${className}`}
      style={{
        width,
        height,
        overflow: 'hidden',
        position: 'relative',
        ...style
      }}
    >
      <div
        ref={contentRef}
        className="custom-scrollbar-content"
        style={{
          width: '100%',
          height: '100%',
          overflow: 'auto',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}
        onScroll={handleScroll}
      >
        <style>
          {`
            .custom-scrollbar-content::-webkit-scrollbar {
              display: none;
            }
            .custom-scrollbar-thumb:hover {
              background-color: ${thumbHoverColor};
            }
          `}
        </style>
        
        {children}
      </div>
      
      {/* Горизонтальный скроллбар */}
      {showXScrollbar && (
        <div
          className="custom-scrollbar-track horizontal"
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: showYScrollbar ? scrollbarSize : 0,
            height: scrollbarSize,
            backgroundColor: trackColor,
            borderRadius: scrollbarRadius,
            zIndex: 100
          }}
        >
          <div
            ref={xThumbRef}
            className="custom-scrollbar-thumb"
            style={{
              position: 'absolute',
              height: '100%',
              backgroundColor: thumbColor,
              borderRadius: scrollbarRadius,
              cursor: 'pointer'
            }}
            onMouseDown={handleXThumbMouseDown}
          />
        </div>
      )}
      
      {/* Вертикальный скроллбар */}
      {showYScrollbar && (
        <div
          className="custom-scrollbar-track vertical"
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: showXScrollbar ? scrollbarSize : 0,
            width: scrollbarSize,
            backgroundColor: trackColor,
            borderRadius: scrollbarRadius,
            zIndex: 100
          }}
        >
          <div
            ref={yThumbRef}
            className="custom-scrollbar-thumb"
            style={{
              position: 'absolute',
              width: '100%',
              backgroundColor: thumbColor,
              borderRadius: scrollbarRadius,
              cursor: 'pointer'
            }}
            onMouseDown={handleYThumbMouseDown}
          />
        </div>
      )}
    </div>
  );
}); 