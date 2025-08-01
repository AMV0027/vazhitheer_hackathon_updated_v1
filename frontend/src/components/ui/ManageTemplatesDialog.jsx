import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './dialog';
import { Button } from './button';
import { Card } from './card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from './table';
import { useTemplates } from '@/hooks/useTemplates';
import { Input } from './input';
import { Textarea } from './textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { Tooltip } from './tooltip';
import { Plus, Trash2, Edit, List, Pilcrow, ArrowUp, ArrowDown } from 'lucide-react';

// BlockPreview component with full editing capabilities
function BlockPreview({ value, onChange }) {
  const [editingKey, setEditingKey] = useState(null);
  const [newKey, setNewKey] = useState('');
  const [addingType, setAddingType] = useState(null);
  const [showJson, setShowJson] = useState(false);

  // Check if value is { blocks: [...] }, array, or object
  let mainValue = value;
  let isBlocksArray = false;
  if (value && typeof value === 'object' && Array.isArray(value.blocks) && Object.keys(value).length === 1) {
    mainValue = value.blocks;
    isBlocksArray = true;
  } else if (Array.isArray(value)) {
    mainValue = value;
    isBlocksArray = false;
  } else if (typeof value === 'object' && value !== null) {
    mainValue = value;
    isBlocksArray = false;
  } else {
    mainValue = [];
    isBlocksArray = false;
  }

  const isArray = Array.isArray(mainValue);
  const isObject = mainValue && typeof mainValue === 'object' && !isArray;

  // Add new paragraph (for object)
  const handleAddParagraph = () => {
    setAddingType('paragraph');
    setNewKey('');
    setEditingKey(null);
  };

  const handleAddList = () => {
    setAddingType('list');
    setNewKey('');
    setEditingKey(null);
  };

  // Confirm add paragraph or list
  const handleConfirmAdd = () => {
    if (!newKey || (value && value[newKey] !== undefined)) return;
    if (addingType === 'paragraph') {
      onChange({ ...value, [newKey]: '' });
    } else if (addingType === 'list') {
      onChange({ ...value, [newKey]: [] });
    }
    setAddingType(null);
    setNewKey('');
  };

  // Edit attribute name
  const handleEditKey = (oldKey) => {
    setEditingKey(oldKey);
    setNewKey(oldKey);
  };

  // Confirm edit attribute name
  const handleConfirmEditKey = (oldKey) => {
    if (!newKey) return;
    let finalKey = newKey;
    if (value && value[newKey] !== undefined && newKey !== oldKey) {
      let suffix = ' copy';
      let tryKey = newKey + suffix;
      let count = 2;
      while (value[tryKey] !== undefined) {
        tryKey = newKey + suffix + (count > 2 ? ` ${count}` : '');
        count++;
      }
      finalKey = tryKey;
    }
    const { [oldKey]: val, ...rest } = value;
    onChange({ ...rest, [finalKey]: val });
    setEditingKey(null);
    setNewKey('');
  };

  // Add new item (for array)
  const handleAddItem = () => {
    onChange([...(value || []), '']);
  };

  // Remove attribute (for object)
  const handleRemoveAttribute = (key) => {
    const { [key]: _, ...rest } = value;
    onChange(rest);
  };

  // Remove item (for array)
  const handleRemoveItem = (idx) => {
    onChange(value.filter((_, i) => i !== idx));
  };

  // Update attribute value (for object)
  const handleChangeAttribute = (key, val) => {
    onChange({ ...value, [key]: val });
  };

  // Update item value (for array)
  const handleChangeItem = (idx, val) => {
    const arr = [...value];
    arr[idx] = val;
    onChange(arr);
  };

  // Handle moving items up/down
  const handleMoveUp = (idx) => {
    if (idx === 0) return;
    const newArr = [...Object.entries(value)];
    [newArr[idx - 1], newArr[idx]] = [newArr[idx], newArr[idx - 1]];
    const newObj = Object.fromEntries(newArr);
    onChange(newObj);
  };

  const handleMoveDown = (idx) => {
    const entries = Object.entries(value);
    if (idx === entries.length - 1) return;
    const newArr = [...entries];
    [newArr[idx], newArr[idx + 1]] = [newArr[idx + 1], newArr[idx]];
    const newObj = Object.fromEntries(newArr);
    onChange(newObj);
  };

  return (
    <Card className="mb-2 p-3">
      <div className="flex items-center gap-2 mb-1">
        <label className="block font-medium">Editor</label>
        {isObject && (
          <>
            <Tooltip content="Add paragraph">
              <Button type="button" size="icon" variant="ghost" onClick={handleAddParagraph} className="shadow-md">
                <Pilcrow className="w-4 h-4 text-blue-600" />
              </Button>
            </Tooltip>
            <Tooltip content="Add list">
              <Button type="button" size="icon" variant="ghost" onClick={handleAddList} className="shadow-md">
                <List className="w-4 h-4 text-purple-600" />
              </Button>
            </Tooltip>
          </>
        )}
        {isArray && (
          <Tooltip content="Add item">
            <Button type="button" size="icon" variant="ghost" onClick={handleAddItem} className="shadow-md">
              <Plus className="w-4 h-4 text-green-600" />
            </Button>
          </Tooltip>
        )}
        <Tooltip content={showJson ? "Show block editor" : "Show JSON code"}>
          <Button type="button" size="icon" variant="ghost" onClick={() => setShowJson(j => !j)} className="shadow-md">
            {showJson ? <span className="font-mono text-xs">{'{}'}</span> : <span className="font-mono text-xs">[≡]</span>}
          </Button>
        </Tooltip>
      </div>
      <div className="space-y-2">
        {showJson ? (
          <Textarea
            value={typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
            onChange={e => {
              try {
                const parsed = JSON.parse(e.target.value);
                onChange(parsed);
              } catch (err) {
                // Ignore parse errors while typing
              }
            }}
            className="font-mono"
            rows={6}
          />
        ) : (
          <>
            {isBlocksArray && Array.isArray(mainValue) && mainValue.length === 0 && (
              <div className="text-xs text-muted-foreground">No blocks. Use the block creator to add.</div>
            )}
            {isBlocksArray && Array.isArray(mainValue) && mainValue.length > 0 && mainValue.map((block, idx) => (
              <div key={idx} className="mb-2 rounded shadow-sm bg-white border border-gray-200 p-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">Block {idx + 1}</span>
                  {block.type && <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-600">{block.type}</span>}
                </div>
                <pre className="text-xs bg-gray-50 rounded p-2 mt-2 overflow-x-auto">{JSON.stringify(block, null, 2)}</pre>
              </div>
            ))}
            {!isBlocksArray && isObject && Object.keys(mainValue || {}).length === 0 && (
              <div className="text-xs text-muted-foreground">No attributes. Use the P or List icon to add.</div>
            )}
            {!isBlocksArray && isObject && (
              Object.entries(mainValue || {}).map(([key, val], idx, arr) => (
                <div key={key + '-' + idx} className="mb-2 rounded shadow-sm bg-white border border-gray-200 p-2">
                  <div className="flex items-center gap-2">
                    <span className="flex flex-col pr-1 select-none">
                      <Button type="button" size="icon" variant="ghost" disabled={idx === 0} onClick={() => handleMoveUp(idx)}>
                        <ArrowUp className="w-4 h-4 text-gray-400" />
                      </Button>
                      <Button type="button" size="icon" variant="ghost" disabled={idx === arr.length - 1} onClick={() => handleMoveDown(idx)}>
                        <ArrowDown className="w-4 h-4 text-gray-400" />
                      </Button>
                    </span>
                    {editingKey === key ? (
                      <>
                        <Input
                          className="w-32"
                          value={newKey}
                          onChange={e => setNewKey(e.target.value)}
                          onBlur={() => handleConfirmEditKey(key)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') {
                              handleConfirmEditKey(key);
                            } else if (e.key === 'Escape') {
                              setEditingKey(null);
                              setNewKey('');
                            }
                          }}
                          autoFocus
                        />
                        <Button type="button" size="icon" variant="ghost" onClick={() => handleConfirmEditKey(key)}>
                          <Edit className="w-4 h-4 text-blue-600" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <span className="text-sm w-32 truncate" title={key}>{key}</span>
                        <Tooltip content="Edit attribute name">
                          <Button type="button" size="icon" variant="ghost" onClick={() => handleEditKey(key)}>
                            <Edit className="w-4 h-4 text-blue-600" />
                          </Button>
                        </Tooltip>
                      </>
                    )}
                    {Array.isArray(val) ? (
                      <div className="flex-1">
                        <BlockPreview value={val} onChange={v => handleChangeAttribute(key, v)} />
                      </div>
                    ) : typeof val === 'object' && val !== null ? (
                      <div className="flex-1">
                        <BlockPreview value={val} onChange={v => handleChangeAttribute(key, v)} />
                      </div>
                    ) : (
                      <Input
                        className="flex-1"
                        value={val}
                        onChange={e => handleChangeAttribute(key, e.target.value)}
                        placeholder="Value"
                      />
                    )}
                    <Tooltip content="Remove attribute">
                      <Button type="button" size="icon" variant="ghost" onClick={() => handleRemoveAttribute(key)}>
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </Tooltip>
                  </div>
                </div>
              ))
            )}
            {isObject && addingType && (
              <div className="flex items-center gap-2">
                <Input
                  className="w-32"
                  value={newKey}
                  onChange={e => setNewKey(e.target.value)}
                  onBlur={handleConfirmAdd}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      handleConfirmAdd();
                    } else if (e.key === 'Escape') {
                      setAddingType(null);
                      setNewKey('');
                    }
                  }}
                  autoFocus
                  placeholder={addingType === 'paragraph' ? 'Paragraph title' : 'List title'}
                />
                <Button type="button" size="icon" variant="ghost" onClick={handleConfirmAdd}>
                  {addingType === 'paragraph' ? <Pilcrow className="w-4 h-4 text-blue-600" /> : <List className="w-4 h-4 text-purple-600" />}
                </Button>
              </div>
            )}
            {isArray && Array.isArray(value) && value.length === 0 && (
              <div className="text-xs text-muted-foreground">No items. Click <Plus className="inline w-3 h-3" /> to add.</div>
            )}
            {isArray && Array.isArray(value) && value.length > 0 && value.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <Input
                  className="flex-1"
                  value={item}
                  onChange={e => handleChangeItem(idx, e.target.value)}
                  placeholder={`Item ${idx + 1}`}
                />
                <Tooltip content="Remove item">
                  <Button type="button" size="icon" variant="ghost" onClick={() => handleRemoveItem(idx)}>
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </Tooltip>
              </div>
            ))}
            {!isObject && !isArray && (
              <Textarea
                value={typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
                onChange={e => {
                  try {
                    const parsed = JSON.parse(e.target.value);
                    onChange(parsed);
                  } catch (err) {
                    onChange(e.target.value);
                  }
                }}
                className="font-mono"
                rows={3}
              />
            )}
          </>
        )}
      </div>
    </Card>
  );
}

function ManageTemplatesDialog({ open, onOpenChange, onEditTemplate }) {
  const { templates, fetchTemplates, deleteTemplate } = useTemplates();
  const [deletingId, setDeletingId] = useState(null);

  React.useEffect(() => {
    if (open) fetchTemplates();
  }, [open, fetchTemplates]);

  const handleDelete = async (id) => {
    setDeletingId(id);
    await deleteTemplate(id);
    setDeletingId(null);
    fetchTemplates();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Manage Templates</DialogTitle>
        </DialogHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Blocks</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {templates.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="text-center">No templates found.</TableCell>
              </TableRow>
            )}
            {templates.map(t => {
              let parsed;
              try {
                parsed = JSON.parse(t.json);
              } catch {
                return (
                  <TableRow key={t.id}>
                    <TableCell>{t.name}</TableCell>
                    <TableCell>
                      <div className="text-xs text-red-500">Invalid JSON</div>
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline" onClick={() => onEditTemplate && onEditTemplate(t)}>
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="ml-2"
                        onClick={() => handleDelete(t.id)}
                        disabled={deletingId === t.id}
                      >
                        {deletingId === t.id ? 'Deleting...' : 'Delete'}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              }
              return (
                <TableRow key={t.id}>
                  <TableCell>{t.name}</TableCell>
                  <TableCell>
                    <div className="text-xs text-muted-foreground">Edit to view full editor</div>
                  </TableCell>
                  <TableCell>
                    <Button size="sm" variant="outline" onClick={() => onEditTemplate && onEditTemplate(t)}>
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="ml-2"
                      onClick={() => handleDelete(t.id)}
                      disabled={deletingId === t.id}
                    >
                      {deletingId === t.id ? 'Deleting...' : 'Delete'}
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </DialogContent>
    </Dialog>
  );
}

export default ManageTemplatesDialog;