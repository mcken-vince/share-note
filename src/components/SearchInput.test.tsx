import { render, screen, fireEvent } from '@testing-library/react';
import { SearchInput } from './SearchInput';
import type { Note } from '@/types';

const mockNotes: Note[] = [
  {
    id: '1',
    title: 'Meeting Notes',
    type: 'note',
    body: 'Discussion about project timeline',
    tags: ['work', 'meeting'],
    createdAt: new Date('2023-01-01'),
    modifiedAt: new Date('2023-01-01'),
  },
  {
    id: '2',
    title: 'Shopping List',
    type: 'checklist',
    items: [
      { checked: false, body: 'Buy groceries' },
      { checked: false, body: 'Pick up dry cleaning' },
    ],
    tags: ['personal', 'shopping'],
    createdAt: new Date('2023-01-02'),
    modifiedAt: new Date('2023-01-02'),
  },
  {
    id: '3',
    title: 'Weekend Plans',
    type: 'note',
    body: 'Visit the park and have a picnic',
    tags: ['personal', 'weekend'],
    createdAt: new Date('2023-01-03'),
    modifiedAt: new Date('2023-01-03'),
  },
];

describe('SearchInput', () => {
  const mockOnFilteredNotesChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders search input with placeholder', () => {
    render(
      <SearchInput
        notes={mockNotes}
        onFilteredNotesChange={mockOnFilteredNotesChange}
        placeholder="Search notes..."
      />
    );

    expect(screen.getByPlaceholderText('Search notes...')).toBeInTheDocument();
  });

  it('filters notes by title', () => {
    render(
      <SearchInput
        notes={mockNotes}
        onFilteredNotesChange={mockOnFilteredNotesChange}
      />
    );

    const searchInput = screen.getByPlaceholderText('Search notes by title or tags...');
    fireEvent.change(searchInput, { target: { value: 'meeting' } });

    // Check that the callback was called with filtered results
    expect(mockOnFilteredNotesChange).toHaveBeenCalledWith(
      [mockNotes[0]], // Only "Meeting Notes" should match
      true // hasActiveFilter should be true
    );
  });

  it('filters notes by tags', () => {
    render(
      <SearchInput
        notes={mockNotes}
        onFilteredNotesChange={mockOnFilteredNotesChange}
      />
    );

    const searchInput = screen.getByPlaceholderText('Search notes by title or tags...');
    fireEvent.change(searchInput, { target: { value: 'personal' } });

    expect(mockOnFilteredNotesChange).toHaveBeenCalledWith(
      [mockNotes[1], mockNotes[2]], // Shopping List and Weekend Plans
      true
    );
  });

  it('filters notes by content/body', () => {
    render(
      <SearchInput
        notes={mockNotes}
        onFilteredNotesChange={mockOnFilteredNotesChange}
      />
    );

    const searchInput = screen.getByPlaceholderText('Search notes by title or tags...');
    fireEvent.change(searchInput, { target: { value: 'timeline' } });

    expect(mockOnFilteredNotesChange).toHaveBeenCalledWith(
      [mockNotes[0]], // Only Meeting Notes has "timeline" in body
      true
    );
  });

  it('filters notes by checklist items', () => {
    render(
      <SearchInput
        notes={mockNotes}
        onFilteredNotesChange={mockOnFilteredNotesChange}
      />
    );

    const searchInput = screen.getByPlaceholderText('Search notes by title or tags...');
    fireEvent.change(searchInput, { target: { value: 'groceries' } });

    expect(mockOnFilteredNotesChange).toHaveBeenCalledWith(
      [mockNotes[1]], // Shopping List has "groceries" in items
      true
    );
  });

  it('returns all notes when search is empty', () => {
    render(
      <SearchInput
        notes={mockNotes}
        onFilteredNotesChange={mockOnFilteredNotesChange}
      />
    );

    const searchInput = screen.getByPlaceholderText('Search notes by title or tags...');
    
    // Initially should return all notes
    expect(mockOnFilteredNotesChange).toHaveBeenCalledWith(mockNotes, false);

    // Type something then clear it
    fireEvent.change(searchInput, { target: { value: 'test' } });
    fireEvent.change(searchInput, { target: { value: '' } });

    expect(mockOnFilteredNotesChange).toHaveBeenCalledWith(mockNotes, false);
  });

  it('shows clear button when search has value', () => {
    render(
      <SearchInput
        notes={mockNotes}
        onFilteredNotesChange={mockOnFilteredNotesChange}
      />
    );

    const searchInput = screen.getByPlaceholderText('Search notes by title or tags...');
    
    // Clear button should not be visible initially
    expect(screen.queryByTitle('Clear search')).not.toBeInTheDocument();

    // Type something
    fireEvent.change(searchInput, { target: { value: 'test' } });

    // Clear button should now be visible
    expect(screen.getByTitle('Clear search')).toBeInTheDocument();
  });

  it('clears search when clear button is clicked', () => {
    render(
      <SearchInput
        notes={mockNotes}
        onFilteredNotesChange={mockOnFilteredNotesChange}
      />
    );

    const searchInput = screen.getByPlaceholderText('Search notes by title or tags...');
    
    // Type something
    fireEvent.change(searchInput, { target: { value: 'test' } });
    expect(searchInput).toHaveValue('test');

    // Click clear button
    const clearButton = screen.getByTitle('Clear search');
    fireEvent.click(clearButton);

    expect(searchInput).toHaveValue('');
    expect(mockOnFilteredNotesChange).toHaveBeenCalledWith(mockNotes, false);
  });

  it('shows search results count', () => {
    render(
      <SearchInput
        notes={mockNotes}
        onFilteredNotesChange={mockOnFilteredNotesChange}
      />
    );

    const searchInput = screen.getByPlaceholderText('Search notes by title or tags...');
    fireEvent.change(searchInput, { target: { value: 'personal' } });

    expect(screen.getByText('2 of 3 notes shown')).toBeInTheDocument();
  });

  it('shows no results message when no matches found', () => {
    render(
      <SearchInput
        notes={mockNotes}
        onFilteredNotesChange={mockOnFilteredNotesChange}
      />
    );

    const searchInput = screen.getByPlaceholderText('Search notes by title or tags...');
    fireEvent.change(searchInput, { target: { value: 'nonexistent' } });

    expect(screen.getByText('No notes found for "nonexistent"')).toBeInTheDocument();
  });

  it('performs case-insensitive search', () => {
    render(
      <SearchInput
        notes={mockNotes}
        onFilteredNotesChange={mockOnFilteredNotesChange}
      />
    );

    const searchInput = screen.getByPlaceholderText('Search notes by title or tags...');
    fireEvent.change(searchInput, { target: { value: 'MEETING' } });

    expect(mockOnFilteredNotesChange).toHaveBeenCalledWith(
      [mockNotes[0]],
      true
    );
  });
});
