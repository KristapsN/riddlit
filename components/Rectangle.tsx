// import React, { useRef, useEffect, Fragment } from "react";
// import { Stage, Layer, Rect, Circle, Text, Transformer } from "react-konva"


// const Rectangle = ({ shapeProps, isSelected, onSelect, onChange }) => {
//   const shapeRef = useRef();
//   const trRef = useRef();

//   useEffect(() => {
//     if (isSelected) {
//       // we need to attach transformer manually
//       trRef.current.nodes([shapeRef.current]);
//       trRef.current.getLayer().batchDraw();
//     }
//   }, [isSelected]);

//   return (
//     <Fragment>
//       <Text
//         text={shapeProps.value}
//         x={shapeProps.initialPosition.x / 2}
//         y={shapeProps.initialPosition.y / 2}
//         fontSize={shapeProps.size}
//         fontFamily={shapeProps.font}
//         draggable
//         onClick={onSelect}
//         onTap={onSelect}
//         ref={shapeRef}
//         {...shapeProps}
//         onDragEnd={(e) => {
//           shapeProps.initialPosition.x = e.target.x()
//           shapeProps.initialPosition.y = e.target.y()
//         }}
//         // onDragEnd={(e) => {
//         //   onChange({
//         //     ...shapeProps,
//         //     x: e.target.x(),
//         //     y: e.target.y(),
//         //   });
//         // }}
//         onTransformEnd={(e) => {
//           const node = shapeRef.current;
//           const scaleX = node.scaleX();
//           const scaleY = node.scaleY();
//           node.scaleX(1);
//           node.scaleY(1);
//           onChange({
//             ...shapeProps,
//             x: node.x(),
//             y: node.y(),
//             // width: Math.max(5, node.width() * scaleX),
//             // height: Math.max(5, node.height() * scaleY),
//           });
//           // node.scaleX(1);
//           // node.scaleY(1);
//         }}
//       />
//       {isSelected && (
//         <Transformer
//           ref={trRef}
//           flipEnabled={false}
//           boundBoxFunc={(oldBox, newBox) => {
//             // limit resize
//             if (Math.abs(newBox.width) < 5 || Math.abs(newBox.height) < 5) {
//               return oldBox;
//             }
//             return newBox;
//           }}
//         />
//       )}
//     </Fragment>
//   );
// };