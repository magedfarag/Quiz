import { useState } from 'react';
import { GripVertical, Eye } from 'lucide-react';

interface Item {
  id: number | string;
  text: string;
}

interface ReorderableListProps {
  items: Item[];
  onReorder: (items: Item[]) => void;
}

export function ReorderableList({ items, onReorder }: ReorderableListProps) {
  const [draggedItem, setDraggedItem] = useState<number | null>(null);

  const handleDragStart = (index: number) => {
    setDraggedItem(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedItem === null) return;

    const newItems = [...items];
    const dragItem = newItems[draggedItem];
    newItems.splice(draggedItem, 1);
    newItems.splice(index, 0, dragItem);
    
    onReorder(newItems);
    setDraggedItem(index);
  };

  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <div
          key={item.id}
          draggable
          onDragStart={() => handleDragStart(index)}
          onDragOver={(e) => handleDragOver(e, index)}
          className="p-4 bg-white rounded-lg border hover:shadow-md transition-shadow cursor-move"
        >
          <div className="flex items-center">
            <GripVertical className="w-5 h-5 text-gray-400 mr-3" />
            <div className="flex-1">{item.text}</div>
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <Eye className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
