// Profile progress on the signed-in home page: a checklist worth 100 points, a level and badges.
// Pure functions over facts the server already loaded, so they are easy to test.

/** What we know about a member, all from their own rows. */
export type ProfileFacts = {
  headline: string;
  location: string;
  bio: string;
  verified: boolean;
  /** Threads plus replies (profiles.post_count, kept by triggers). */
  posts: number;
  /** Has a thread in the Getting Started topic. */
  introduced: boolean;
  topicsFollowed: number;
  alerts: number;
  dealsPosted: number;
  /** Likes on the member's threads. Replies cannot be liked. */
  likesReceived: number;
};

export type ProfileStep = { id: string; label: string; points: number; href: string; done: boolean };

export type ProfileProgress = { steps: ProfileStep[]; points: number; left: number; level: number };

export type ProfileBadge = { id: string; label: string; earned: boolean };

/** The Getting Started topic (categories.id in the seed). */
export const INTRO_CATEGORY = "start";

/**
 * The checklist in order. Points add up to 100. "Analyze a deal" has no data source until the
 * deal calculator exists, so it is always open.
 */
export function profileSteps(f: ProfileFacts): ProfileStep[] {
  return [
    { id: "account", label: "Create your StorageStack account", points: 10, href: "/settings", done: true },
    { id: "headline", label: "Add a headline and location", points: 10, href: "/settings", done: !!f.headline.trim() && !!f.location.trim() },
    { id: "bio", label: "Write a short bio", points: 10, href: "/settings", done: !!f.bio.trim() },
    { id: "topics", label: "Follow 3 forum topics", points: 10, href: "/forums", done: f.topicsFollowed >= 3 },
    { id: "post", label: "Start or reply to a discussion", points: 15, href: "/forums/new", done: f.posts > 0 },
    { id: "intro", label: "Introduce yourself in Getting Started", points: 15, href: `/forums/new?cat=${INTRO_CATEGORY}`, done: f.introduced },
    { id: "alert", label: "Set up a deal alert", points: 15, href: "/deals/alerts", done: f.alerts > 0 },
    // Not built yet: there is no deal calculator, so nothing records an analysis.
    { id: "analyze", label: "Analyze a deal", points: 15, href: "/tools", done: false },
  ];
}

/** 90+ is level 5, 70+ is 4, 50+ is 3, 25+ is 2, anything less is 1. */
export function profileLevel(points: number): number {
  if (points >= 90) return 5;
  if (points >= 70) return 4;
  if (points >= 50) return 3;
  if (points >= 25) return 2;
  return 1;
}

/** Points earned (out of 100), open steps and level. */
export function profileProgress(f: ProfileFacts): ProfileProgress {
  const steps = profileSteps(f);
  const points = steps.reduce((n, s) => n + (s.done ? s.points : 0), 0);
  return { steps, points, left: steps.filter((s) => !s.done).length, level: profileLevel(points) };
}

/** Badges a member has earned or can still earn, all derived from their own data. */
export function profileBadges(f: ProfileFacts): ProfileBadge[] {
  return [
    { id: "member", label: "Member", earned: true },
    { id: "first-post", label: "First post", earned: f.posts > 0 },
    { id: "hello", label: "Said hello", earned: f.introduced },
    { id: "deal", label: "Deal poster", earned: f.dealsPosted > 0 },
    { id: "verified", label: "Verified", earned: f.verified },
    { id: "helpful", label: "Helpful", earned: f.likesReceived >= 10 },
  ];
}
