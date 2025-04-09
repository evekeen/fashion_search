import { SearchResponse, SearchResult } from './frontend.js';

export async function getSearchResults(query: string): Promise<SearchResponse> {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const mockResults: SearchResult[] = [
        {
            description: query,
            price: '$49.99',
            thumbnailURL: 'https://picsum.photos/400/400',
            productURL: 'https://example.com/product1',
        },
        {
            description: `${query} - Style 2`,
            price: '$59.99',
            thumbnailURL: 'https://picsum.photos/400/401',
            productURL: 'https://example.com/product2',
        },
        {
            description: `${query} - Style 3`,
            price: '$69.99',
            thumbnailURL: 'https://picsum.photos/400/402',
            productURL: 'https://example.com/product3',
        },
    ];

    return {
        results: mockResults,
    };
}

export async function getSearchResultsReal(query: string): Promise<SearchResponse> {
    const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
    });

    if (!response.ok) {
        throw new Error(`Search request failed: ${response.statusText}`);
    }

    return await response.json();
}

export async function getBatchSearchResults(queries: string[]): Promise<Record<string, SearchResult[]>> {
    const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ queries }),
    });

    if (!response.ok) {
        throw new Error(`Batch search request failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.results;
}