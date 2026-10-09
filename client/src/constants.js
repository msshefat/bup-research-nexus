export const AREAS = [
  'Artificial Intelligence',
  'Machine Learning',
  'Cybersecurity',
  'Computer Vision',
  'Natural Language Processing',
  'Data Science',
  'Computer Networks',
  'Software Engineering',
  'Communication Systems',
  'Internet of Things',
  'Human-Computer Interaction',
];

export const DEMO_ACCOUNTS = [
  { role: 'Student', email: 'ayesha.karim@bup.edu.bd', note: 'Send a thesis request' },
  { role: 'Faculty', email: 'sharmeen.seema@bup.edu.bd', note: 'Has a pending request' },
  { role: 'Alumni', email: 'mehzabin.chowdhury@bup.edu.bd', note: 'Mentoring is open' },
  { role: 'Admin', email: 'admin@bup.edu.bd', note: 'Verify profiles and theses' },
];

export const DEMO_PASSWORD = 'Nexus@2026';

export function initials(name = '') {
  return name
    .split(' ')
    .filter((part) => part && part !== 'Md.' && part !== 'Dr.')
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

export function tone(name = '') {
  const tones = ['#e0b15a', '#3dbea5', '#8eb4ff', '#e07a7a', '#c4b5fd'];
  const sum = [...name].reduce((total, char) => total + char.charCodeAt(0), 0);
  return tones[sum % tones.length];
}

export function timeAgo(iso) {
  if (!iso) return '';
  const seconds = (Date.now() - new Date(iso).getTime()) / 1000;
  if (Number.isNaN(seconds)) return '';
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 86400 * 14) return `${Math.floor(seconds / 86400)}d ago`;
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}
