import useKeyboardListener from "@/helpers/keybordListener";
import React from "react";
import { Transformer, Image } from "react-konva"
import useImage from "use-image";

interface ImageElementProps {
  image: {
    src: string;
    alt: string;
    w: number;
    h: number;
  };
  shapeProps: {
    x: number;
    y: number;
    rotation: number;
    id: string;
  };
  isSelected: boolean;
  onSelect: () => void;
  onChange: (newAttrs: any) => void;
  unSelectShape: (id: string | null) => void;
  onDelete: (shapeRef: any) => void;
  onDragStart: (newAttrs: any) => void;
}

export const ImageElement: React.FC<ImageElementProps> = ({
  image,
  shapeProps,
  unSelectShape,
  isSelected,
  onSelect,
  onChange,
  onDelete,
  onDragStart
}) => {
  const shapeRef = React.useRef('');
  const trRef = React.useRef('');
  const [img] = useImage(image.src);

  React.useEffect(() => {
    if (isSelected) {
      // we need to attach transformer manually
      // @ts-ignore
      trRef.current.nodes([shapeRef.current]);
      // @ts-ignore
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);
  // @ts-ignore
  const onMouseEnter = (event) => {
    if (isSelected) {
      event.target.getStage().container().style.cursor = "move";
    }
    if (!isSelected) {
      event.target.getStage().container().style.cursor = "pointer";
    }
  };
  // @ts-ignore
  const onMouseLeave = (event) => {
    event.target.getStage().container().style.cursor = "default";
  };

  const handleDelete = () => {
    unSelectShape(null);
    onDelete(shapeRef.current);
  };

  useKeyboardListener({
    onDelete: handleDelete,
    onBackspace: handleDelete
  });

  return (
    <React.Fragment>
      <Image
        image={img}
        alt={image.alt}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        width={image.w}
        height={image.h}
        onClick={onSelect}
        onTap={onSelect}
        onMouseDown={onSelect}
        // @ts-ignore
        ref={shapeRef}
        {...shapeProps}
        draggable
        onDragEnd={(e) => {
          onChange({
            ...shapeProps,
            x: e.target.x(),
            y: e.target.y(),
          });
        }}
        onDragStart={(e) => {
          onDragStart({
            ...shapeProps,
            x: e.target.x(),
            y: e.target.y(),
          })
        }}
        onTransformEnd={() => {
          const node = shapeRef.current;
          // @ts-ignore
          const scaleX = node.scaleX();
          // @ts-ignore
          const scaleY = node.scaleY();
          onChange({
            ...shapeProps,
            // @ts-ignore
            x: node.x(),
            // @ts-ignore
            y: node.y(),
            // @ts-ignore
            w: Math.max(5, node.width() * scaleX),
            // @ts-ignore
            h: Math.max(5, node.height() * scaleY)
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
          ref={trRef}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 5 || newBox.height < 5) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
    </React.Fragment>
  );
};
