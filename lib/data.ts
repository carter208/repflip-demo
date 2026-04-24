export type Tier = "Bronze" | "Silver" | "Gold" | "Platinum";

export interface Review {
  id: string;
  businessName: string;
  businessType: string;
  rating: number;
  tags: string[];
  notes?: string;
  date: string;
}

export interface Consumer {
  id: string;
  name: string;
  phone: string;
  email: string;
  city: string;
  score: number;
  tier: Tier;
  points: number;
  memberSince: string;
  reviews: Review[];
}

export const BEHAVIORAL_TAGS = [
  { id: "on-time", label: "Showed up on time", positive: true },
  { id: "paid-immediately", label: "Paid immediately", positive: true },
  { id: "easy-communication", label: "Easy to communicate", positive: true },
  { id: "respectful", label: "Respectful", positive: true },
  { id: "no-show", label: "No-show", positive: false },
  { id: "disputed-payment", label: "Disputed payment", positive: false },
  { id: "aggressive", label: "Aggressive", positive: false },
  { id: "scope-creep", label: "Scope creep", positive: false },
];

export function getTierFromScore(score: number): Tier {
  if (score >= 90) return "Platinum";
  if (score >= 75) return "Gold";
  if (score >= 55) return "Silver";
  return "Bronze";
}

export const TIER_CONFIG: Record<Tier, { color: string; bg: string; border: string; glow: string; text: string }> = {
  Bronze: {
    color: "#cd7f32",
    bg: "bg-amber-900/20",
    border: "border-amber-700/40",
    glow: "shadow-[0_0_24px_rgba(205,127,50,0.25)]",
    text: "text-amber-600",
  },
  Silver: {
    color: "#9ca3af",
    bg: "bg-slate-700/20",
    border: "border-slate-500/40",
    glow: "shadow-[0_0_24px_rgba(156,163,175,0.2)]",
    text: "text-slate-400",
  },
  Gold: {
    color: "#f59e0b",
    bg: "bg-yellow-900/20",
    border: "border-yellow-600/40",
    glow: "shadow-[0_0_24px_rgba(245,158,11,0.3)]",
    text: "text-yellow-400",
  },
  Platinum: {
    color: "#e2e8f0",
    bg: "bg-sky-900/20",
    border: "border-sky-400/40",
    glow: "shadow-[0_0_24px_rgba(186,230,253,0.25)]",
    text: "text-sky-200",
  },
};

export const CONSUMERS: Consumer[] = [
  {
    id: "1",
    name: "Marcus Thompson",
    phone: "(312) 555-0142",
    email: "marcus.t@email.com",
    city: "Boise, ID",
    score: 94,
    tier: "Platinum",
    points: 4820,
    memberSince: "Jan 2024",
    reviews: [
      {
        id: "r1",
        businessName: "ProClean Services",
        businessType: "House Cleaning",
        rating: 5,
        tags: ["Paid immediately", "Easy to communicate", "Respectful"],
        notes: "Marcus was incredibly easy to work with. Tipped generously and left great feedback.",
        date: "Mar 28, 2026",
      },
      {
        id: "r2",
        businessName: "Elite HVAC Solutions",
        businessType: "HVAC Repair",
        rating: 5,
        tags: ["Showed up on time", "Paid immediately", "Easy to communicate"],
        notes: "Had the house ready for us, payment processed on the spot. Would service again.",
        date: "Feb 14, 2026",
      },
      {
        id: "r3",
        businessName: "Greenfield Landscaping",
        businessType: "Landscaping",
        rating: 5,
        tags: ["Respectful", "Easy to communicate", "Paid immediately"],
        date: "Jan 5, 2026",
      },
    ],
  },
  {
    id: "2",
    name: "Sarah Chen",
    phone: "(415) 555-0287",
    email: "s.chen@email.com",
    city: "Nampa, ID",
    score: 81,
    tier: "Gold",
    points: 2140,
    memberSince: "Mar 2024",
    reviews: [
      {
        id: "r4",
        businessName: "Apex Plumbing",
        businessType: "Plumbing",
        rating: 4,
        tags: ["Paid immediately", "Easy to communicate"],
        notes: "Good client, slight communication lag at first but resolved quickly.",
        date: "Apr 2, 2026",
      },
      {
        id: "r5",
        businessName: "SunBright Solar",
        businessType: "Solar Installation",
        rating: 4,
        tags: ["Respectful", "Showed up on time"],
        date: "Feb 22, 2026",
      },
      {
        id: "r6",
        businessName: "FreshCoat Painters",
        businessType: "Painting",
        rating: 3,
        tags: ["Scope creep"],
        notes: "Added significant scope mid-project without discussion. Paid but pushed boundaries.",
        date: "Dec 10, 2025",
      },
    ],
  },
  {
    id: "3",
    name: "DeShawn Williams",
    phone: "(713) 555-0093",
    email: "deshawn.w@email.com",
    city: "Meridian, ID",
    score: 62,
    tier: "Silver",
    points: 880,
    memberSince: "Jun 2024",
    reviews: [
      {
        id: "r7",
        businessName: "Swift Electric Co.",
        businessType: "Electrical",
        rating: 3,
        tags: ["Paid immediately"],
        notes: "Payment was fine but communication was difficult to schedule.",
        date: "Mar 15, 2026",
      },
      {
        id: "r8",
        businessName: "TrueBlue Roofing",
        businessType: "Roofing",
        rating: 2,
        tags: ["No-show", "Scope creep"],
        notes: "Missed initial walkthrough without notice. Project eventually completed.",
        date: "Jan 30, 2026",
      },
    ],
  },
  {
    id: "4",
    name: "Rebecca Okafor",
    phone: "(202) 555-0318",
    email: "r.okafor@email.com",
    city: "Eagle, ID",
    score: 38,
    tier: "Bronze",
    points: 210,
    memberSince: "Sep 2024",
    reviews: [
      {
        id: "r9",
        businessName: "ClearView Windows",
        businessType: "Window Installation",
        rating: 1,
        tags: ["No-show", "Disputed payment", "Aggressive"],
        notes: "Did not show for scheduled appointment, disputed invoice, and was combative via text.",
        date: "Mar 5, 2026",
      },
      {
        id: "r10",
        businessName: "HandyPros LLC",
        businessType: "General Contracting",
        rating: 2,
        tags: ["Disputed payment"],
        notes: "Attempted to dispute legitimate charges. Resolved after documentation provided.",
        date: "Nov 18, 2025",
      },
    ],
  },
];
