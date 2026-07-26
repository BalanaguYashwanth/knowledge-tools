import ideasData from '../data/ideas.json';
import hackathonWinnersData from '../data/hackathon_winners.json';

export const DATASETS = [
  {
    id: 'ideas',
    label: 'Ideas',
    description: 'Solana ecosystem project ideas with problems, solutions, and resources.',
    collection: 'ideas_rag',
    data: ideasData,
    getPreview: (record) => ({
      title: record.title ?? 'Untitled',
      category: record.categories?.join(', '),
      author: record.author_names?.join(', '),
      difficulty: record.difficulty_level,
      published: record.published,
    }),
    searchFields: ['title', 'categories', 'author_names', 'problem', 'solution'],
  },
  {
    id: 'hackathon-winners',
    label: 'Hackathon Winners',
    description: 'Winning projects from Solana hackathons with team and prize details.',
    collection: 'hackathon_winners_rag',
    data: hackathonWinnersData,
    getPreview: (record) => ({
      title: record.title ?? 'Unknown project',
      hackathon: record.hackathon_name,
      prize: record.prize_name,
      country: record.country,
      tracks: record.tracks?.join(', '),
    }),
    searchFields: ['title', 'hackathon_name', 'prize_name', 'country', 'tracks'],
  },
];

export const API_BASE_URL =
  process.env.REACT_APP_API_URL || 'http://localhost:8000';
