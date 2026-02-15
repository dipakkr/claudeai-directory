export interface User {
  id: string;
  email: string;
  username: string;
  name?: string;
  avatar?: string;
  bio?: string;
  role: string;
  plan: string;
  created_at: string;
}

export interface PublicProfile {
  id: string;
  username: string;
  name?: string;
  avatar?: string;
  bio?: string;
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface Skill {
  id: string;
  name: string;
  title: string;
  description: string;
  content?: string;
  category: string;
  tags: string[];
  source: string;
  location?: string;
  github_url?: string;
  triggers: string[];
  downloads: number;
  rating: number;
  review_count: number;
  verified: boolean;
  featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface MCPAuthor {
  name: string;
  url: string;
}

export interface MCPBranding {
  icon_url: string;
  logo: string;
  background_pattern: string;
  images: Array<{ prompt: string; imageUrl: string }>;
  hero_video_id: string;
  hero_video_preview: string;
}

export interface MCPConnection {
  url: string;
  transport: string;
  is_authless: boolean;
  required_fields: Array<Record<string, unknown>>;
  server_label: string;
  claude_code_command: string;
  claude_code_setup_link: string;
}

export interface MCPCapabilities {
  tools: string[];
  prompts: string[];
  permissions: string;
  use_cases: string[];
  works_with: string[];
  has_mcp_app: boolean;
}

export interface MCPLinks {
  directory_url: string;
  documentation: string;
  support: string;
  privacy_policy: string;
  repository: string;
  website: string;
}

export interface MCPServer {
  id: string;
  name: string;
  slug: string;
  one_liner: string;
  description: string;
  html_content: string;
  version: string;
  category: string;
  branding: MCPBranding;
  connection: MCPConnection;
  capabilities: MCPCapabilities;
  author: MCPAuthor;
  links: MCPLinks;
  // Legacy fields
  full_name?: string;
  install_command?: string;
  compatibility: string[];
  official: boolean;
  github_url?: string;
  documentation_url?: string;
  stars: number;
  trending: boolean;
  features: string[];
  config_example?: Record<string, unknown>;
  use_cases: string[];
  tags: string[];
  published_on?: string;
  updated_on?: string;
  created_at: string;
  updated_at: string;
}

export interface Prompt {
  id: string;
  title: string;
  description: string;
  category: string;
  prompt: string;
  variables: Array<Record<string, unknown>>;
  example_input?: string;
  example_output?: string;
  complexity: string;
  use_cases: string[];
  tags: string[];
  upvotes: number;
  author_id?: string;
  verified: boolean;
  created_at: string;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  logo?: string;
  location: string;
  salary_range?: string;
  type: string;
  experience?: string;
  skills_required: string[];
  description: string;
  apply_url: string;
  featured: boolean;
  source: string;
  source_url?: string;
  expires_at?: string;
  created_at: string;
}

export interface ShowcaseProject {
  id: string;
  title: string;
  description: string;
  images: string[];
  demo_url?: string;
  github_url?: string;
  tech_stack: string[];
  skills_used: string[];
  author_id?: string;
  upvotes: number;
  featured: boolean;
  created_at: string;
}

export interface BlogPost {
  id: string;
  title: string;
  category: string;
  difficulty: string;
  tags: string[];
  content: string;
  author: string;
  author_avatar?: string;
  cover_image?: string;
  read_time: number;
  featured: boolean;
  seo_description?: string;
  related_skills: string[];
  related_mcps: string[];
  published_at?: string;
  created_at: string;
}

export interface Review {
  id: string;
  rating: number;
  comment?: string;
  user_id: string;
  target_type: string;
  target_id: string;
  created_at: string;
}

export interface Bookmark {
  id: string;
  user_id: string;
  target_type: string;
  target_id: string;
  created_at: string;
}

export interface APIPricing {
  id: string;
  provider: string;
  model: string;
  input_price: number;
  output_price: number;
  context_window: number;
  features: string[];
  best_for: string[];
}

export interface CostComparison {
  provider: string;
  model: string;
  input_cost: number;
  output_cost: number;
  total_cost: number;
}

export interface Stat {
  id: string;
  label: string;
  value: string;
  description: string;
}

export interface Thread {
  id: string;
  title: string;
  body: string;
  author: string;
  author_avatar?: string;
  tags: string[];
  replies: number;
  views: number;
  created_at: string;
}

export interface Reply {
  id: string;
  thread_id: string;
  body: string;
  author: string;
  author_avatar?: string;
  parent_id?: string;
  upvotes: number;
  created_at: string;
}

export interface FeedItem {
  id: string;
  type: "skill" | "mcp" | "job" | "prompt" | "showcase" | "blog" | "post" | "news";
  title: string;
  description: string;
  url?: string;
  points: number;
  author: string;
  tags: string[];
  created_at: string;
}

export interface SearchResult {
  _type: string;
  id: string;
  title?: string;
  name?: string;
  description: string;
  [key: string]: unknown;
}

export interface GuideLessonSummary {
  id: string;
  title: string;
  order: number;
  is_free: boolean;
  estimated_time: number;
}

export interface GuideChapterSummary {
  id: string;
  title: string;
  order: number;
  lessons: GuideLessonSummary[];
}

export interface Guide {
  id: string;
  title: string;
  description: string;
  category: string;
  cover_image?: string;
  author: string;
  difficulty: string;
  tags: string[];
  is_free: boolean;
  price: number;
  total_lessons: number;
  estimated_time: number;
  featured: boolean;
  created_at: string;
}

export interface GuideDetail extends Guide {
  chapters: GuideChapterSummary[];
}

export interface GuideLesson {
  id: string;
  title: string;
  order: number;
  is_free: boolean;
  content: string;
  estimated_time: number;
  chapter_id: string;
  chapter_title: string;
  guide_id: string;
  guide_title: string;
  prev_lesson?: { id: string; title: string; chapter_id: string };
  next_lesson?: { id: string; title: string; chapter_id: string };
}

export interface GuideProgress {
  id?: string;
  user_id: string;
  guide_id: string;
  completed_lessons: string[];
  last_lesson_id?: string;
  last_accessed_at?: string;
  started_at?: string;
  completed_at?: string;
}
