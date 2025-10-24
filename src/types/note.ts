export interface NoteItem {
  checked: boolean;
  body: string;
}

export interface Note {
  id: string;
  title: string;
  type: 'note' | 'checklist';
  items?: NoteItem[];
  body?: string;
  tags: string[];
  createdAt: Date;
  modifiedAt: Date;
  deletedAt?: Date;
}
