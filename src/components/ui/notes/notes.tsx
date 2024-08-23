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

export type Note = { title: string, type: 'note' | 'checklist', items?: any[], body?: string, createdAt: Date, modifiedAt: Date, deletedAt?: Date };

export const Notes = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [editMode, setEditMode] = useState(false);

function saveNote(note: Note) {
  setNotes(prev => prev.map(prevNote => prevNote.createdAt === note.createdAt ? {...note, modifiedAt: new Date()} : prevNote));
  setEditMode(false);
  setSelectedNote(null);
}

  if (selectedNote) {
    return (
      <div>
        <div className="flex justify-between items-center mb-2">
          <Button onClick={() => setSelectedNote(null)}>{'<- '}</Button>
          <Button onClick={() => !editMode ? setEditMode(true) : saveNote(selectedNote)}>{editMode ? 'Save' : 'Edit'}</Button>
          </div>
       <div className="p-2">

        <Label>Title</Label>
        {editMode ? <Input value={selectedNote.title} onChange={(event) => setSelectedNote(prev => (prev ? {...prev, title: event.target.value} : prev))}/> :
        <h1>{selectedNote.title}</h1>}
        </div>
        {selectedNote.type === 'checklist' ?
        <ul>
          {selectedNote.items?.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
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
          {notes.map((note) => (
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