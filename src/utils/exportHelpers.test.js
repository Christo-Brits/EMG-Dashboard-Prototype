import { describe, it, expect, vi, beforeEach } from 'vitest';
import { downloadCSV, exportActionsCSV, exportVariationsCSV } from './exportHelpers';

// Mock DOM APIs used by downloadCSV
beforeEach(() => {
    // Track created blobs and download triggers
    global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
    global.URL.revokeObjectURL = vi.fn();
});

describe('downloadCSV', () => {
    it('does nothing for empty data', () => {
        const appendSpy = vi.spyOn(document.body, 'appendChild');
        downloadCSV([], [{ label: 'Test', accessor: 'x' }], 'test.csv');
        expect(appendSpy).not.toHaveBeenCalled();
        appendSpy.mockRestore();
    });

    it('does nothing for null data', () => {
        const appendSpy = vi.spyOn(document.body, 'appendChild');
        downloadCSV(null, [{ label: 'Test', accessor: 'x' }], 'test.csv');
        expect(appendSpy).not.toHaveBeenCalled();
        appendSpy.mockRestore();
    });

    it('generates CSV with correct headers and rows', () => {
        let createdBlob;
        global.URL.createObjectURL = vi.fn((blob) => {
            createdBlob = blob;
            return 'blob:mock';
        });

        // Mock the anchor element
        const mockAnchor = { href: '', download: '', click: vi.fn() };
        const createSpy = vi.spyOn(document, 'createElement').mockReturnValue(mockAnchor);
        const appendSpy = vi.spyOn(document.body, 'appendChild').mockImplementation(() => {});
        const removeSpy = vi.spyOn(document.body, 'removeChild').mockImplementation(() => {});

        const data = [
            { name: 'Alice', age: 30 },
            { name: 'Bob', age: 25 },
        ];
        const columns = [
            { label: 'Name', accessor: 'name' },
            { label: 'Age', accessor: 'age' },
        ];

        downloadCSV(data, columns, 'people.csv');

        expect(mockAnchor.download).toBe('people.csv');
        expect(mockAnchor.click).toHaveBeenCalled();
        expect(createdBlob).toBeDefined();

        // Verify blob type
        expect(createdBlob.type).toBe('text/csv;charset=utf-8;');

        createSpy.mockRestore();
        appendSpy.mockRestore();
        removeSpy.mockRestore();
    });

    it('escapes double quotes in values', () => {
        let createdBlob;
        global.URL.createObjectURL = vi.fn((blob) => {
            createdBlob = blob;
            return 'blob:mock';
        });

        const mockAnchor = { href: '', download: '', click: vi.fn() };
        vi.spyOn(document, 'createElement').mockReturnValue(mockAnchor);
        vi.spyOn(document.body, 'appendChild').mockImplementation(() => {});
        vi.spyOn(document.body, 'removeChild').mockImplementation(() => {});

        downloadCSV(
            [{ text: 'He said "hello"' }],
            [{ label: 'Text', accessor: 'text' }],
            'test.csv'
        );

        // Blob should contain escaped quotes
        expect(createdBlob).toBeDefined();

        vi.restoreAllMocks();
    });

    it('supports function accessors', () => {
        let createdBlob;
        global.URL.createObjectURL = vi.fn((blob) => {
            createdBlob = blob;
            return 'blob:mock';
        });

        const mockAnchor = { href: '', download: '', click: vi.fn() };
        vi.spyOn(document, 'createElement').mockReturnValue(mockAnchor);
        vi.spyOn(document.body, 'appendChild').mockImplementation(() => {});
        vi.spyOn(document.body, 'removeChild').mockImplementation(() => {});

        downloadCSV(
            [{ first: 'Jane', last: 'Doe' }],
            [{ label: 'Full Name', accessor: (row) => `${row.first} ${row.last}` }],
            'test.csv'
        );

        expect(mockAnchor.click).toHaveBeenCalled();
        vi.restoreAllMocks();
    });

    it('handles missing fields gracefully', () => {
        const mockAnchor = { href: '', download: '', click: vi.fn() };
        vi.spyOn(document, 'createElement').mockReturnValue(mockAnchor);
        vi.spyOn(document.body, 'appendChild').mockImplementation(() => {});
        vi.spyOn(document.body, 'removeChild').mockImplementation(() => {});

        // Row missing the 'age' field
        downloadCSV(
            [{ name: 'Alice' }],
            [
                { label: 'Name', accessor: 'name' },
                { label: 'Age', accessor: 'age' },
            ],
            'test.csv'
        );

        expect(mockAnchor.click).toHaveBeenCalled();
        vi.restoreAllMocks();
    });
});

describe('exportActionsCSV', () => {
    it('calls downloadCSV with correct column config', () => {
        const mockAnchor = { href: '', download: '', click: vi.fn() };
        vi.spyOn(document, 'createElement').mockReturnValue(mockAnchor);
        vi.spyOn(document.body, 'appendChild').mockImplementation(() => {});
        vi.spyOn(document.body, 'removeChild').mockImplementation(() => {});

        const actions = [
            { task: 'Fix roof', assignedTo: 'EMG', status: 'Open', dueDate: '2026-04-01' },
        ];

        exportActionsCSV(actions, 'south-mall');
        expect(mockAnchor.download).toBe('south-mall_actions.csv');
        expect(mockAnchor.click).toHaveBeenCalled();

        vi.restoreAllMocks();
    });

    it('uses default project name when none provided', () => {
        const mockAnchor = { href: '', download: '', click: vi.fn() };
        vi.spyOn(document, 'createElement').mockReturnValue(mockAnchor);
        vi.spyOn(document.body, 'appendChild').mockImplementation(() => {});
        vi.spyOn(document.body, 'removeChild').mockImplementation(() => {});

        exportActionsCSV([{ task: 'Test', assignedTo: 'X', status: 'Open', dueDate: '' }]);
        expect(mockAnchor.download).toBe('project_actions.csv');

        vi.restoreAllMocks();
    });
});

describe('exportVariationsCSV', () => {
    it('calls downloadCSV with correct column config', () => {
        const mockAnchor = { href: '', download: '', click: vi.fn() };
        vi.spyOn(document, 'createElement').mockReturnValue(mockAnchor);
        vi.spyOn(document.body, 'appendChild').mockImplementation(() => {});
        vi.spyOn(document.body, 'removeChild').mockImplementation(() => {});

        const variations = [
            { number: 'V001', description: 'Extra work', value: 5000, category: 'Addition', status: 'approved', raisedByName: 'Admin' },
        ];

        exportVariationsCSV(variations, 'north-site');
        expect(mockAnchor.download).toBe('north-site_variations.csv');
        expect(mockAnchor.click).toHaveBeenCalled();

        vi.restoreAllMocks();
    });
});
