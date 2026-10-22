export type Difficulty = 'Easy' | 'Medium' | 'Hard';
export type SupportedLanguage =
  | 'javascript'
  | 'typescript'
  | 'python'
  | 'cpp'
  | 'java'
  | 'c'
  | 'csharp'
  | 'go'
  | 'rust'
  | 'kotlin'
  | 'swift'
  | 'php'
  | 'ruby'
  | 'dart'
  | 'scala'
  | 'r'
  | 'sql'
  | 'bash';
export type CodingPlatform =
  | 'LeetCode'
  | 'HackerRank'
  | 'Codeforces'
  | 'GeeksforGeeks'
  | 'CodeChef'
  | 'NeetCode'
  | 'AtCoder'
  | 'Other Platform';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  rating: number;
  rankTier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond' | 'Grandmaster';
  solvedCount: number;
  battleWins: number;
  battleLosses: number;
  friends: string[];
  activeRoomId?: string;
  isOnline: boolean;
  isAdmin?: boolean;
}

export interface RoomMember {
  id: string;
  name: string;
  avatar: string;
  role: 'owner' | 'member';
  joinedAt: number;
  isReady?: boolean;
}

export interface Room {
  id: string;
  code: string;
  name: string;
  description: string;
  ownerId: string;
  ownerName: string;
  isPrivate: boolean;
  maxSlots: number;
  activeMembers: RoomMember[];
  currentProblemId: string;
  language: SupportedLanguage;
  codeBuffer: string;
  createdAt: number;
}

export interface MessageReaction {
  emoji: string;
  users: string[]; // user IDs
}

export interface Message {
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  text: string;
  codeSnippet?: {
    code: string;
    language: string;
  };
  reactions: Record<string, string[]>; // emoji -> list of userIds
  timestamp: number;
  reported?: boolean;
}

export interface ProblemExample {
  input: string;
  output: string;
  explanation?: string;
}

export interface ProblemTestCase {
  input: any[];
  expected: any;
  isHidden?: boolean;
}

export interface Problem {
  id: string;
  title: string;
  slug: string;
  difficulty: Difficulty;
  category: string;
  description: string;
  examples: ProblemExample[];
  constraints?: string[];
  followUp?: string;
  starterCode: Record<string, string>;
  testCases: ProblemTestCase[];
  hints: string[];
  platformName?: CodingPlatform;
  platformUrl?: string;
  leetcodeUrl?: string; // backwards compatibility
  officialSolutionApproach?: string;
}

export interface BattleParticipant {
  userId: string;
  name: string;
  avatar: string;
  code: string;
  passedTests: number;
  totalTests: number;
  isReady: boolean;
  completedAt?: number;
}

export interface BattleSession {
  id: string;
  roomId: string;
  problemId: string;
  player1: BattleParticipant;
  player2?: BattleParticipant;
  status: 'lobby' | 'countdown' | 'in_progress' | 'finished';
  countdownSeconds: number;
  startTime?: number;
  endTime?: number;
  winnerId?: string;
}

export interface CodeSnapshot {
  id: string;
  roomId: string;
  title: string;
  code: string;
  language: SupportedLanguage;
  savedBy: string;
  createdAt: number;
}

export interface SubscriptionRecord {
  id: string;
  roomId: string;
  roomName: string;
  ownerId: string;
  ownerEmail: string;
  extraSlots: number;
  totalSlots: number;
  monthlyAmount: number;
  status: 'active' | 'pending' | 'expired';
  utrNumber?: string;
  createdAt: number;
  expiresAt: number;
}

export interface TestCaseResult {
  testIndex: number;
  input: any[];
  expected: any;
  actual: any;
  passed: boolean;
  error?: string;
  durationMs: number;
}

export interface ErrorDiagnostic {
  type: 'syntax' | 'runtime' | 'test_failure' | 'timeout' | 'compilation';
  title: string;
  description: string;
  suggestedFix: string;
  fixedCode?: string;
  line?: number;
}

export interface ExecutionResult {
  success: boolean;
  stdout: string;
  testResults: TestCaseResult[];
  totalDurationMs: number;
  error?: string;
  errorDiagnostic?: ErrorDiagnostic;
}

export interface Judge0Config {
  endpoint: string;
  apiKey: string;
  useRapidApi: boolean;
  enabled: boolean;
}
