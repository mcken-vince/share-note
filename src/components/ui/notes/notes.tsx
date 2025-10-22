'use client'
import { useState } from "react";
import { Button } from "../button";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "../table";
import { Input } from "../input";
import { Label } from "../label";
import { Checkbox } from "../checkbox";
import { Bomb as BombIcon, X as XIcon } from "lucide-react";
import { ConfirmationModal, NewNoteModal } from "../modals";
import { TagList } from "../TagList";
import type { Note } from "@/types";

export const Notes = () => {
  // Initialize with sample data for testing
  const [notes, setNotes] = useState<Note[]>([
    {
      title: 'Sample Note',
      type: 'note',
      body: 'This is a sample note content.',
      tags: ['work', 'important'],
      createdAt: new Date(Date.now() - 86400000), // 1 day ago
      modifiedAt: new Date(Date.now() - 3600000), // 1 hour ago
    },
    {
      title: 'Shopping List',
      type: 'checklist',
      items: [
        { checked: true, body: 'Milk' },
        { checked: false, body: 'Bread' },
        { checked: false, body: 'Eggs' },
      ],
      tags: ['personal', 'shopping'],
      createdAt: new Date(Date.now() - 172800000), // 2 days ago
      modifiedAt: new Date(Date.now() - 3600000), // 1 hour ago
    },
  ]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<Note | null>(null);
  const [showNewNoteModal, setShowNewNoteModal] = useState(false);

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

  /**
   * Opens the delete confirmation modal for a specific note
   */
  function handleDeleteClick(note: Note) {
    setNoteToDelete(note);
    setShowDeleteConfirm(true);
  }

  /**
   * Deletes a note from the notes list
   */
  function deleteNote() {
    if (noteToDelete) {
      setNotes(prev => prev.filter(note => note.createdAt !== noteToDelete.createdAt));
      if (selectedNote && selectedNote.createdAt === noteToDelete.createdAt) {
        setSelectedNote(null);
        setEditMode(false);
      }
    }
    setNoteToDelete(null);
    setShowDeleteConfirm(false);
  }

  /**
   * Creates a new note with the provided data
   */
  function createNote(noteData: { title: string; type: 'note' | 'checklist'; tags: string[] }) {
    const newNote: Note = {
      title: noteData.title,
      type: noteData.type,
      items: noteData.type === 'checklist' ? [] : undefined,
      body: noteData.type === 'note' ? '' : undefined,
      tags: noteData.tags,
      createdAt: new Date(),
      modifiedAt: new Date(),
    };
    setNotes(prev => [...prev, newNote]);
  }

  /**
   * Removes a checklist item from the selected note
   */
  function removeChecklistItem(itemIndex: number) {
    if (selectedNote && selectedNote.type === 'checklist') {
      const updatedNote = {
        ...selectedNote,
        items: selectedNote.items?.filter((_, index) => index !== itemIndex) || [],
        modifiedAt: new Date(),
      };
      setSelectedNote(updatedNote);
      saveNote(updatedNote);
    }
  }

  if (selectedNote) {
    return (
      <div>
        <div className="flex justify-between items-center mb-2">
          <Button onClick={() => setSelectedNote(null)}>{'<- '}</Button>
          <div className="flex gap-2">
            <Button 
              variant="destructive" 
              size="icon" 
              onClick={() => handleDeleteClick(selectedNote)}
              title="Delete note"
            >
              <BombIcon className="h-4 w-4" />
            </Button>
            <Button onClick={() => !editMode ? setEditMode(true) : saveAndCloseNote(selectedNote)}>
              {editMode ? 'Save' : 'Edit'}
            </Button>
          </div>
        </div>
        <div className="p-2">
          <div className="grid gap-4">
            <div>
              <Label>Title</Label>
              {editMode ? <Input value={selectedNote.title} onChange={(event) => updateSelectedNote({title: event.target.value})} /> :
                <h1>{selectedNote.title}</h1>}
            </div>
            
            <div>
              <Label>Tags</Label>
              {selectedNote.tags.length > 0 ? (
                <TagList tags={selectedNote.tags} maxDisplay={10} className="mt-2" />
              ) : (
                <p className="text-muted-foreground text-sm mt-2">No tags</p>
              )}
            </div>
          </div>
        </div>
        {selectedNote.type === 'checklist' ?
          <>
            <ul>
              {selectedNote.items?.map((item, index) => (
                <li key={index} className="flex items-center gap-2 px-4 py-2 group">
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
                  />
                  <div className="flex-1">
                    {editMode ?
                      <Input value={item.body} onChange={(event) => setSelectedNote(prev => prev ? { ...prev, items: [...(prev.items || []).map((listItem, idx) => idx === index ? ({ ...listItem, body: event.target.value }) : listItem)] } : prev)} />
                      : <span className={item.checked ? 'line-through text-muted-foreground' : ''}>{item.body}</span>}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeChecklistItem(index)}
                    title="Delete item"
                    className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <XIcon className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
            {editMode &&
              <Button onClick={() => setSelectedNote(prev => prev ? { ...prev, items: [...(prev.items || []), { body: '', checked: false }] } : prev)}>Add Item</Button>
            }
          </>
          : <p>{selectedNote.body}</p>}

        <ConfirmationModal
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          onConfirm={deleteNote}
          title="Delete Note"
          description={`Are you sure you want to delete "${noteToDelete?.title}"? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          variant="destructive"
        />
        <NewNoteModal
          isOpen={showNewNoteModal}
          onClose={() => setShowNewNoteModal(false)}
          onCreateNote={createNote}
        />
      </div>
    )
  }


  return (
    <div>
      <div className="flex justify-between items-center p-2">

        <h1>All Notes</h1>

        <Button onClick={() => setShowNewNoteModal(true)}>
          New Note
        </Button>
      </div>
      <Table>
        <TableCaption>My Notes</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Tags</TableHead>
            <TableHead className="text-right">Last Modified</TableHead>
            <TableHead className="w-16">Actions</TableHead>

          </TableRow>
        </TableHeader>
        <TableBody>
          {notes.toSorted((a, b) => b.modifiedAt.getTime() - a.modifiedAt.getTime()).map((note) => (
            <TableRow key={`note-${note.createdAt.toDateString()}`}>
              <TableCell className="font-medium cursor-pointer" onClick={() => { setSelectedNote(note); setEditMode(false); }}>
                {note.title}
              </TableCell>
              <TableCell className="cursor-pointer" onClick={() => { setSelectedNote(note); setEditMode(false); }}>
                {note.type}
              </TableCell>
              <TableCell className="cursor-pointer" onClick={() => { setSelectedNote(note); setEditMode(false); }}>
                <TagList tags={note.tags} maxDisplay={2} />
              </TableCell>
              <TableCell className="text-right cursor-pointer" onClick={() => { setSelectedNote(note); setEditMode(false); }}>
                {note.modifiedAt.getDate() === new Date().getDate() ? note.modifiedAt.toLocaleTimeString(undefined, { month: 'short', day: '2-digit' }) : note.modifiedAt.toLocaleDateString()}
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteClick(note);
                  }}
                  title="Delete note"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                >
                  <BombIcon className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={deleteNote}
        title="Delete Note"
        description={`Are you sure you want to delete "${noteToDelete?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
      />
      <NewNoteModal
        isOpen={showNewNoteModal}
        onClose={() => setShowNewNoteModal(false)}
        onCreateNote={createNote}
      />
    </div>
  )

}
