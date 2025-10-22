export interface NoteItem {
  checked: boolean;
  body: string;
}

export interface Note {
  title: string;
  type: 'note' | 'checklist';
  items?: NoteItem[];
  body?: string;
  tags: string[];
  createdAt: Date;
  modifiedAt: Date;
  deletedAt?: Date;
}
