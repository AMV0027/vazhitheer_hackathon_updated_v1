import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './dialog';
import { Input } from './input';
import { Button } from './button';

export default function TemplateSaveDialog({ open, onOpenChange, onSave }) {
  const [name, setName] = useState('');
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Save Template</DialogTitle>
        </DialogHeader>
        <form onSubmit={e => { e.preventDefault(); onSave(name); setName(''); }} className="space-y-4">
          <Input value={name} onChange={e => setName(e.target.value)} placeholder="Template name" required />
          <Button type="submit">Save</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
