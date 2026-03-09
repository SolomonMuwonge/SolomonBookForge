
export type Alignment = 'left' | 'center' | 'right' | 'justify';

export interface Chapter {
  id: string;
  title: string;
  content: string;
  alignment?: Alignment;
  backgroundColor?: string;
  textColor?: string;
  workspaceColor?: string;
}

export interface FrontMatter {
  dedication?: string;
  preface?: string;
}

export interface BackMatter {
  aboutAuthor?: string;
  acknowledgments?: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  genre: string;
  description: string;
  chapters: Chapter[];
  createdAt: number;
  workspaceColor?: string;
  backgroundColor?: string;
  textColor?: string;
  // Back Stage additions
  coverImage?: string; // base64 string
  coverColor?: string; // theme color for the cover
  frontMatter?: FrontMatter;
  backMatter?: BackMatter;
}

export type ViewState = 'landing' | 'dashboard' | 'editor' | 'create' | 'reader' | 'backstage';
