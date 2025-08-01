import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip'
import { Pilcrow, List, Tag, Save, Columns, Trash2, Key } from 'lucide-react'

// ---- helpers ---------------------------------------------------------------
const uid = () => Math.random().toString(36).slice(2, 9)

function normalizeIncoming(value) {
  // Accepts `value` in the expected format or empty; returns internal blocks with stable ids
  const incomingBlocks = Array.isArray(value?.blocks) ? value.blocks : []
  return incomingBlocks.map(b => ({
    id: b.id || uid(),
    type: b?.type ?? 'paragraph',
    title: b?.title ?? '',
    content: b?.content ?? (b?.type === 'list' ? [] : ''),
  }))
}

function toOutbound(blocks) {
  // Drop internal ids; emit strictly the expected shape
  return {
    blocks: blocks.map(({ id, ...rest }) => rest)
  }
}

// ---- block editors ---------------------------------------------------------
const ParagraphEditor = React.memo(function ParagraphEditor({ block, onChange, onRemove }) {
  const [localBlock, setLocalBlock] = useState(block)

  const handleSave = () => {
    onChange(localBlock)
  }

  // Update local state when block prop changes
  useEffect(() => {
    setLocalBlock(block)
  }, [block])

  return (
    <div className="rounded-md border p-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Paragraph
        </span>
        <div className="flex gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button type="button" variant="secondary" size="icon" onClick={handleSave}>
                <Save className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Save changes</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button type="button" variant="ghost" size="icon" onClick={onRemove}>
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Remove block</TooltipContent>
          </Tooltip>
        </div>
      </div>

      <Textarea
        placeholder="Enter paragraph content..."
        rows={3}
        value={localBlock.content}
        onChange={(e) => setLocalBlock({ ...localBlock, content: e.target.value })}
        onBlur={handleSave}
      />
    </div>
  )
})



function ListEditor({ block, onChange, onRemove }) {
  const [item, setItem] = useState('')

  const addItem = () => {
    const v = item.trim()
    if (!v) return
    const next = Array.isArray(block.content) ? [...block.content, v] : [v]
    onChange({ ...block, content: next })
    setItem('')
  }
  const removeItem = (i) => {
    const next = block.content.filter((_, idx) => idx !== i)
    onChange({ ...block, content: next })
  }

  return (
    <div className="rounded-md border p-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          List
        </span>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button type="button" variant="ghost" size="icon" onClick={onRemove}>
              <Trash2 className="w-4 h-4 text-destructive" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Remove block</TooltipContent>
        </Tooltip>
      </div>

      <div className="space-y-2">
        {Array.isArray(block.content) && block.content.length > 0 ? (
          block.content.map((v, i) => (
            <div key={i} className="flex items-center gap-2">
              <Input value={v} onChange={(e) => {
                const next = [...block.content]
                next[i] = e.target.value
                onChange({ ...block, content: next })
              }} />
              <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(i)}>
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </div>
          ))
        ) : (
          <div className="text-xs text-muted-foreground">No items yet.</div>
        )}

        <div className="flex items-center gap-2">
          <Input
            placeholder="New item"
            value={item}
            onChange={(e) => setItem(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addItem()}
          />
          <Button type="button" variant="secondary" onClick={addItem}>Add</Button>
        </div>
      </div>
    </div>
  )
}

function LabelEditor({ block, onChange, onRemove }) {
  const [localBlock, setLocalBlock] = useState(block)

  const handleSave = () => {
    onChange(localBlock)
  }

  useEffect(() => {
    setLocalBlock(block)
  }, [block])

  return (
    <div className="rounded-md border p-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Label
        </span>
        <div className="flex gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button type="button" variant="secondary" size="icon" onClick={handleSave}>
                <Save className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Save changes</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button type="button" variant="ghost" size="icon" onClick={onRemove}>
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Remove block</TooltipContent>
          </Tooltip>
        </div>
      </div>

      <Input
        placeholder="Label (key)"
        value={localBlock.title}
        onChange={(e) => setLocalBlock({ ...localBlock, title: e.target.value })}
        onBlur={handleSave}
      />
      <Input
        placeholder="Value"
        value={localBlock.content}
        onChange={(e) => setLocalBlock({ ...localBlock, content: e.target.value })}
        onBlur={handleSave}
      />
    </div>
  )
}

function KeyValueEditor({ block, onChange, onRemove }) {
  const [localBlock, setLocalBlock] = useState(block)

  const handleSave = () => {
    onChange(localBlock)
  }

  useEffect(() => {
    setLocalBlock(block)
  }, [block])

  return (
    <div className="rounded-md border p-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Key-Value Pair
        </span>
        <div className="flex gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button type="button" variant="secondary" size="icon" onClick={handleSave}>
                <Save className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Save changes</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button type="button" variant="ghost" size="icon" onClick={onRemove}>
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Remove block</TooltipContent>
          </Tooltip>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Input
          placeholder="Field Name (key)"
          value={localBlock.title}
          onChange={(e) => setLocalBlock({ ...localBlock, title: e.target.value })}
          onBlur={handleSave}
        />
        <Input
          placeholder="Field Value"
          value={localBlock.content}
          onChange={(e) => setLocalBlock({ ...localBlock, content: e.target.value })}
          onBlur={handleSave}
        />
      </div>
    </div>
  )
}

// ---- main builder ----------------------------------------------------------
const JsonBlockBuilder = React.memo(function JsonBlockBuilder({
  title = 'JSON Block Builder',
  value,                 // { blocks: [...] } from parent (optional)
  onChange,              // (json) => void
  onSaveTemplate,        // optional callback to save template
  templates = [],        // optional array of templates
  onLoadTemplate,        // optional callback to load template
}) {
  const [blocks, setBlocks] = useState(() => normalizeIncoming(value))
  const [showDiff, setShowDiff] = useState(false)
  const prevValueRef = useRef();
  const onChangeTimeoutRef = useRef()
  const isAddingBlockRef = useRef(false)

  // Only update local state if the parent value object identity changes
  useEffect(() => {
    if (prevValueRef.current !== value) {
      setBlocks(normalizeIncoming(value));
      prevValueRef.current = value;
    }
  }, [value]);

  // emit up to parent on any change
  const outbound = useMemo(() => toOutbound(blocks), [blocks])
  const prevOutboundRef = useRef()

  useEffect(() => {
    // Don't call onChange if we're in the middle of adding a block
    if (onChange && JSON.stringify(outbound) !== JSON.stringify(prevOutboundRef.current) && !isAddingBlockRef.current) {
      prevOutboundRef.current = outbound
      // Debounce the onChange call to prevent rapid updates
      if (onChangeTimeoutRef.current) {
        clearTimeout(onChangeTimeoutRef.current)
      }
      onChangeTimeoutRef.current = setTimeout(() => {
        try {
          console.log('JsonBlockBuilder: Calling onChange with', outbound)
          onChange(outbound);
        } catch (error) {
          console.error('JsonBlockBuilder: Error in onChange', error)
        }
      }, 100); // Increased debounce time
    }
  }, [outbound, onChange]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (onChangeTimeoutRef.current) {
        clearTimeout(onChangeTimeoutRef.current)
      }
    }
  }, []);

  // handle template selection
  const handleTemplateSelect = useCallback((e) => {
    const template = templates.find(t => t.id === e.target.value);
    if (template) {
      try {
        const parsed = JSON.parse(template.json);
        onLoadTemplate(parsed);
      } catch (err) {
        console.error('Failed to parse template:', err);
      }
    }
  }, [templates, onLoadTemplate]);

  // add block factories with controlled onChange
  const addBlock = useCallback((type, content) => {
    console.log('JsonBlockBuilder: Adding block', type)
    isAddingBlockRef.current = true

    setBlocks(prev => {
      const newBlocks = [...prev, { id: uid(), type, title: '', content }]

      // Call onChange after a short delay to ensure state is stable
      setTimeout(() => {
        const newOutbound = toOutbound(newBlocks)
        console.log('JsonBlockBuilder: Calling onChange after adding block', newOutbound)
        if (onChange) {
          onChange(newOutbound);
        }
        isAddingBlockRef.current = false
      }, 50)

      return newBlocks
    })
  }, [onChange])

  const addParagraph = useCallback(() => addBlock('paragraph', ''), [addBlock])
  const addList = useCallback(() => addBlock('list', []), [addBlock])
  const addLabel = useCallback(() => addBlock('label', ''), [addBlock])
  const addKeyValue = useCallback(() => addBlock('keyvalue', ''), [addBlock])

  const updateBlock = useCallback((id, next) => {
    console.log('JsonBlockBuilder: Updating block', id)
    isAddingBlockRef.current = true

    setBlocks(prev => {
      const newBlocks = prev.map(b => (b.id === id ? { ...b, ...next } : b))

      // Call onChange after a short delay
      setTimeout(() => {
        const newOutbound = toOutbound(newBlocks)
        console.log('JsonBlockBuilder: Calling onChange after updating block', newOutbound)
        if (onChange) {
          onChange(newOutbound);
        }
        isAddingBlockRef.current = false
      }, 50)

      return newBlocks
    })
  }, [onChange])

  const removeBlock = useCallback((id) => {
    console.log('JsonBlockBuilder: Removing block', id)
    isAddingBlockRef.current = true

    setBlocks(prev => {
      const newBlocks = prev.filter(b => b.id !== id)

      // Call onChange after a short delay
      setTimeout(() => {
        const newOutbound = toOutbound(newBlocks)
        console.log('JsonBlockBuilder: Calling onChange after removing block', newOutbound)
        if (onChange) {
          onChange(newOutbound);
        }
        isAddingBlockRef.current = false
      }, 50)

      return newBlocks
    })
  }, [onChange])

  const BuilderColumn = (
    <Card className="p-4 space-y-4 w-full">
      <div className="flex items-center gap-2 flex-wrap">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button type="button" variant="outline" size="sm" onClick={addParagraph}>
              <Pilcrow className="w-4 h-4 mr-2" /> P
            </Button>
          </TooltipTrigger>
          <TooltipContent>Create paragraph block</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button type="button" variant="outline" size="sm" onClick={addList}>
              <List className="w-4 h-4 mr-2" /> List
            </Button>
          </TooltipTrigger>
          <TooltipContent>Create list block</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button type="button" variant="outline" size="sm" onClick={addLabel}>
              <Tag className="w-4 h-4 mr-2" /> Label
            </Button>
          </TooltipTrigger>
          <TooltipContent>Create label block</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button type="button" variant="outline" size="sm" onClick={addKeyValue}>
              <Key className="w-4 h-4 mr-2" /> Key-Value
            </Button>
          </TooltipTrigger>
          <TooltipContent>Create key-value pair block</TooltipContent>
        </Tooltip>

        <div className="flex items-center gap-2 ml-auto">
          {/* Template Controls */}
          {onLoadTemplate && templates.length > 0 && (
            <select
              className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground min-w-[150px]"
              onChange={handleTemplateSelect}
              value=""
            >
              <option value="">Load Template</option>
              {templates.map(template => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
          )}

          {onSaveTemplate && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    const name = window.prompt('Enter template name:');
                    if (name) onSaveTemplate(name, JSON.stringify(outbound));
                  }}
                >
                  Save as Template
                </Button>
              </TooltipTrigger>
              <TooltipContent>Save current blocks as a template</TooltipContent>
            </Tooltip>
          )}

          {/* Show/Hide JSON Preview */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button type="button" variant="ghost" size="sm" onClick={() => setShowDiff(v => !v)}>
                <Columns className="w-4 h-4 mr-2" />
                {showDiff ? 'Hide JSON' : 'Show JSON'}
              </Button>
            </TooltipTrigger>
            <TooltipContent>Toggle JSON preview</TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* blocks list */}
      <div className="space-y-3">
        {blocks.length === 0 && (
          <div className="text-sm text-muted-foreground">
            Start by adding a Paragraph, List, or Label block.
          </div>
        )}

        {blocks.map((b) => {
          const common = {
            block: b,
            onChange: (next) => updateBlock(b.id, next),
            onRemove: () => removeBlock(b.id),
          }
          if (b.type === 'paragraph') return <ParagraphEditor key={b.id} {...common} />
          if (b.type === 'list') return <ListEditor key={b.id} {...common} />
          if (b.type === 'label') return <LabelEditor key={b.id} {...common} />
          if (b.type === 'keyvalue') return <KeyValueEditor key={b.id} {...common} />
          // fallback for unknown
          return (
            <div key={b.id} className="rounded-md border p-3 text-sm">
              Unsupported block type: <code>{String(b.type)}</code>
            </div>
          )
        })}
      </div>
    </Card>
  )

  const JsonColumn = (
    <Card className="p-4 overflow-auto">
      <div className="text-sm font-semibold mb-2">JSON Preview</div>
      <pre className="text-xs whitespace-pre-wrap">
        {JSON.stringify(outbound, null, 2)}
      </pre>
    </Card>
  )

  return (
    <TooltipProvider>
      <div className="w-full space-y-4">
        <h1 className="text-xl font-semibold">{title}</h1>

        {showDiff ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {BuilderColumn}
            {JsonColumn}
          </div>
        ) : (
          <div className="space-y-4">
            {BuilderColumn}
          </div>
        )}
      </div>
    </TooltipProvider>
  )
})

export default JsonBlockBuilder
