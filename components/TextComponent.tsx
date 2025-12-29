import React, { useState, Fragment, useEffect, useRef } from 'react';
import { Stage, Layer, Text, Transformer } from 'react-konva';

interface TextComponentProps {
  x: number;
  y: number;
  fontSize: number;
  fontFamily: string;
  text: string;
  isSelected: boolean;
  width: number;
  color: string;
  align: 'left' | 'center' | 'right';
  onSelect : () => void;
  onChange: (props: any) => void;
  textProps: any;
  onDragStart: (props: any) => void;
}

const TextComponent: React.FC<TextComponentProps> = ({
  x,
  y,
  fontSize,
  fontFamily,
  text,
  isSelected,
  onSelect,
  onChange,
  width,
  textProps,
  color,
  align,
  onDragStart,
}) => {
  const textRef = useRef('');
  const trTextRef = useRef('');
  useEffect(() => {
    if (isSelected) {
      // we need to attach transformer manually
      // @ts-ignore
      trTextRef.current.nodes([textRef.current]);
      // @ts-ignore
      trTextRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  return (
    <Fragment>
      <Text
        text={text}
        fill={color}
        lineHeight={1.15}
        x={x}
        y={y}
        fontSize={fontSize}
        fontFamily={fontFamily}
        draggable
        align={align}
        width={width}
        onClick={onSelect}
        onTap={onSelect}
        onMouseDown={onSelect}
        // @ts-ignore
        ref={textRef}
        perfectDrawEnabled={false}
        onDragEnd={(e) => {
          onChange({
            ...textProps,
            x: e.target.x(),
            y: e.target.y(),
          });
        }}
        onDragStart={(e) => {
          onDragStart({
            ...textProps,
            x: e.target.x(),
            y: e.target.y(),
          })
        }}
        onTransform={(e) => {
          const node = textRef.current;
          // @ts-ignore
          const scaleX = node.scaleX();
          // @ts-ignore
          const scaleY = node.scaleY();
          // @ts-ignore
          node.scaleX(1);
          // @ts-ignore
          node.scaleY(1);
          onChange({
            ...textProps,
            // @ts-ignore
            x: node.x(),
            // @ts-ignore
            y: node.y(),
            // @ts-ignore
            width: node.width() * scaleX,
            scaleX: 1
          });
          // @ts-ignore
          node.scaleX(1);
          // @ts-ignore
          node.scaleY(1);
        }}
      />
      {isSelected && (
        <Transformer
          // @ts-ignore
          ref={trTextRef}
          rotateEnabled={false}
          enabledAnchors={["middle-left", "middle-right"]}
          boundBoxFunc={(oldBox, newBox) => {
            newBox.width = Math.max(30, newBox.width);
            return newBox;
          }}
        />
      )}
    </Fragment>
  );
};

export default TextComponent;