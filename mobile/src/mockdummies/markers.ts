export interface Talent {
  id: string;
  userId: string;
  name: string;
  lat: number;
  lng: number;
  shortBio: string;
  avatar: string;
  skills: { name: string }[];
  isActive: boolean;
}

export const mockTalents: Talent[] = [
  { id: '1', userId: 'user1', name: 'John', lat: 52.3676, lng: 4.9041, shortBio: 'Web Developer', avatar: 'https://i.pravatar.cc/150?img=1', skills: [{ name: 'React' }, { name: 'Node.js' }], isActive: true },
  { id: '2', userId: 'user2', name: 'Jane', lat: 52.375, lng: 4.905, shortBio: 'UI Designer', avatar: 'https://i.pravatar.cc/150?img=2', skills: [{ name: 'Figma' }, { name: 'CSS' }], isActive: true },
  { id: '3', userId: 'user3', name: 'Bob', lat: 52.36, lng: 4.895, shortBio: 'Mobile Dev', avatar: 'https://i.pravatar.cc/150?img=3', skills: [{ name: 'React Native' }, { name: 'Flutter' }], isActive: true },
  { id: '4', userId: 'user4', name: 'Lisa', lat: 52.37, lng: 4.91, shortBio: 'Product Manager', avatar: 'https://i.pravatar.cc/150?img=4', skills: [{ name: 'Leadership' }, { name: 'Analytics' }], isActive: true },
  { id: '5', userId: 'user5', name: 'Mark', lat: 52.371, lng: 4.898, shortBio: 'DevOps Engineer', avatar: 'https://i.pravatar.cc/150?img=5', skills: [{ name: 'Docker' }, { name: 'Kubernetes' }], isActive: true },
  { id: '6', userId: 'user6', name: 'Sarah', lat: 52.364, lng: 4.912, shortBio: 'Data Scientist', avatar: 'https://i.pravatar.cc/150?img=6', skills: [{ name: 'Python' }, { name: 'ML' }], isActive: true },
  { id: '7', userId: 'user7', name: 'Tom', lat: 52.372, lng: 4.9, shortBio: 'Backend Developer', avatar: 'https://i.pravatar.cc/150?img=7', skills: [{ name: 'Java' }, { name: 'Spring' }], isActive: true },
  { id: '8', userId: 'user8', name: 'Emma', lat: 52.365, lng: 4.908, shortBio: 'UX Researcher', avatar: 'https://i.pravatar.cc/150?img=8', skills: [{ name: 'Research' }, { name: 'Usability' }], isActive: true },
  { id: '9', userId: 'user9', name: 'Lucas', lat: 52.369, lng: 4.902, shortBio: 'Full Stack Dev', avatar: 'https://i.pravatar.cc/150?img=9', skills: [{ name: 'Vue.js' }, { name: 'Express' }], isActive: true },
  { id: '10', userId: 'user10', name: 'Sophie', lat: 52.38, lng: 4.92, shortBio: 'QA Engineer', avatar: 'https://i.pravatar.cc/150?img=10', skills: [{ name: 'Testing' }, { name: 'Automation' }], isActive: true },
  { id: '11', userId: 'user11', name: 'Alex', lat: 52.35, lng: 4.885, shortBio: 'Security Expert', avatar: 'https://i.pravatar.cc/150?img=11', skills: [{ name: 'Cybersecurity' }, { name: 'Pentesting' }], isActive: true },
  { id: '12', userId: 'user12', name: 'Nina', lat: 52.382, lng: 4.915, shortBio: 'Scrum Master', avatar: 'https://i.pravatar.cc/150?img=12', skills: [{ name: 'Agile' }, { name: 'Coaching' }], isActive: true },
  { id: '13', userId: 'user13', name: 'Daniel', lat: 52.355, lng: 4.89, shortBio: 'Cloud Architect', avatar: 'https://i.pravatar.cc/150?img=13', skills: [{ name: 'AWS' }, { name: 'Azure' }], isActive: true },
  { id: '14', userId: 'user14', name: 'Laura', lat: 52.39, lng: 4.91, shortBio: 'Content Strategist', avatar: 'https://i.pravatar.cc/150?img=14', skills: [{ name: 'SEO' }, { name: 'Copywriting' }], isActive: true },
  { id: '15', userId: 'user15', name: 'Peter', lat: 51.9225, lng: 4.4792, shortBio: 'Blockchain Dev', avatar: 'https://i.pravatar.cc/150?img=15', skills: [{ name: 'Solidity' }, { name: 'Web3' }], isActive: true },
];
