'use client'
import { useState, useEffect } from "react";
import { Button } from "../button";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "../table";
import { Input } from "../input";
import { Label } from "../label";
import { Checkbox } from "../checkbox";
import { Textarea } from "../textarea";
import { Bomb as BombIcon, X as XIcon, Plus as PlusIcon } from "lucide-react";
import { ConfirmationModal, NewNoteModal } from "../modals";
import { TagList } from "../TagList";
import { TagInput, SearchInput } from "../../";
import { useNotesApi } from "@/hooks/useNotesApi";
import type { Note } from "@/types";

export const Notes = () => {
  const { notes, loading, error, saveError, createNote, updateNote, deleteNote } = useNotesApi();
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<Note | null>(null);
  const [showNewNoteModal, setShowNewNoteModal] = useState(false);
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);
  const [hasSearchFilter, setHasSearchFilter] = useState(false);

  // Initialize filtered notes when notes load
  useEffect(() => {
    if (notes.length > 0 && filteredNotes.length === 0 && !hasSearchFilter) {
      setFilteredNotes(notes);
    }
  }, [notes, filteredNotes.length, hasSearchFilter]);

function updateSelectedNote(update: Partial<Note>) {
  setSelectedNote(prev => prev ? { ...prev, ...update } : prev);
}

  async function checkNoteItemBox(noteId: string, itemIndex: number, checked: boolean) {
    const note = notes.find(n => n.id === noteId);
    if (note && note.items) {
      const updatedItems = note.items.map((item, idx) => 
        idx === itemIndex ? { ...item, checked } : item
      );
      
      try {
        await updateNote(noteId, { items: updatedItems });
        
        // Update selected note if it's the same note
        if (selectedNote?.id === noteId) {
          setSelectedNote(prev => prev ? { ...prev, items: updatedItems } : prev);
        }
      } catch (error) {
        console.error('Failed to update checklist item:', error);
      }
    }
  }

  async function saveNote(note: Note) {
    try {
      await updateNote(note.id, {
        title: note.title,
        body: note.body,
        items: note.items,
        tags: note.tags
      });
    } catch (error) {
      console.error('Failed to save note:', error);
    }
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
  async function handleDeleteNote() {
    if (noteToDelete) {
      try {
        await deleteNote(noteToDelete.id);
        if (selectedNote && selectedNote.id === noteToDelete.id) {
          setSelectedNote(null);
          setEditMode(false);
        }
      } catch (error) {
        console.error('Failed to delete note:', error);
      }
    }
    setNoteToDelete(null);
    setShowDeleteConfirm(false);
  }

  /**
   * Creates a new note with the provided data
   */
  async function handleCreateNote(noteData: { title: string; type: 'note' | 'checklist'; tags: string[] }) {
    try {
      await createNote(noteData);
    } catch (error) {
      console.error('Failed to create note:', error);
      // You could show a toast notification here
    }
  }

  /**
   * Removes a checklist item from the selected note
   */
  async function removeChecklistItem(itemIndex: number) {
    if (selectedNote && selectedNote.type === 'checklist') {
      const updatedItems = selectedNote.items?.filter((_, index) => index !== itemIndex) || [];
      const updatedNote = {
        ...selectedNote,
        items: updatedItems,
      };
      setSelectedNote(updatedNote);
      
      try {
        await updateNote(selectedNote.id, { items: updatedItems });
      } catch (error) {
        console.error('Failed to remove checklist item:', error);
      }
    }
  }

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading notes...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-destructive mb-4">Error loading notes: {error}</p>
          <Button onClick={() => window.location.reload()}>
            Reload Page
          </Button>
        </div>
      </div>
    );
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
        <div className="p-4 space-y-6">
          <div className="grid gap-4">
            <div>
              <Label htmlFor="title-input">Title</Label>
              {editMode ? (
                <Input 
                  id="title-input"
                  value={selectedNote.title} 
                  onChange={(event) => updateSelectedNote({title: event.target.value})} 
                  className="mt-2"
                />
              ) : (
                <h1 className="text-2xl font-semibold mt-2">{selectedNote.title}</h1>
              )}
            </div>
            
            <div>
              <Label htmlFor="tags-input">Tags</Label>
              {editMode ? (
                <TagInput
                  tags={selectedNote.tags}
                  onChange={(tags) => updateSelectedNote({tags})}
                  className="mt-2"
                  placeholder="Add a tag..."
                />
              ) : (
                selectedNote.tags.length > 0 ? (
                  <TagList tags={selectedNote.tags} maxDisplay={10} className="mt-2" />
                ) : (
                  <p className="text-muted-foreground text-sm mt-2">No tags</p>
                )
              )}
            </div>

            {selectedNote.type === 'note' && (
              <div>
                <Label htmlFor="body-input">Content</Label>
                {editMode ? (
                  <Textarea 
                    id="body-input"
                    value={selectedNote.body || ''} 
                    onChange={(event) => updateSelectedNote({body: event.target.value})} 
                    className="mt-2 min-h-[200px]"
                    placeholder="Write your note content here..."
                  />
                ) : (
                  <div className="mt-2 p-3 bg-muted rounded-md min-h-[100px] whitespace-pre-wrap">
                    {selectedNote.body || <span className="text-muted-foreground">No content</span>}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        {selectedNote.type === 'checklist' && (
          <div className="px-4 space-y-4">
            <div>
              <Label>Checklist Items</Label>
              <div className="mt-2 space-y-2">
                {selectedNote.items?.map((item, index) => (
                  <div key={index} className="flex items-center gap-3 p-2 rounded-lg border group hover:bg-muted/50">
                    <Checkbox 
                      checked={item.checked} 
                      className="h-5 w-5"
                      onCheckedChange={async (checked) => {
                        const updatedItems = selectedNote.items?.map((listItem, idx) => 
                          idx === index ? { ...listItem, checked: !!checked } : listItem
                        ) || [];
                        setSelectedNote(prev => prev ? { ...prev, items: updatedItems } : prev);
                        if (typeof checked === 'boolean') {
                          await checkNoteItemBox(selectedNote.id, index, checked);
                        }
                      }}
                    />
                    <div className="flex-1">
                      {editMode ? (
                        <Input 
                          value={item.body} 
                          onChange={(event) => {
                            const updatedItems = selectedNote.items?.map((listItem, idx) => 
                              idx === index ? { ...listItem, body: event.target.value } : listItem
                            ) || [];
                            setSelectedNote(prev => prev ? { ...prev, items: updatedItems } : prev);
                          }}
                          className="border-0 bg-transparent p-0 h-auto focus-visible:ring-0"
                          placeholder="Enter item text..."
                        />
                      ) : (
                        <span className={item.checked ? 'line-through text-muted-foreground' : ''}>
                          {item.body || <span className="text-muted-foreground italic">Empty item</span>}
                        </span>
                      )}
                    </div>
                    {editMode && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeChecklistItem(index)}
                        title="Delete item"
                        className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <BombIcon className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                )) || []}
                
                {selectedNote.items?.length === 0 && (
                  <p className="text-muted-foreground text-sm py-8 text-center border-2 border-dashed rounded-lg">
                    No items in this checklist yet.
                  </p>
                )}
              </div>
            </div>
            
            {editMode && (
              <Button 
                onClick={() => setSelectedNote(prev => prev ? { 
                  ...prev, 
                  items: [...(prev.items || []), { body: '', checked: false }] 
                } : prev)}
                variant="outline"
                className="w-full"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            )}
          </div>
        )}

        <ConfirmationModal
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          onConfirm={handleDeleteNote}
          title="Delete Note"
          description={`Are you sure you want to delete "${noteToDelete?.title}"? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          variant="destructive"
        />
        <NewNoteModal
          isOpen={showNewNoteModal}
          onClose={() => setShowNewNoteModal(false)}
          onCreateNote={handleCreateNote}
        />
      </div>
    )
  }


  // Get the notes to display  
  const notesToDisplay = hasSearchFilter || filteredNotes.length > 0 ? filteredNotes : notes;

  return (
    <div>
      <div className="space-y-4 p-4">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1">
            <h1 className="text-2xl font-bold mb-2">All Notes</h1>
            {saveError && (
              <p className="text-sm text-destructive">
                Save error: {saveError}
              </p>
            )}
          </div>

          <Button onClick={() => setShowNewNoteModal(true)}>
            New Note
          </Button>
        </div>

        {/* Search Input */}
        <SearchInput
          notes={notes}
          onFilteredNotesChange={(filtered, hasFilter) => {
            setFilteredNotes(filtered);
            setHasSearchFilter(hasFilter);
          }}
          className="max-w-md"
        />
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
          {notesToDisplay.toSorted((a, b) => new Date(b.modifiedAt).getTime() - new Date(a.modifiedAt).getTime()).map((note) => (
            <TableRow key={`note-${note.id}`}>
              <TableCell className="font-medium cursor-pointer" onClick={() => { setSelectedNote(note); setEditMode(false); }}>
                {note.title || <span className="text-muted-foreground italic">Untitled</span>}
              </TableCell>
              <TableCell className="cursor-pointer" onClick={() => { setSelectedNote(note); setEditMode(false); }}>
                <span className="capitalize">{note.type}</span>
              </TableCell>
              <TableCell className="cursor-pointer" onClick={() => { setSelectedNote(note); setEditMode(false); }}>
                <TagList tags={note.tags} maxDisplay={2} />
              </TableCell>
              <TableCell className="text-right cursor-pointer" onClick={() => { setSelectedNote(note); setEditMode(false); }}>
                {new Date(note.modifiedAt).getDate() === new Date().getDate() ? 
                  new Date(note.modifiedAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }) : 
                  new Date(note.modifiedAt).toLocaleDateString()}
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
        onConfirm={handleDeleteNote}
        title="Delete Note"
        description={`Are you sure you want to delete "${noteToDelete?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
      />
      <NewNoteModal
        isOpen={showNewNoteModal}
        onClose={() => setShowNewNoteModal(false)}
        onCreateNote={handleCreateNote}
      />
    </div>
  )

}
