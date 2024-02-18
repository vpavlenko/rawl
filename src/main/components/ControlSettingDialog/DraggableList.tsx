import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { FC } from "react"

const SortableItem: FC<{ id: string; children: React.ReactNode }> = (props) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: props.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {props.children}
    </div>
  )
}

export interface DraggableListProps<T> {
  items: T[]
  render: (item: T) => React.ReactNode
  getItemId: (item: T) => string
  onItemMoved: (oldId: string, newId: string) => void
}

export const DraggableList = <T extends {}>({
  items: _items,
  render,
  getItemId,
  onItemMoved,
}: DraggableListProps<T>) => {
  const items = _items.map((item) => ({ id: getItemId(item), item }))

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Enable item click
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={(event) => {
        const { active, over } = event

        if (over !== null && active.id !== over.id) {
          onItemMoved(active.id as string, over.id as string)
        }
      }}
    >
      <SortableContext items={items} strategy={verticalListSortingStrategy}>
        {items.map((item, i) => (
          <SortableItem key={item.id} id={item.id}>
            {render(item.item)}
          </SortableItem>
        ))}
      </SortableContext>
    </DndContext>
  )
}
