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
    getPreview: (record) => {
      const winner = record.prizeGroups?.[0]?.winners?.[0];
      return {
        title: winner?.name ?? 'Unknown project',
        hackathon: record.hackathon?.name,
        prize: record.prizeGroups?.[0]?.name,
        country: winner?.country,
        tracks: winner?.tracks?.join(', '),
      };
    },
    searchFields: ['name', 'hackathon', 'prize'],
  },
];

export const API_BASE_URL =
  process.env.REACT_APP_API_URL || 'http://localhost:8000';
