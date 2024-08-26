'use client'
import { useState } from "react";
import { Button } from "../button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "../table";
import { Input } from "../input";
import { Label } from "../label";
import { Checkbox } from "../checkbox";

export type Note = { title: string, type: 'note' | 'checklist', items?: {checked: boolean, body: string}[], body?: string, createdAt: Date, modifiedAt: Date, deletedAt?: Date };

export const Notes = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [editMode, setEditMode] = useState(false);

function updateSelectedNote(update: Partial<Note>) {
  setSelectedNote(prev => prev ? { ...prev, ...update } : prev);
}

  function checkNoteItemBox(index: number, checked: boolean) {
    setNotes(prev => prev.map((prevNote, idx) => index === idx ? { ...prevNote, modifiedAt: new Date(), checked } : prevNote));
  }

  function saveNote(note: Note) {
    setNotes(prev => prev.map(prevNote => prevNote.createdAt === note.createdAt ? { ...note, modifiedAt: new Date() } : prevNote));
  }

  function closeNote() {
    setEditMode(false);
    setSelectedNote(null);
  }

  function saveAndCloseNote(note: Note) {
    saveNote(note);
    closeNote()
  }

  if (selectedNote) {
    return (
      <div>
        <div className="flex justify-between items-center mb-2">
          <Button onClick={() => setSelectedNote(null)}>{'<- '}</Button>
          <Button onClick={() => !editMode ? setEditMode(true) : saveAndCloseNote(selectedNote)}>{editMode ? 'Save' : 'Edit'}</Button>
        </div>
        <div className="p-2">

          <Label>Title</Label>
          {editMode ? <Input value={selectedNote.title} onChange={(event) => updateSelectedNote({title: event.target.value})} /> :
            <h1>{selectedNote.title}</h1>}
        </div>
        {selectedNote.type === 'checklist' ?
          <>
            <ul>
              {selectedNote.items?.map((item, index) => (

                <li key={index} className="flex items-center gap-2 px-4 py-2">
                  <Checkbox checked={item.checked} className="h-7 w-7"
                    onCheckedChange={(checked) => {
                      setSelectedNote(prev => prev ? {
                        ...prev, items: [...(prev.items || []).map((listItem, idx) => idx === index ? {
                          ...listItem, checked: !!checked
                        } : listItem
                        )]
                      } : prev);
                      if (typeof checked === 'boolean') {
                        checkNoteItemBox(index, checked);
                      }
                    }}
                  /> {editMode ?
                    <Input value={item.body} onChange={(event) => setSelectedNote(prev => prev ? { ...prev, items: [...(prev.items || []).map((listItem, idx) => idx === index ? ({ ...listItem, body: event.target.value }) : listItem)] } : prev)} />
                    : item.body}</li>
              ))}
            </ul>
            {editMode &&
              <Button onClick={() => setSelectedNote(prev => prev ? { ...prev, items: [...(prev.items || []), { body: '', checked: false }] } : prev)}>Add Item</Button>
            }
          </>
          : <p>{selectedNote.body}</p>}

      </div>
    )
  }


  return (
    <div>
      <div className="flex justify-between items-center p-2">

        <h1>All Notes</h1>

        <Select onValueChange={(value: string) => {
          if (value === 'note' || value === 'checklist') {
            setNotes(prev => [...prev, { title: `New ${value === 'checklist' ? 'Checklist' : 'Note'}`, type: value, items: [], body: '', createdAt: new Date(), modifiedAt: new Date() }]);
          }
        }} >
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="New Note" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="note">Note</SelectItem>
            <SelectItem value="checklist">Checklist</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Table>
        <TableCaption>My Notes</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Type</TableHead>
            <TableHead className="text-right">Last Modified</TableHead>

          </TableRow>
        </TableHeader>
        <TableBody>
          {notes.toSorted((a, b) => b.modifiedAt.getTime() - a.modifiedAt.getTime()).map((note) => (
            <TableRow key={`note-${note.createdAt.toDateString()}`} onClick={() => { setSelectedNote(note); setEditMode(false); }}>
              <TableCell className="font-medium">{note.title}</TableCell>
              <TableCell>{note.type}</TableCell>
              <TableCell className="text-right">{note.modifiedAt.getDate() === new Date().getDate() ? note.modifiedAt.toLocaleTimeString(undefined, { month: 'short', day: '2-digit' }) : note.modifiedAt.toLocaleDateString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {/* <ul>
        {notes.map((note, index) => (
          <li key={index}>{note.title}</li>
        ))}
      </ul> */}
    </div>
  )

}