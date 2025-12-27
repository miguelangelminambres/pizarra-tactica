import React, { useState, useRef, useEffect } from 'react';
import { 
  Users, Circle, Triangle, Minus, Square, Type, MousePointer, Trash2, 
  ArrowRight, MoveRight, Download, Maximize,
  Ruler, Goal, Disc, RectangleHorizontal, CircleDot,
  Save, FolderOpen, Plus, X, Loader2
} from 'lucide-react';
import { supabase } from './supabase';

// Colores de equipos
const TEAM_COLORS = {
  blue: { fill: '#3b82f6', stroke: '#2563eb', name: 'Azul' },
  red: { fill: '#ef4444', stroke: '#dc2626', name: 'Rojo' },
  yellow: { fill: '#eab308', stroke: '#ca8a04', name: 'Amarillo' },
  white: { fill: '#f8fafc', stroke: '#cbd5e1', name: 'Blanco' },
  black: { fill: '#1e293b', stroke: '#0f172a', name: 'Negro' },
  green: { fill: '#22c55e', stroke: '#16a34a', name: 'Verde' },
  orange: { fill: '#f97316', stroke: '#ea580c', name: 'Naranja' },
  purple: { fill: '#a855f7', stroke: '#9333ea', name: 'Morado' }
};

// Tamaños de jugadores
const PLAYER_SIZES = {
  small: { radius: 14, fontSize: 11, label: 'S', name: 'Pequeño' },
  medium: { radius: 18, fontSize: 14, label: 'M', name: 'Mediano' },
  large: { radius: 24, fontSize: 18, label: 'L', name: 'Grande' }
};

// Tamaños de equipo
const EQUIPMENT_SIZES = {
  small: { scale: 0.6, label: 'S' },
  medium: { scale: 1, label: 'M' },
  large: { scale: 1.5, label: 'L' }
};

// Imágenes de equipo desde servidor
const EQUIPMENT_IMAGES = {
  smallGoal: 'https://toplidercoach.com/wp-content/uploads/2025/12/small-goal-2.png',
  stickRed: 'https://toplidercoach.com/wp-content/uploads/2025/12/stick1.png',
  stickYellow: 'https://toplidercoach.com/wp-content/uploads/2025/12/stick2.png',
  wall: 'https://toplidercoach.com/wp-content/uploads/2025/12/wall.png',
  ball: 'https://toplidercoach.com/wp-content/uploads/2025/12/ball1.png',
  cone: 'https://toplidercoach.com/wp-content/uploads/2025/12/cone2.png',
  goalSmall: 'https://toplidercoach.com/wp-content/uploads/2025/12/goal1.png',
  goalMedium: 'https://toplidercoach.com/wp-content/uploads/2025/12/goal2.png',
  goalLarge: 'https://toplidercoach.com/wp-content/uploads/2025/12/goal3.png',
  manikin: 'https://toplidercoach.com/wp-content/uploads/2025/12/manikin.png',
  marker: 'https://toplidercoach.com/wp-content/uploads/2025/12/small-cone-3.png'
};

// Tipos de equipo con sus propiedades base
const EQUIPMENT_TYPES = {
  ball: { name: 'Balón', baseWidth: 50, baseHeight: 54 },
  cone: { name: 'Cono', baseWidth: 54, baseHeight: 59 },
  marker: { name: 'Marcador', baseWidth: 60, baseHeight: 60 },
  stickRed: { name: 'Pica Roja', baseWidth: 42, baseHeight: 60 },
  stickYellow: { name: 'Pica Amarilla', baseWidth: 42, baseHeight: 70 },
  wall: { name: 'Barrera', baseWidth: 58, baseHeight: 60 },
  smallGoal: { name: 'Mini Portería', baseWidth: 60, baseHeight: 50 },
  goalSmall: { name: 'Portería S', baseWidth: 63, baseHeight: 53 },
  goalMedium: { name: 'Portería M', baseWidth: 62, baseHeight: 52 },
  goalLarge: { name: 'Portería L', baseWidth: 58, baseHeight: 55 },
  manikin: { name: 'Maniquí', baseWidth: 48, baseHeight: 67 }
};

const CONE_COLORS = [
  { id: 'orange', color: '#f97316' },
  { id: 'yellow', color: '#eab308' },
  { id: 'blue', color: '#3b82f6' },
  { id: 'red', color: '#ef4444' },
  { id: 'green', color: '#22c55e' },
  { id: 'white', color: '#f8fafc' }
];

const LINE_COLORS = [
  { color: '#ffffff', name: 'Blanco' },
  { color: '#ef4444', name: 'Rojo' },
  { color: '#eab308', name: 'Amarillo' },
  { color: '#22c55e', name: 'Verde' },
  { color: '#3b82f6', name: 'Azul' },
  { color: '#000000', name: 'Negro' }
];

// Componente Jugador con tamaño variable
const Player = ({ player, isSelected, onSelect, onDrag, onEditNumber }) => {
  const teamColor = TEAM_COLORS[player.color] || TEAM_COLORS.blue;
  const vestColor = TEAM_COLORS[player.vestColor] || TEAM_COLORS.yellow;
  const sizeConfig = PLAYER_SIZES[player.size] || PLAYER_SIZES.medium;
  const textColor = ['yellow', 'white'].includes(player.color) ? '#1e293b' : '#ffffff';

  return (
    <g
      transform={`translate(${player.x}, ${player.y})`}
      style={{ cursor: 'move' }}
      onMouseDown={(e) => onSelect(player.id, e)}
      onDoubleClick={() => onEditNumber(player.id)}
    >
      {player.hasVest && (
        <circle 
          r={sizeConfig.radius + 4} 
          fill="none" 
          stroke={vestColor.fill} 
          strokeWidth="4" 
          strokeDasharray="8 4" 
        />
      )}
      <circle 
        r={sizeConfig.radius} 
        fill={teamColor.fill} 
        stroke={isSelected ? '#22c55e' : teamColor.stroke} 
        strokeWidth={isSelected ? 3 : 2} 
      />
      {player.showNumber && player.number && (
        <text 
          textAnchor="middle" 
          dominantBaseline="central" 
          fill={textColor} 
          fontSize={sizeConfig.fontSize} 
          fontWeight="600" 
          fontFamily="system-ui"
        >
          {player.number}
        </text>
      )}
    </g>
  );
};

// Componente Equipment con imágenes
const Equipment = ({ item, isSelected, onSelect }) => {
  const sizeConfig = EQUIPMENT_SIZES[item.size] || EQUIPMENT_SIZES.medium;
  const typeConfig = EQUIPMENT_TYPES[item.type] || { baseWidth: 50, baseHeight: 50 };
  const width = typeConfig.baseWidth * sizeConfig.scale;
  const height = typeConfig.baseHeight * sizeConfig.scale;
  const image = EQUIPMENT_IMAGES[item.type];
  
  return (
    <g
      transform={`translate(${item.x}, ${item.y})`}
      style={{ cursor: 'move' }}
      onMouseDown={(e) => onSelect(item.id, e)}
    >
      {isSelected && (
        <rect 
          x={-width/2 - 4} 
          y={-height/2 - 4} 
          width={width + 8} 
          height={height + 8} 
          fill="none" 
          stroke="#22c55e" 
          strokeWidth="2" 
          strokeDasharray="4 2" 
          rx="4"
        />
      )}
      {image ? (
        <image
          href={image}
          x={-width/2}
          y={-height/2}
          width={width}
          height={height}
          preserveAspectRatio="xMidYMid meet"
        />
      ) : (
        <circle r={20 * sizeConfig.scale} fill={item.color || '#f97316'} />
      )}
    </g>
  );
};

// Componente TextLabel
const TextLabel = ({ item, isSelected, onSelect, onEdit }) => (
  <g
    transform={`translate(${item.x}, ${item.y})`}
    style={{ cursor: 'move' }}
    onMouseDown={(e) => onSelect(item.id, e)}
    onDoubleClick={() => onEdit(item.id)}
  >
    {isSelected && (
      <rect x="-50" y="-14" width="100" height="28" fill="none" stroke="#22c55e" strokeWidth="2" rx="4" />
    )}
    <text textAnchor="middle" dominantBaseline="central" fill="#ffffff" fontSize="16" fontWeight="500" fontFamily="system-ui">
      {item.text}
    </text>
  </g>
);

// Componente Line/Arrow
const DrawingLine = ({ line, isSelected, onSelect }) => {
  const dx = line.x2 - line.x1;
  const dy = line.y2 - line.y1;
  const angle = Math.atan2(dy, dx);
  const headLen = 12;

  return (
    <g onMouseDown={(e) => onSelect(line.id, e)} style={{ cursor: 'pointer' }}>
      <line
        x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2}
        stroke={line.color} strokeWidth={isSelected ? 4 : 3}
        strokeDasharray={line.dashed ? '10 5' : 'none'}
      />
      {line.hasArrow && (
        <polygon
          points={`${line.x2},${line.y2} ${line.x2 - headLen * Math.cos(angle - 0.4)},${line.y2 - headLen * Math.sin(angle - 0.4)} ${line.x2 - headLen * Math.cos(angle + 0.4)},${line.y2 - headLen * Math.sin(angle + 0.4)}`}
          fill={line.color}
        />
      )}
    </g>
  );
};

// Componente Rectángulo editable
const EditableRect = ({ shape, isSelected, onSelect, onResize }) => {
  return (
    <g onMouseDown={(e) => onSelect(shape.id, e)} style={{ cursor: 'move' }}>
      <rect
        x={shape.x}
        y={shape.y}
        width={shape.width}
        height={shape.height}
        fill={shape.fill || 'transparent'}
        stroke={shape.color}
        strokeWidth={isSelected ? 4 : 3}
        strokeDasharray={shape.dashed ? '10 5' : 'none'}
        rx="2"
      />
      {isSelected && (
        <>
          {/* Handles de redimensión */}
          <circle cx={shape.x} cy={shape.y} r="6" fill="#22c55e" style={{ cursor: 'nw-resize' }} 
            onMouseDown={(e) => { e.stopPropagation(); onResize(shape.id, 'nw', e); }} />
          <circle cx={shape.x + shape.width} cy={shape.y} r="6" fill="#22c55e" style={{ cursor: 'ne-resize' }}
            onMouseDown={(e) => { e.stopPropagation(); onResize(shape.id, 'ne', e); }} />
          <circle cx={shape.x} cy={shape.y + shape.height} r="6" fill="#22c55e" style={{ cursor: 'sw-resize' }}
            onMouseDown={(e) => { e.stopPropagation(); onResize(shape.id, 'sw', e); }} />
          <circle cx={shape.x + shape.width} cy={shape.y + shape.height} r="6" fill="#22c55e" style={{ cursor: 'se-resize' }}
            onMouseDown={(e) => { e.stopPropagation(); onResize(shape.id, 'se', e); }} />
        </>
      )}
    </g>
  );
};

// Componente Círculo/Elipse editable
const EditableEllipse = ({ shape, isSelected, onSelect, onResize }) => {
  const cx = shape.x + shape.rx;
  const cy = shape.y + shape.ry;
  
  return (
    <g onMouseDown={(e) => onSelect(shape.id, e)} style={{ cursor: 'move' }}>
      <ellipse
        cx={cx}
        cy={cy}
        rx={shape.rx}
        ry={shape.ry}
        fill={shape.fill || 'transparent'}
        stroke={shape.color}
        strokeWidth={isSelected ? 4 : 3}
        strokeDasharray={shape.dashed ? '10 5' : 'none'}
      />
      {isSelected && (
        <>
          {/* Handles de redimensión */}
          <circle cx={cx - shape.rx} cy={cy} r="6" fill="#22c55e" style={{ cursor: 'ew-resize' }}
            onMouseDown={(e) => { e.stopPropagation(); onResize(shape.id, 'w', e); }} />
          <circle cx={cx + shape.rx} cy={cy} r="6" fill="#22c55e" style={{ cursor: 'ew-resize' }}
            onMouseDown={(e) => { e.stopPropagation(); onResize(shape.id, 'e', e); }} />
          <circle cx={cx} cy={cy - shape.ry} r="6" fill="#22c55e" style={{ cursor: 'ns-resize' }}
            onMouseDown={(e) => { e.stopPropagation(); onResize(shape.id, 'n', e); }} />
          <circle cx={cx} cy={cy + shape.ry} r="6" fill="#22c55e" style={{ cursor: 'ns-resize' }}
            onMouseDown={(e) => { e.stopPropagation(); onResize(shape.id, 's', e); }} />
        </>
      )}
    </g>
  );
};

// Imágenes de campo en base64 (WebP)
const FIELD_IMAGES = {
  full: 'data:image/webp;base64,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b+A5PzKAa7qRG5csknJBv9+f/ovUNw50n//8RL/U/1/xf+Op/r/7XstdiNwtq1rd749B4IDcvQBreK5vOdYKW+L2r2sbZ/DYpYfMaExkf///9//if47tsv//1/9r+3msKQk+ufSOOgyXXKHjguxqzynikj8MV2NWXcW9bfl6TbGcNH1QstybYZNEXB5TxSZ7etXTZt1O9txb1AdWBa4g1mUoOXfSIi//+d/of/+P//5lfofI13f+/P/0f9T/X//9H/U/qT/1nDKj0WY3xr3Pxv4pJwXXx32v+5/vv/+1/uf75izVr+Id/zv///t/7r++Ob3QLQ/YIlDvbcW+A3rV02b1irOVwv67rr/PKeP3lBr5bmFexcWx4n0bcUkflF03VUVIMTELLrFPFCtE5MRu4feUXiBlOuLpaX+r/rw///AanrTujKjXRL////qf6/+1/////f/4n+P/l/tAMfqSG1/zQPEkzOwkp9KOF/vN/zv////9VRKjf///9Mxq7o6gorh97/f/4n+P//37Kk51gWniL5dqql5U3yW0Fdql5S0iSeMpVUcYsofzeg9kKLOMQbIgiulbkPPqja9NamDy1MUXKpwa41hQsztubbwZ6rCzx3WFw3n5LaDYrta+g9HXyAeLMWU5t67wLG5vZKrdRZ7Qa+jr5APFmLEwjr43Jj12+dDpZGhIkssjoZ8qwIsggf/8bNzEgjCbbb4YXltHifrhXgR6npTPSAEE/An5gI9rTv76OvOuGo7Kkw6WBvnWdbE4OQXGqwXSEl48r4GOt82eUszv/r/h/8b/JW/1/xf+P/lr/7X1gEKjt6/4tL73/hfRs/3PoRA+p//5yYT/H/y////+pP/////3lZ9Z+37U7h97/f/4n+OpLwet8xDcW9bewRMTEKHIQs0uFm671oCxhmctsaYhvUITcfB5TxdhVFlV+UYa7C5SuFCkU8UG9ZthUNDfs9WPq/l/53///24/+X+9UwGdgkOeP//7//E/x/8v/OZ////H/y/1mjpr//v/4WzCR3fks0MW59wsc/D///+o+/w/2Yutn53//if///V/1/9qxlA/wkECr63zENxdghDnC7PgDuUZw2Dttshlni3wmzCaSaQa9onybZMeVZ9txb1t7DzgjC5SXYvzGpiFM4bzHkG1pX///6b72b/nf//////+6/vv//6k//+X////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',
  half: 'data:image/webp;base64,UklGRog5AABXRUJQVlA4WAoAAAAgAAAArwQAHwMASUNDUMgBAAAAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADZWUDggmjcAAPDlAZ0BKrAEIAM+USiSRqOiJiEgczjYwAoJZ27yFYaf+7CGpZnGl5WxPLvH+L/y/hO3X5PvoB9ov7VX+08Muoy80j0HD038C8yP1h/4vqP1O5ghVcW6cP4DNH8SHTx8Dtf/Pntx/Yf+c/Af/J/57/ce4B+on6z9jj+uegT+lf4n9vfdM/Dv3Of6b/G+wB/Vf+H61Xrm+hN52X/s9o39v/269ov//9nv00/ZL0jyG+R20uRXf5/MAu5nEh/RbByaX5S/rjgOg76b3pSWHTnLEIPqkI855xq/emKKQ8oZyrd5FkA3CKILotfIZLoLdEumXVSCYXu6HUb8rTQ5KA9NOJxDH3VdYqvLUWBuEhWQkoPnaxyzlH/7zBRuEWm3AyQ5d28KZgfcf9zHgokTFgyCiihjHru77OiFTHxLVk6El3qWgyzxrE2qQ8SIwNr4fglx7FcuRgbXwIrD0MkwJlrBeC8FcwXTisk3MS1CL7B+T///////3P/////////8feMS/////+y//vSZGn7Qixza/p7QlEe8H6OPha3FyzSovDcP9VR/yf8L+5/////m+gPXx/77//nf///L/xP/+l/l44J533b3IDiHoZJw0cDX0VLWZvZvppwu7VFOEkI6zOdynvVD1KgX+FhGTNr4HIX6lQ9S0MrU7ytmAq63utZDT+2F4VQ2vlo/fGWcySTOD3wjIjg+AUDnc8SARZ3SN+inDc8EFHZ3SOLtr0QP5OUSmDL0UFebhdt0R9BCmVwiXTNheL+RFoH2YBNa93BrORc+PPxMj4oiPDM12Tp6XuMisz4rmLRsoG2NdMszhkJ9TGipCL319gki0bSPLg2dWbgbWC0M3oqQi9+p6HGYeX7t0iQqq20EUmtSwma2uQ1SNO0tHYSCDeK0T5ayJmqdRwss2RApVCvGIDyBkvDsUR67V3DudIxMhnKwRESCO+LxQ/TES9rqJyhLms5urEhpZYyNcqcVFsRYfP/MOkR+x4/p4ivorKmiHT2fADfTwXXeXwiZizaoLmYFi7EM6zVBT3O9dAuj+WSgaBycQ229eVMt900bxB9LOMkm+SVjZl2aC+zF0jr5HnFNaCpMsDnU+EiizTWxsqbT7kRsNnYL/VYIE7PUNXYyF/WqStll6Werpgq1dkEll9Rlbvd5tPckf6KL9/rqWLpuiy6hL4TVfZ52swh0ETTjejs9h2vIOoeELsnSPaeW8Yi/8T+9+/1iUCqzn+v/pfrbXP+Q/fcflRsrHx/2pdxrfff/879nwrLPJ3+Mrf//j/3xP+CcDgHX/1/9Jn/T/zvCQiVTxhvjglME2hu3Ixadp+ttilzON8ZaXa1AffyPzh3QSfRRFtoiZtMlryHxLWAdY0fajqI9BpXSyYWaAVcBLPOqdFkiWedU6LJEtUuyRjmUcSpXm9Yd9erKjSyj3Gwtjgp/Cno/+P/vv8B+wVv8//J73epx0L5H/B/ufgy////ijzO/xlb//8f+5n/OYullT2/Lf/9b/P/g+jA/Otoq89EU23TMeaTGSYRpYlrA+FwQ+JakozWECJm2sBtT9zmFay0TivgGhj/nFfATrK2QFbH/OGG95snpOHASP/9HbcfV8H//////////i5+lW91YX///vvxnjVdva//////J/wv/+f////+9HP/yV6uu9LNef//2///KfZPeDDf///X/0v8v/E/vScN/z7e27sy15EU4aMMtTIfHHi3odmxmFrl5OQA5g5wVMK5BLZ6MD+urLGUX1ZtcwxZiyxlKg7ABfN6+NlPPZ1tbmsEPTAqIoes+4qM2ZUYkp4IIypEPMDa+BtewrEzD/bwkLLtsFMP+ElNuWXVE6j+ORycBlqjuWzlYJR1QuF1zYkDktBni5riiblUOYB9Nj8wNXpK6Z12hKFTEZp3rLPpkgRRv8+Wqr/PsIjAt1XkrGfxdFP81WM//p7z25Lb0eXSO0/ZDp6f6J8y8tPee34fAT4hUjPL3uLqEOKN+jmaS+yzfifF/4bGr22uatc/2JUs90mOIg4aW2VMpTui1F2KKBfvVAlqi3Yh/ZeF6otRzvl02owNtN6HThARNzOdYehk6RDgXo0Eu1KShxe7z2qP//of//PX/0v///o//pkVYPdJTCxtT/B/////T///+l/l/4h3+N/uosPk7k/5f///yf/+t/ns3S5Cr/6X//c/1/9L/L/xFP/09EKCfdxgCrZWyAlv1+ytkFwEJr0PQyTBhNa3amultjmriwDrEONveuwI008vEVEYG18DVOfEzy2ITWOXgP//////z/8n///5M5eNvTb++/2////sv////ff2/82dBWNS///WjHYDyO2nxe/qI/Tzx//+g09l6gKbq3//ff2/9b/P/yWH/B3kecV8BRCdZWyAlv0VKIgPezYMkwP7k5pYlqD2461+jdJpzpMteQ8SIwNr4HNywnPjtV8lhl3ZM////y/8T+9/DP2Oc/1/9L/L/xDv8b++/t//+P/ff2/////5f+J/e//8v//s3YA78M8dli+qa4isodf/yzDLu8HHIV1Rj1qjob6CnmcH0584W+duGWZwViN/TaTddkx7/nx6FB5GagklY2q/RPPpqGfjWxfGti8vVvysBHWIc9CDSauiwrv8lH2cYHe8s59VIeyd7cb+sJ/Kf6YGDF8tX2sJ/KfnYrIogQYvY9K9Sb3z3Kz1vMG2DjPYj/Oz+u98VCzSY0IgWlkKGPI/HYmV5PKPNml3VUmIu5P5v+9fs//4////Q/8sl/l/4ny3z6dEv8v/EOVc/1/hqgN/o/wf/7R///z/8levuovgY74P9z/X//8odIAwN3sV1Tovte6HxLUlKWZJgf3Ke3OsPQyOdiWoPar4G18CKw6cICJj/lC8u8eXimPAOmAiQYyWGY/2f///r//+F/c/2dl5gvnkP19eMBbQ23IaYKLcPoHvfgBUqxHJYOdmoDuU+zkTee0DgLA9SP5eMJlVtb5EHv18/WDjujTXQO2PW1jLpnXaEl1ZeL1N+q6i1k00vs1vtXX/8Q/HnEUlP9aWM7XNlDodiblTgX+/wg1Fo4ABcTnlALr+v/////H/vv7cS19n7Py/2Kz0zsS1QBMaJtRYPXa6ImbXnq7hPAo4ojt4aR/1LxeDvRM9S3Guc6cCs4oVj1dNi4AzVTqXsQukpNS4c51gxasrZAVxpypidVgq////qv89f/S/y/8T+9H//////////e/oRzu4DEJw5bAHRQWVM2sBTa//L///+WgMUUIvNyUB0ZWBvYAN+/7P+n/nf45/+T+yzRx+9f/S//7n///2/9aE/+De1tK0tsgtQTD0GWqAn04ZVUBTIdRjFh7c9FAgRT6RYBBaCpoC629wXDEkGSSHuPbh6Ajc/nvLQNGPzbBEzo7SX2nWD+S1RFwZbELHW9ym1NOs0rJnrNIezLB/pfkAZHMWecF3/TcDxpdttvzYVvzCtIJpSASHmKdPGP/mmR6QW9jL7kVBstANQd9FdOSHXpm+EcTf5FAjNQRQIvjbA7R42qkN/aoJM1TSqlvq4YuApfZMBem2aTAinEjZHmP/9xt/zfb6gdDxjBb4nknYNfH/M/4398T/g/3P///twv7n+v/pf5bEldyk564LFDkPMDo618CKw9DJMTdrXlP7k60GLXYQPKCX3qgSzxrE2qQ8SIwNr4Gqc+do5lMVVngeQkf/X/0r/PLb6v+f/k/4X9yJ/e/2f////5P+F/c/4csWknyR+3/rfzDKMT/63+f///////4X9z/X///////8v/E/vf/+kf+lnHLfrv6/ZeF6otR1EdDGqUth8W3O6LUdFknmPDT0qpFKh6lQxqkPiWqItcWAdYdOBeW5qt9j8J////////5//////3P+u9/s/6f+d/jn/5P7oH7lOym+ZV/z//+1z1acHjAZP1v///////J/wv7n///2////////P//8BX09erzivgKINEoe92rKlLvUqHrmJWyArZSndRFA3oZJgf2CpUPUqGNUh8S1SzY5CvFBpPhiN3xw7yjOv////////T//////b//+0r////////+F/c/1/9L//uf6/7zcHPwxKRc02mF1z/////yf8Iv/E/vf///c//8n/C/uf/+XbGtKxMkRpPu4wBVsrZAY0GM6boQI6/xN1LVsrVS9l79Saj5/+87tWIwNr4G2m9D0MkwPe9rHiLbPQ5Ed4kRfrobvBPOzL2erQ95ZZnOmZpvtkpfcd0U1iuOSnkNTQ7sWzPR+850rUHBE6iyvFfxhJIseyTckv1UmGg2mro6wh/yJy/////6f//e/D////C//5/1X2n3X+t2HBqc+P/fdG9Y5/s//+IKL/n/Vfaf5Df77/e7UxAtv86z/X+LBNl5ve+hghzPBRjmPj4NdI93J1l/vVAlrBugHTKDWJtctR0Wo6LMO+eUO8VQL/CSDUyZtfB6ZFYehkmB73nN0IBX3nLkiDGf73///3In97///7n//Ep5dt5P+F/c/13v9n/T///+l//3P6mjc+bfvoDR73/1779i01jp6P//b/1v8//J/wi/8T///4X9yX/+Xjak6p1EdGCJtUh8SgU2owNwO93ILiTetlbH5W7DJMD+wVKh6lQxfDzHmEs858TPLZZj/Z+6/13XZf/////+ct/o/5f+J/ej/M/43hd8af/k/8GTMwoF//cf//+3/rOf6/+l/l/4h3+N/ff2///On7/wa6R7uUJ0Ux8S5ElUAHTKDWJtbKLWd6lRgibqShDICbUJDTuCHxLVLudiDS+lYhSKbU66GyW283+f9V//339v/W9L/8lL/L/xP///hF/4n97/Z//8T///pMJtSaW4egOq///7H+n//3v///uf6/+kz/p////S/y1Ypir3/2ualfoHkFZ43fThlQ0pd+rwXhL6wVgrBJZrjXGEWVkaV/uSzLVAlqgCJtUpbS2hWAdwPcaW5S0HaOi1HRezo9nxLSRtN9IKDIoqxOHoZHOxLVF/HNqC9u87wO0RM2vg5nOrody35scIJJXvVr1W/////////vv7f///2f//E/vf1wfwar////W/z/8nxi+Nb/W//CHa9V2PI/Hk/1///C+R+d/x/74n/B/Xuap5L//k2aGMf//3g1f0NCAib03M51h6HbEBWxHU4DljgbXwNrb0O0dOIcDa/Rfy1hkmEaEKlQ9SjzJHIAAP3h/0t/+QY+G3r65iv/52D/Vv/XfoKkjYu/oolooTLWvuA8NDEDwCqen0YtqMl/al99cF14V3BMeyCmJYEGTRFStHc1VkTxpfl4Wb37eTX7enGKcB5yyKhc6k6KFmEAT9UOma6g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',
  blank: 'data:image/webp;base64,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'
};

// Campo de fútbol con imagen de fondo
const SoccerField = ({ type, width, height }) => {
  return (
    <image
      href={FIELD_IMAGES[type]}
      x="0"
      y="0"
      width={width}
      height={height}
      preserveAspectRatio="xMidYMid slice"
    />
  );
};

export default function TacticalBoard() {
  const svgRef = useRef(null);
  const [fieldType, setFieldType] = useState('full');
  const [activeTool, setActiveTool] = useState('select');
  const [selectedColor, setSelectedColor] = useState('blue');
  const [selectedSize, setSelectedSize] = useState('medium');
  const [showNumbers, setShowNumbers] = useState(true);
  const [hasVest, setHasVest] = useState(false);
  const [vestColor, setVestColor] = useState('yellow');
  const [equipmentColor, setEquipmentColor] = useState('#f97316');
  const [equipmentSize, setEquipmentSize] = useState('medium');
  const [lineColor, setLineColor] = useState('#ffffff');
  const [lineDashed, setLineDashed] = useState(false);
  const [projectName, setProjectName] = useState('Mi táctica');
  
  const [players, setPlayers] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [texts, setTexts] = useState([]);
  const [lines, setLines] = useState([]);
  const [shapes, setShapes] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [playerCounts, setPlayerCounts] = useState({});
  
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState(null);
  const [tempShape, setTempShape] = useState(null);
  
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState(null);
  const [resizeStart, setResizeStart] = useState(null);

  const [expandedSection, setExpandedSection] = useState('players');
  
  // Modal de edición
  const [editModal, setEditModal] = useState({ open: false, type: null, id: null, value: '' });
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  
  // Supabase - Gestión de pizarras
  const [savedBoards, setSavedBoards] = useState([]);
  const [currentBoardId, setCurrentBoardId] = useState(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const canvasWidth = 850;
  const canvasHeight = 550;

  const getMousePos = (e) => {
    const svg = svgRef.current;
    const rect = svg.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const handleCanvasClick = (e) => {
    if (e.target !== svgRef.current && e.target.tagName !== 'rect' && e.target.tagName !== 'image') return;
    if (isDrawing || isResizing) return;
    
    const pos = getMousePos(e);

    if (activeTool === 'player') {
      const counts = { ...playerCounts };
      counts[selectedColor] = (counts[selectedColor] || 0) + 1;
      const newPlayer = {
        id: Date.now(),
        x: pos.x,
        y: pos.y,
        color: selectedColor,
        size: selectedSize,
        number: showNumbers ? counts[selectedColor] : '',
        showNumber: showNumbers,
        hasVest,
        vestColor
      };
      setPlayers([...players, newPlayer]);
      setPlayerCounts(counts);
      setSelectedId(newPlayer.id);
    } else if (activeTool === 'text') {
      const text = prompt('Introduce el texto:', 'Texto');
      if (text) {
        const newText = { id: Date.now(), x: pos.x, y: pos.y, text };
        setTexts([...texts, newText]);
        setSelectedId(newText.id);
      }
    } else if (['ball', 'cone', 'marker', 'stickRed', 'stickYellow', 'wall', 'smallGoal', 'goalSmall', 'goalMedium', 'goalLarge', 'manikin'].includes(activeTool)) {
      const newEquip = { id: Date.now(), x: pos.x, y: pos.y, type: activeTool, color: equipmentColor, size: equipmentSize };
      setEquipment([...equipment, newEquip]);
      setSelectedId(newEquip.id);
    } else if (activeTool === 'select') {
      setSelectedId(null);
    }
  };

  const handleCanvasMouseDown = (e) => {
    if (isResizing) return;
    
    const pos = getMousePos(e);
    
    if (['arrow', 'line', 'rectangle', 'ellipse'].includes(activeTool)) {
      setIsDrawing(true);
      setDrawStart(pos);
      
      if (activeTool === 'rectangle') {
        setTempShape({ type: 'rect', x: pos.x, y: pos.y, width: 0, height: 0 });
      } else if (activeTool === 'ellipse') {
        setTempShape({ type: 'ellipse', x: pos.x, y: pos.y, rx: 0, ry: 0 });
      } else {
        setTempShape({ type: 'line', x1: pos.x, y1: pos.y, x2: pos.x, y2: pos.y });
      }
    }
  };

  const handleCanvasMouseMove = (e) => {
    const pos = getMousePos(e);

    // Redimensionar formas
    if (isResizing && resizeHandle && selectedId) {
      const shape = shapes.find(s => s.id === selectedId);
      if (shape) {
        let updates = {};
        
        if (shape.type === 'rect') {
          switch (resizeHandle) {
            case 'se':
              updates = { width: Math.max(20, pos.x - shape.x), height: Math.max(20, pos.y - shape.y) };
              break;
            case 'sw':
              updates = { x: Math.min(pos.x, shape.x + shape.width - 20), width: Math.max(20, shape.x + shape.width - pos.x), height: Math.max(20, pos.y - shape.y) };
              break;
            case 'ne':
              updates = { y: Math.min(pos.y, shape.y + shape.height - 20), width: Math.max(20, pos.x - shape.x), height: Math.max(20, shape.y + shape.height - pos.y) };
              break;
            case 'nw':
              updates = { x: Math.min(pos.x, shape.x + shape.width - 20), y: Math.min(pos.y, shape.y + shape.height - 20), width: Math.max(20, shape.x + shape.width - pos.x), height: Math.max(20, shape.y + shape.height - pos.y) };
              break;
          }
        } else if (shape.type === 'ellipse') {
          const cx = shape.x + shape.rx;
          const cy = shape.y + shape.ry;
          switch (resizeHandle) {
            case 'e':
              updates = { rx: Math.max(15, pos.x - cx) };
              break;
            case 'w':
              updates = { rx: Math.max(15, cx - pos.x), x: pos.x };
              break;
            case 's':
              updates = { ry: Math.max(15, pos.y - cy) };
              break;
            case 'n':
              updates = { ry: Math.max(15, cy - pos.y), y: pos.y };
              break;
          }
        }
        
        setShapes(shapes.map(s => s.id === selectedId ? { ...s, ...updates } : s));
      }
      return;
    }

    // Dibujar nueva forma
    if (isDrawing && drawStart) {
      if (activeTool === 'rectangle') {
        const width = pos.x - drawStart.x;
        const height = pos.y - drawStart.y;
        setTempShape({
          type: 'rect',
          x: width > 0 ? drawStart.x : pos.x,
          y: height > 0 ? drawStart.y : pos.y,
          width: Math.abs(width),
          height: Math.abs(height)
        });
      } else if (activeTool === 'ellipse') {
        const rx = Math.abs(pos.x - drawStart.x) / 2;
        const ry = Math.abs(pos.y - drawStart.y) / 2;
        setTempShape({
          type: 'ellipse',
          x: Math.min(drawStart.x, pos.x),
          y: Math.min(drawStart.y, pos.y),
          rx,
          ry
        });
      } else {
        setTempShape({ type: 'line', x1: drawStart.x, y1: drawStart.y, x2: pos.x, y2: pos.y });
      }
    }

    // Arrastrar elementos
    if (isDragging && selectedId) {
      const newX = pos.x - dragOffset.x;
      const newY = pos.y - dragOffset.y;

      setPlayers(players.map(p => p.id === selectedId ? { ...p, x: newX, y: newY } : p));
      setEquipment(equipment.map(eq => eq.id === selectedId ? { ...eq, x: newX, y: newY } : eq));
      setTexts(texts.map(t => t.id === selectedId ? { ...t, x: newX, y: newY } : t));
      
      // Para shapes, mover manteniendo dimensiones
      setShapes(shapes.map(s => {
        if (s.id === selectedId) {
          if (s.type === 'rect') {
            return { ...s, x: newX, y: newY };
          } else if (s.type === 'ellipse') {
            return { ...s, x: newX - s.rx, y: newY - s.ry };
          }
        }
        return s;
      }));
    }
  };

  const handleCanvasMouseUp = (e) => {
    const pos = getMousePos(e);
    
    if (isDrawing && drawStart) {
      if (['arrow', 'line'].includes(activeTool)) {
        const dx = pos.x - drawStart.x;
        const dy = pos.y - drawStart.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        
        if (dist > 20) {
          const newLine = {
            id: Date.now(),
            x1: drawStart.x, y1: drawStart.y,
            x2: pos.x, y2: pos.y,
            color: lineColor,
            hasArrow: activeTool === 'arrow',
            dashed: lineDashed
          };
          setLines([...lines, newLine]);
        }
      } else if (activeTool === 'rectangle' && tempShape) {
        if (tempShape.width > 20 && tempShape.height > 20) {
          const newShape = {
            id: Date.now(),
            type: 'rect',
            x: tempShape.x,
            y: tempShape.y,
            width: tempShape.width,
            height: tempShape.height,
            color: lineColor,
            dashed: lineDashed,
            fill: 'transparent'
          };
          setShapes([...shapes, newShape]);
          setSelectedId(newShape.id);
        }
      } else if (activeTool === 'ellipse' && tempShape) {
        if (tempShape.rx > 10 && tempShape.ry > 10) {
          const newShape = {
            id: Date.now(),
            type: 'ellipse',
            x: tempShape.x,
            y: tempShape.y,
            rx: tempShape.rx,
            ry: tempShape.ry,
            color: lineColor,
            dashed: lineDashed,
            fill: 'transparent'
          };
          setShapes([...shapes, newShape]);
          setSelectedId(newShape.id);
        }
      }
    }

    setIsDrawing(false);
    setDrawStart(null);
    setTempShape(null);
    setIsDragging(false);
    setIsResizing(false);
    setResizeHandle(null);
  };

  const handleSelect = (id, e) => {
    e.stopPropagation();
    setSelectedId(id);
    
    if (activeTool === 'select') {
      const pos = getMousePos(e);
      
      // Buscar en todos los elementos
      const player = players.find(p => p.id === id);
      const equip = equipment.find(eq => eq.id === id);
      const text = texts.find(t => t.id === id);
      const shape = shapes.find(s => s.id === id);
      
      if (player) {
        setDragOffset({ x: pos.x - player.x, y: pos.y - player.y });
        setIsDragging(true);
      } else if (equip) {
        setDragOffset({ x: pos.x - equip.x, y: pos.y - equip.y });
        setIsDragging(true);
      } else if (text) {
        setDragOffset({ x: pos.x - text.x, y: pos.y - text.y });
        setIsDragging(true);
      } else if (shape) {
        if (shape.type === 'rect') {
          setDragOffset({ x: pos.x - shape.x, y: pos.y - shape.y });
        } else if (shape.type === 'ellipse') {
          setDragOffset({ x: pos.x - (shape.x + shape.rx), y: pos.y - (shape.y + shape.ry) });
        }
        setIsDragging(true);
      }
    }
  };

  const handleResize = (id, handle, e) => {
    e.stopPropagation();
    setSelectedId(id);
    setIsResizing(true);
    setResizeHandle(handle);
    setResizeStart(getMousePos(e));
  };

  const handleDelete = () => {
    if (!selectedId) return;
    setPlayers(players.filter(p => p.id !== selectedId));
    setEquipment(equipment.filter(eq => eq.id !== selectedId));
    setTexts(texts.filter(t => t.id !== selectedId));
    setLines(lines.filter(l => l.id !== selectedId));
    setShapes(shapes.filter(s => s.id !== selectedId));
    setSelectedId(null);
  };

  const handleClearAll = () => {
    setShowClearConfirm(true);
  };

  const confirmClearAll = () => {
    setPlayers([]);
    setEquipment([]);
    setTexts([]);
    setLines([]);
    setShapes([]);
    setPlayerCounts({});
    setSelectedId(null);
    setShowClearConfirm(false);
  };

  // === FUNCIONES DE SUPABASE ===
  
  // Cargar lista de pizarras guardadas
  const loadBoardsList = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('tactical_boards')
      .select('id, name, updated_at')
      .order('updated_at', { ascending: false });
    
    if (!error) {
      setSavedBoards(data || []);
    }
    setIsLoading(false);
  };

  // Guardar pizarra actual
  const saveBoard = async (asNew = false) => {
    setIsSaving(true);
    
    const boardData = {
      name: projectName,
      field_type: fieldType,
      players: players,
      equipment: equipment,
      lines: lines,
      shapes: shapes,
      texts: texts,
      updated_at: new Date().toISOString()
    };

    let result;
    
    if (currentBoardId && !asNew) {
      // Actualizar existente
      result = await supabase
        .from('tactical_boards')
        .update(boardData)
        .eq('id', currentBoardId)
        .select();
    } else {
      // Crear nueva
      result = await supabase
        .from('tactical_boards')
        .insert(boardData)
        .select();
    }

    if (!result.error && result.data?.[0]) {
      setCurrentBoardId(result.data[0].id);
      setShowSaveModal(false);
    }
    
    setIsSaving(false);
    return !result.error;
  };

  // Cargar una pizarra
  const loadBoard = async (boardId) => {
    setIsLoading(true);
    
    const { data, error } = await supabase
      .from('tactical_boards')
      .select('*')
      .eq('id', boardId)
      .single();

    if (!error && data) {
      setCurrentBoardId(data.id);
      setProjectName(data.name);
      setFieldType(data.field_type || 'full');
      setPlayers(data.players || []);
      setEquipment(data.equipment || []);
      setLines(data.lines || []);
      setShapes(data.shapes || []);
      setTexts(data.texts || []);
      setSelectedId(null);
      setShowLoadModal(false);
    }
    
    setIsLoading(false);
  };

  // Eliminar una pizarra
  const deleteBoard = async (boardId) => {
    const { error } = await supabase
      .from('tactical_boards')
      .delete()
      .eq('id', boardId);

    if (!error) {
      setSavedBoards(savedBoards.filter(b => b.id !== boardId));
      if (currentBoardId === boardId) {
        setCurrentBoardId(null);
      }
    }
  };

  // Nueva pizarra
  const newBoard = () => {
    setCurrentBoardId(null);
    setProjectName('Mi táctica');
    setFieldType('full');
    setPlayers([]);
    setEquipment([]);
    setLines([]);
    setShapes([]);
    setTexts([]);
    setPlayerCounts({});
    setSelectedId(null);
  };

  const handleExport = () => {
    setSelectedId(null); // Quitar selección antes de exportar
    
    setTimeout(() => {
      const svg = svgRef.current;
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement('canvas');
      canvas.width = canvasWidth * 2;
      canvas.height = canvasHeight * 2;
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.onload = () => {
        ctx.scale(2, 2);
        ctx.drawImage(img, 0, 0);
        const a = document.createElement('a');
        a.download = `${projectName.replace(/\s+/g, '_')}.png`;
        a.href = canvas.toDataURL('image/png');
        a.click();
      };
      img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
    }, 100);
  };

  const handleEditText = (id) => {
    const item = texts.find(t => t.id === id);
    if (item) {
      setEditModal({ open: true, type: 'text', id: id, value: item.text });
    }
  };

  const handleEditPlayerNumber = (id) => {
    const player = players.find(p => p.id === id);
    if (player) {
      setEditModal({ open: true, type: 'player', id: id, value: player.number || '' });
    }
  };

  const handleModalSave = () => {
    if (editModal.type === 'text') {
      setTexts(texts.map(t => t.id === editModal.id ? { ...t, text: editModal.value } : t));
    } else if (editModal.type === 'player') {
      setPlayers(players.map(p => p.id === editModal.id ? { ...p, number: editModal.value, showNumber: editModal.value !== '' } : p));
    }
    setEditModal({ open: false, type: null, id: null, value: '' });
  };

  const handleModalCancel = () => {
    setEditModal({ open: false, type: null, id: null, value: '' });
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (document.activeElement.tagName !== 'INPUT') {
          handleDelete();
        }
      }
      if (e.key === 'Escape') {
        setActiveTool('select');
        setSelectedId(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedId, players, equipment, texts, lines, shapes]);

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white" style={{ fontFamily: 'system-ui' }}>
      {/* Header */}
      <header className="h-14 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚽</span>
            <span className="font-semibold hidden sm:inline">Pizarra Táctica</span>
          </div>
          <div className="flex bg-gray-700 rounded-lg p-1 gap-1">
            {[
              { key: 'full', label: 'Completo', icon: <Maximize size={14} /> },
              { key: 'half', label: 'Medio', icon: <Square size={14} /> },
              { key: 'blank', label: 'Libre', icon: <Square size={14} /> }
            ].map(f => (
              <button
                key={f.key}
                onClick={() => setFieldType(f.key)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded text-xs font-medium transition-colors ${fieldType === f.key ? 'bg-green-500 text-black' : 'text-gray-300 hover:bg-gray-600'}`}
              >
                {f.icon}
                <span className="hidden sm:inline">{f.label}</span>
              </button>
            ))}
          </div>
        </div>
        <input
          type="text"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          className="bg-gray-700 border border-gray-600 rounded px-3 py-1.5 text-sm text-center w-40 sm:w-48"
          placeholder="Nombre..."
        />
        <div className="flex gap-2">
          <button
            onClick={newBoard}
            className="flex items-center gap-1 bg-gray-600 hover:bg-gray-500 px-3 py-1.5 rounded-lg text-sm transition-colors"
            title="Nueva pizarra"
          >
            <Plus size={16} />
          </button>
          <button
            onClick={() => saveBoard(false)}
            disabled={isSaving}
            className="flex items-center gap-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            title="Guardar"
          >
            {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          </button>
          <button
            onClick={() => { loadBoardsList(); setShowLoadModal(true); }}
            className="flex items-center gap-1 bg-purple-500 hover:bg-purple-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
            title="Abrir"
          >
            <FolderOpen size={16} />
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-black px-4 py-1.5 rounded-lg text-sm font-medium transition-colors"
          >
            <Download size={16} />
            <span className="hidden sm:inline">PNG</span>
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Toolbar */}
        <aside className="w-60 bg-gray-800 border-r border-gray-700 flex flex-col overflow-y-auto">
          <div className="p-3">
            <button
              onClick={() => setActiveTool('select')}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeTool === 'select' ? 'bg-green-500 text-black' : 'bg-gray-700 hover:bg-gray-600'}`}
            >
              <MousePointer size={16} />
              Seleccionar
            </button>
          </div>

          {/* Jugadores */}
          <div className="border-t border-gray-700">
            <button
              onClick={() => setExpandedSection(expandedSection === 'players' ? '' : 'players')}
              className={`w-full flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-gray-700 ${expandedSection === 'players' ? 'text-white bg-gray-700' : 'text-gray-400'}`}
            >
              <Users size={16} />
              Jugadores
            </button>
            {expandedSection === 'players' && (
              <div className="p-3 pt-0 space-y-3">
                <button
                  onClick={() => setActiveTool('player')}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${activeTool === 'player' ? 'bg-green-500 text-black' : 'bg-gray-700 hover:bg-gray-600'}`}
                >
                  <Circle size={16} />
                  Añadir jugador
                </button>
                
                <div>
                  <label className="text-xs text-gray-500 uppercase">Color equipo</label>
                  <div className="grid grid-cols-4 gap-1.5 mt-1">
                    {Object.entries(TEAM_COLORS).map(([key, val]) => (
                      <button
                        key={key}
                        onClick={() => setSelectedColor(key)}
                        className={`w-full aspect-square rounded-md transition-transform hover:scale-105 ${selectedColor === key ? 'ring-2 ring-white ring-offset-1 ring-offset-gray-800' : ''}`}
                        style={{ backgroundColor: val.fill }}
                        title={val.name}
                      />
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="text-xs text-gray-500 uppercase">Tamaño</label>
                  <div className="grid grid-cols-3 gap-1.5 mt-1">
                    {Object.entries(PLAYER_SIZES).map(([key, val]) => (
                      <button
                        key={key}
                        onClick={() => setSelectedSize(key)}
                        className={`py-2 rounded-md text-xs font-semibold transition-colors ${selectedSize === key ? 'bg-green-500 text-black' : 'bg-gray-700 hover:bg-gray-600'}`}
                      >
                        {val.label}
                      </button>
                    ))}
                  </div>
                </div>
                
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={showNumbers} onChange={(e) => setShowNumbers(e.target.checked)} className="accent-green-500 w-4 h-4" />
                  Mostrar números
                </label>
                
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={hasVest} onChange={(e) => setHasVest(e.target.checked)} className="accent-green-500 w-4 h-4" />
                  Con peto
                </label>
                
                {hasVest && (
                  <div className="grid grid-cols-6 gap-1">
                    {Object.entries(TEAM_COLORS).slice(0, 6).map(([key, val]) => (
                      <button
                        key={key}
                        onClick={() => setVestColor(key)}
                        className={`w-full aspect-square rounded ${vestColor === key ? 'ring-2 ring-white' : ''}`}
                        style={{ backgroundColor: val.fill }}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Material */}
          <div className="border-t border-gray-700">
            <button
              onClick={() => setExpandedSection(expandedSection === 'equipment' ? '' : 'equipment')}
              className={`w-full flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-gray-700 ${expandedSection === 'equipment' ? 'text-white bg-gray-700' : 'text-gray-400'}`}
            >
              <Triangle size={16} />
              Material
            </button>
            {expandedSection === 'equipment' && (
              <div className="p-3 pt-0 space-y-3">
                {/* Tamaño de material */}
                <div>
                  <label className="text-xs text-gray-500 uppercase">Tamaño</label>
                  <div className="flex gap-1 mt-1">
                    {Object.entries(EQUIPMENT_SIZES).map(([key, size]) => (
                      <button
                        key={key}
                        onClick={() => setEquipmentSize(key)}
                        className={`flex-1 py-1.5 rounded-md text-xs font-bold ${equipmentSize === key ? 'bg-green-500 text-black' : 'bg-gray-700 hover:bg-gray-600'}`}
                      >
                        {size.label}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Grid de equipamiento */}
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { type: 'ball', label: '⚽', title: 'Balón' },
                    { type: 'cone', label: '🔺', title: 'Cono' },
                    { type: 'marker', label: '🔘', title: 'Marcador' },
                    { type: 'stickRed', label: '🔴', title: 'Pica Roja' },
                    { type: 'stickYellow', label: '🟡', title: 'Pica Amarilla' },
                    { type: 'wall', label: '👥', title: 'Barrera' },
                    { type: 'manikin', label: '🧍', title: 'Maniquí' },
                    { type: 'smallGoal', label: '🥅', title: 'Mini Portería' },
                    { type: 'goalSmall', label: <Goal size={12} />, title: 'Portería S' },
                    { type: 'goalMedium', label: <Goal size={14} />, title: 'Portería M' },
                    { type: 'goalLarge', label: <Goal size={16} />, title: 'Portería L' }
                  ].map(eq => (
                    <button
                      key={eq.type}
                      onClick={() => setActiveTool(eq.type)}
                      className={`aspect-square flex items-center justify-center rounded-md text-base transition-colors ${activeTool === eq.type ? 'bg-green-500 text-black' : 'bg-gray-700 hover:bg-gray-600'}`}
                      title={eq.title}
                    >
                      {eq.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Dibujo */}
          <div className="border-t border-gray-700">
            <button
              onClick={() => setExpandedSection(expandedSection === 'drawing' ? '' : 'drawing')}
              className={`w-full flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-gray-700 ${expandedSection === 'drawing' ? 'text-white bg-gray-700' : 'text-gray-400'}`}
            >
              <ArrowRight size={16} />
              Dibujo
            </button>
            {expandedSection === 'drawing' && (
              <div className="p-3 pt-0 space-y-3">
                {/* Tipo de línea */}
                <div>
                  <label className="text-xs text-gray-500 uppercase">Tipo de línea</label>
                  <div className="grid grid-cols-2 gap-1.5 mt-1">
                    <button
                      onClick={() => setLineDashed(false)}
                      className={`py-2 rounded-md text-xs font-medium flex items-center justify-center gap-1 ${!lineDashed ? 'bg-green-500 text-black' : 'bg-gray-700 hover:bg-gray-600'}`}
                    >
                      <Minus size={14} /> Continua
                    </button>
                    <button
                      onClick={() => setLineDashed(true)}
                      className={`py-2 rounded-md text-xs font-medium flex items-center justify-center gap-1 ${lineDashed ? 'bg-green-500 text-black' : 'bg-gray-700 hover:bg-gray-600'}`}
                    >
                      <MoveRight size={14} /> Discontinua
                    </button>
                  </div>
                </div>
                
                {/* Herramientas de dibujo */}
                <div className="space-y-1.5">
                  {[
                    { type: 'arrow', label: 'Flecha', icon: <ArrowRight size={16} /> },
                    { type: 'line', label: 'Línea', icon: <Minus size={16} /> },
                    { type: 'rectangle', label: 'Rectángulo', icon: <RectangleHorizontal size={16} /> },
                    { type: 'ellipse', label: 'Círculo', icon: <CircleDot size={16} /> }
                  ].map(l => (
                    <button
                      key={l.type}
                      onClick={() => setActiveTool(l.type)}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm ${activeTool === l.type ? 'bg-green-500 text-black' : 'bg-gray-700 hover:bg-gray-600'}`}
                    >
                      {l.icon}
                      {l.label}
                    </button>
                  ))}
                </div>
                
                <div>
                  <label className="text-xs text-gray-500 uppercase">Color</label>
                  <div className="grid grid-cols-6 gap-1 mt-1">
                    {LINE_COLORS.map(c => (
                      <button
                        key={c.color}
                        onClick={() => setLineColor(c.color)}
                        className={`w-full aspect-square rounded border border-gray-600 ${lineColor === c.color ? 'ring-2 ring-green-500' : ''}`}
                        style={{ backgroundColor: c.color }}
                        title={c.name}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Texto */}
          <div className="border-t border-gray-700">
            <button
              onClick={() => setExpandedSection(expandedSection === 'text' ? '' : 'text')}
              className={`w-full flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-gray-700 ${expandedSection === 'text' ? 'text-white bg-gray-700' : 'text-gray-400'}`}
            >
              <Type size={16} />
              Texto
            </button>
            {expandedSection === 'text' && (
              <div className="p-3 pt-0">
                <button
                  onClick={() => setActiveTool('text')}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${activeTool === 'text' ? 'bg-green-500 text-black' : 'bg-gray-700 hover:bg-gray-600'}`}
                >
                  <Type size={16} />
                  Añadir texto
                </button>
                <p className="text-xs text-gray-500 mt-2">Clic para añadir. Doble clic para editar.</p>
              </div>
            )}
          </div>

          {/* Acciones */}
          <div className="mt-auto border-t border-gray-700 p-3 space-y-2">
            {/* Botón editar número - solo si hay jugador seleccionado */}
            {selectedId && players.find(p => p.id === selectedId) && (
              <button
                onClick={() => handleEditPlayerNumber(selectedId)}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
              >
                <Type size={16} />
                Editar número
              </button>
            )}
            <button
              onClick={handleDelete}
              disabled={!selectedId}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm bg-red-500/20 text-red-400 hover:bg-red-500/30 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Trash2 size={16} />
              Eliminar
            </button>
            <button
              onClick={handleClearAll}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm bg-gray-700 text-gray-300 hover:bg-gray-600"
            >
              <Trash2 size={16} />
              Limpiar todo
            </button>
          </div>
        </aside>

        {/* Canvas */}
        <main className="flex-1 bg-gray-900 flex items-center justify-center p-4 overflow-auto">
          <svg
            ref={svgRef}
            width={canvasWidth}
            height={canvasHeight}
            className="rounded-lg shadow-2xl flex-shrink-0"
            style={{ cursor: activeTool === 'select' ? 'default' : 'crosshair' }}
            onClick={handleCanvasClick}
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
            onMouseLeave={handleCanvasMouseUp}
          >
            <SoccerField type={fieldType} width={canvasWidth} height={canvasHeight} />
            
            {/* Shapes (rectángulos y elipses) */}
            {shapes.map(shape => (
              shape.type === 'rect' ? (
                <EditableRect key={shape.id} shape={shape} isSelected={selectedId === shape.id} onSelect={handleSelect} onResize={handleResize} />
              ) : (
                <EditableEllipse key={shape.id} shape={shape} isSelected={selectedId === shape.id} onSelect={handleSelect} onResize={handleResize} />
              )
            ))}
            
            {/* Líneas */}
            {lines.map(line => (
              <DrawingLine key={line.id} line={line} isSelected={selectedId === line.id} onSelect={handleSelect} />
            ))}
            
            {/* Forma temporal mientras se dibuja */}
            {tempShape && tempShape.type === 'line' && (
              <line
                x1={tempShape.x1} y1={tempShape.y1} x2={tempShape.x2} y2={tempShape.y2}
                stroke={lineColor} strokeWidth={3} strokeDasharray={lineDashed ? '10 5' : 'none'}
                opacity={0.6}
              />
            )}
            {tempShape && tempShape.type === 'rect' && (
              <rect
                x={tempShape.x} y={tempShape.y} width={tempShape.width} height={tempShape.height}
                stroke={lineColor} strokeWidth={3} strokeDasharray={lineDashed ? '10 5' : 'none'}
                fill="transparent" opacity={0.6}
              />
            )}
            {tempShape && tempShape.type === 'ellipse' && (
              <ellipse
                cx={tempShape.x + tempShape.rx} cy={tempShape.y + tempShape.ry}
                rx={tempShape.rx} ry={tempShape.ry}
                stroke={lineColor} strokeWidth={3} strokeDasharray={lineDashed ? '10 5' : 'none'}
                fill="transparent" opacity={0.6}
              />
            )}
            
            {/* Equipment */}
            {equipment.map(item => (
              <Equipment key={item.id} item={item} isSelected={selectedId === item.id} onSelect={handleSelect} />
            ))}
            
            {/* Players */}
            {players.map(player => (
              <Player key={player.id} player={player} isSelected={selectedId === player.id} onSelect={handleSelect} onEditNumber={handleEditPlayerNumber} />
            ))}
            
            {/* Texts */}
            {texts.map(item => (
              <TextLabel key={item.id} item={item} isSelected={selectedId === item.id} onSelect={handleSelect} onEdit={handleEditText} />
            ))}
          </svg>
        </main>
      </div>

      {/* Modal de edición */}
      {editModal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-80 shadow-xl border border-gray-700">
            <h3 className="text-lg font-semibold mb-4">
              {editModal.type === 'player' ? 'Editar número' : 'Editar texto'}
            </h3>
            <input
              type={editModal.type === 'player' ? 'text' : 'text'}
              value={editModal.value}
              onChange={(e) => setEditModal({ ...editModal, value: e.target.value })}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white mb-4 focus:border-green-500 focus:outline-none"
              placeholder={editModal.type === 'player' ? 'Número...' : 'Texto...'}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleModalSave();
                if (e.key === 'Escape') handleModalCancel();
              }}
            />
            <div className="flex gap-2">
              <button
                onClick={handleModalCancel}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleModalSave}
                className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-black rounded-lg text-sm font-medium"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal confirmar limpiar */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-80 shadow-xl border border-gray-700">
            <h3 className="text-lg font-semibold mb-2">¿Limpiar todo?</h3>
            <p className="text-gray-400 text-sm mb-4">Se eliminarán todos los elementos del campo.</p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={confirmClearAll}
                className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium"
              >
                Limpiar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal cargar pizarras */}
      {showLoadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-96 max-h-[80vh] shadow-xl border border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Mis Pizarras</h3>
              <button onClick={() => setShowLoadModal(false)} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 size={32} className="animate-spin text-blue-500" />
              </div>
            ) : savedBoards.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No hay pizarras guardadas</p>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {savedBoards.map(board => (
                  <div
                    key={board.id}
                    className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                      currentBoardId === board.id ? 'bg-blue-500/20 border border-blue-500' : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                    onClick={() => loadBoard(board.id)}
                  >
                    <div>
                      <div className="font-medium">{board.name}</div>
                      <div className="text-xs text-gray-400">
                        {new Date(board.updated_at).toLocaleDateString('es-ES', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm('¿Eliminar esta pizarra?')) deleteBoard(board.id);
                      }}
                      className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-gray-600 rounded"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
