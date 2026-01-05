export interface Talent {
  id: number;
  name: string;
  lat: number;
  lng: number;
  shortBio: string;
  avatar: string;
  skills: { name: string }[];
}

export const mockTalents: Talent[] = [
  // Amsterdam Center
  {
    id: 1,
    name: 'John',
    lat: 52.3676,
    lng: 4.9041,
    shortBio: 'Web Developer',
    avatar: 'https://i.pravatar.cc/150?img=1',
    skills: [{ name: 'React' }, { name: 'Node.js' }],
  },
  {
    id: 2,
    name: 'Jane',
    lat: 52.375,
    lng: 4.905,
    shortBio: 'UI Designer',
    avatar: 'https://i.pravatar.cc/150?img=2',
    skills: [{ name: 'Figma' }, { name: 'CSS' }],
  },
  {
    id: 3,
    name: 'Bob',
    lat: 52.36,
    lng: 4.895,
    shortBio: 'Mobile Dev',
    avatar: 'https://i.pravatar.cc/150?img=3',
    skills: [{ name: 'React Native' }, { name: 'Flutter' }],
  },
  {
    id: 4,
    name: 'Lisa',
    lat: 52.37,
    lng: 4.91,
    shortBio: 'Product Manager',
    avatar: 'https://i.pravatar.cc/150?img=4',
    skills: [{ name: 'Leadership' }, { name: 'Analytics' }],
  },

  // Amsterdam - nearby (1-3 km)
  {
    id: 5,
    name: 'Mark',
    lat: 52.371,
    lng: 4.898,
    shortBio: 'DevOps Engineer',
    avatar: 'https://i.pravatar.cc/150?img=5',
    skills: [{ name: 'Docker' }, { name: 'Kubernetes' }],
  },
  {
    id: 6,
    name: 'Sarah',
    lat: 52.364,
    lng: 4.912,
    shortBio: 'Data Scientist',
    avatar: 'https://i.pravatar.cc/150?img=6',
    skills: [{ name: 'Python' }, { name: 'ML' }],
  },
  {
    id: 7,
    name: 'Tom',
    lat: 52.372,
    lng: 4.9,
    shortBio: 'Backend Developer',
    avatar: 'https://i.pravatar.cc/150?img=7',
    skills: [{ name: 'Java' }, { name: 'Spring' }],
  },
  {
    id: 8,
    name: 'Emma',
    lat: 52.365,
    lng: 4.908,
    shortBio: 'UX Researcher',
    avatar: 'https://i.pravatar.cc/150?img=8',
    skills: [{ name: 'Research' }, { name: 'Usability' }],
  },
  {
    id: 9,
    name: 'Lucas',
    lat: 52.369,
    lng: 4.902,
    shortBio: 'Full Stack Dev',
    avatar: 'https://i.pravatar.cc/150?img=9',
    skills: [{ name: 'Vue.js' }, { name: 'Express' }],
  },

  // Amsterdam - slightly further (3-8 km)
  {
    id: 10,
    name: 'Sophie',
    lat: 52.38,
    lng: 4.92,
    shortBio: 'QA Engineer',
    avatar: 'https://i.pravatar.cc/150?img=10',
    skills: [{ name: 'Testing' }, { name: 'Automation' }],
  },
  {
    id: 11,
    name: 'Alex',
    lat: 52.35,
    lng: 4.885,
    shortBio: 'Security Expert',
    avatar: 'https://i.pravatar.cc/150?img=11',
    skills: [{ name: 'Cybersecurity' }, { name: 'Pentesting' }],
  },
  {
    id: 12,
    name: 'Nina',
    lat: 52.382,
    lng: 4.915,
    shortBio: 'Scrum Master',
    avatar: 'https://i.pravatar.cc/150?img=12',
    skills: [{ name: 'Agile' }, { name: 'Coaching' }],
  },
  {
    id: 13,
    name: 'Daniel',
    lat: 52.355,
    lng: 4.89,
    shortBio: 'Cloud Architect',
    avatar: 'https://i.pravatar.cc/150?img=13',
    skills: [{ name: 'AWS' }, { name: 'Azure' }],
  },
  {
    id: 14,
    name: 'Laura',
    lat: 52.39,
    lng: 4.91,
    shortBio: 'Content Strategist',
    avatar: 'https://i.pravatar.cc/150?img=14',
    skills: [{ name: 'SEO' }, { name: 'Copywriting' }],
  },

  // Rotterdam (60 km from Amsterdam)
  {
    id: 15,
    name: 'Peter',
    lat: 51.9225,
    lng: 4.4792,
    shortBio: 'Blockchain Dev',
    avatar: 'https://i.pravatar.cc/150?img=15',
    skills: [{ name: 'Solidity' }, { name: 'Web3' }],
  },
];
