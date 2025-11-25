"use client";

import CloseIcon from "@/components/svg/close.svg";
import DragIcon from "@/components/svg/drag.svg";
import { TagCategory } from "@/types/database";
import { DndContext, DragEndEvent } from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useEffect, useMemo, useState } from "react";

import "./GroupTagEditor.scss";

interface GroupTagEditorProps {
  group: TagCategory[];
  onSaved?: (data: TagCategory[]) => void;
}

function DraggableCategoryRow({
  category,
  isActive,
  onSelect,
  onRemove,
}: {
  category: TagCategory;
  isActive: boolean;
  onSelect: () => void;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: category.name,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`editable-row ${isActive ? "active" : ""}`}
      onClick={(e) => e.stopPropagation()}>
      <button type="button" className="drag-handle" {...attributes} {...listeners}>
        <DragIcon />
      </button>
      {category.name}
      <button type="button" className="edit-options" onClick={onSelect}>
        Edit Options
      </button>
      <button type="button" className="close" onClick={onRemove}>
        <CloseIcon />
      </button>
    </div>
  );
}

function DraggableOptionRow({ option, onRemove }: { option: string; onRemove: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: option,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="editable-row option-row"
      onClick={(e) => e.stopPropagation()}>
      <button type="button" className="drag-handle" {...attributes} {...listeners}>
        <DragIcon />
      </button>
      {option}
      <button type="button" className="close" onClick={onRemove}>
        <CloseIcon />
      </button>
    </div>
  );
}

export default function GroupTagEditor({ group, onSaved }: GroupTagEditorProps) {
  const [editableCategories, setEditableCategories] = useState<TagCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [newGroupName, setNewGroupName] = useState("");
  const [newOptionName, setNewOptionName] = useState("");

  useEffect(() => {
    if (group) {
      setEditableCategories([...group]);
    }
  }, [group]);

  const selectedCatObject = useMemo(() => {
    return editableCategories.find((c) => c.name === selectedCategory);
  }, [editableCategories, selectedCategory]);

  const selectedOptions = useMemo(() => {
    return selectedCatObject?.options || [];
  }, [selectedCatObject]);

  const handleCategoryDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    setEditableCategories((items) => {
      const oldIndex = items.findIndex((item) => item.name === active.id);
      const newIndex = items.findIndex((item) => item.name === over.id);

      const newItems = [...items];
      const [removed] = newItems.splice(oldIndex, 1);
      newItems.splice(newIndex, 0, removed);

      return newItems;
    });
  };

  const handleOptionDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id || !selectedCatObject) {
      return;
    }

    setEditableCategories((categories) => {
      return categories.map((cat) => {
        if (cat.name === selectedCategory) {
          const oldIndex = cat.options.findIndex((opt) => opt === active.id);
          const newIndex = cat.options.findIndex((opt) => opt === over.id);

          const newOptions = [...cat.options];
          const [removed] = newOptions.splice(oldIndex, 1);
          newOptions.splice(newIndex, 0, removed);

          return { ...cat, options: newOptions };
        }
        return cat;
      });
    });
  };

  const onRemoveCategory = (catName: string) => {
    setEditableCategories((categories) => categories.filter((c) => c.name !== catName));
    if (selectedCategory === catName) {
      setSelectedCategory("");
    }
  };

  const onRemoveOption = (optionName: string) => {
    setEditableCategories((categories) => {
      return categories.map((cat) => {
        if (cat.name === selectedCategory) {
          return {
            ...cat,
            options: cat.options.filter((option) => option !== optionName),
          };
        }
        return cat;
      });
    });
  };

  const handleAddGroup = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newGroupName.trim()) return;

    setEditableCategories((categories) => [
      ...categories,
      {
        name: newGroupName.trim(),
        options: [],
      },
    ]);

    setSelectedCategory(newGroupName.trim());
    setNewGroupName("");
  };

  const handleAddOption = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newOptionName.trim() || !selectedCatObject) return;

    setEditableCategories((categories) => {
      return categories.map((cat) => {
        if (cat.name === selectedCategory) {
          return {
            ...cat,
            options: [...cat.options, newOptionName.trim()],
          };
        }
        return cat;
      });
    });

    setNewOptionName("");
  };

  const handleSave = () => {
    if (onSaved) {
      onSaved(editableCategories);
    }
  };

  return (
    <div className="admin-group-tag-editor">
      <div className="categories-edit">
        <div className="section-label">Groups</div>

        <DndContext onDragEnd={handleCategoryDragEnd}>
          <SortableContext
            items={editableCategories.map((cat) => cat.name)}
            strategy={verticalListSortingStrategy}>
            {editableCategories.map((category) => (
              <DraggableCategoryRow
                key={category.name}
                category={category}
                isActive={selectedCategory === category.name}
                onSelect={() => setSelectedCategory(category.name)}
                onRemove={() => onRemoveCategory(category.name)}
              />
            ))}
          </SortableContext>
        </DndContext>

        <form onSubmit={handleAddGroup} className="add-group">
          <input
            type="text"
            className="text-input"
            placeholder="New Group"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
          />
          <button className="add-button" type="submit">
            Add
          </button>
        </form>
      </div>

      {selectedCategory && (
        <div className="options-edit">
          <div className="section-label">&quot;{selectedCategory}&quot; Options</div>

          <DndContext onDragEnd={handleOptionDragEnd}>
            <SortableContext items={selectedOptions} strategy={verticalListSortingStrategy}>
              {selectedOptions.map((option) => (
                <DraggableOptionRow
                  key={option}
                  option={option}
                  onRemove={() => onRemoveOption(option)}
                />
              ))}
            </SortableContext>
          </DndContext>

          <form onSubmit={handleAddOption} className="add-option">
            <input
              type="text"
              className="text-input"
              placeholder="New Option"
              value={newOptionName}
              onChange={(e) => setNewOptionName(e.target.value)}
            />
            <button className="add-button" type="submit">
              Add
            </button>
          </form>
        </div>
      )}

      <div className="button-row">
        <button onClick={handleSave} className="save-button btn" type="button">
          Save
        </button>
      </div>
    </div>
  );
}
