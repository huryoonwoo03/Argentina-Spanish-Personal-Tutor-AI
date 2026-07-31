export interface CultureTopicMeta {
  slug: string;
  title: string;
  category: "food" | "football" | "history" | "music" | "movies" | "travel" | "current_events" | "social_etiquette";
  icon: string;
  isCurrentEvent: boolean;
}

export const CULTURE_TOPICS: CultureTopicMeta[] = [
  { slug: "asado-culture", title: "Asado culture", category: "food", icon: "flame", isCurrentEvent: false },
  { slug: "mate-ritual", title: "The mate ritual", category: "food", icon: "coffee", isCurrentEvent: false },
  { slug: "football-rivalries", title: "River vs. Boca and other rivalries", category: "football", icon: "circle-dot", isCurrentEvent: false },
  { slug: "tango-history", title: "Tango: from arrabal to global stage", category: "music", icon: "music", isCurrentEvent: false },
  { slug: "argentine-cinema", title: "Argentine cinema worth knowing", category: "movies", icon: "clapperboard", isCurrentEvent: false },
  { slug: "buenos-aires-neighborhoods", title: "Buenos Aires neighborhoods, barrio by barrio", category: "travel", icon: "map", isCurrentEvent: false },
  { slug: "porteño-etiquette", title: "Porteño social etiquette", category: "social_etiquette", icon: "users", isCurrentEvent: false },
  { slug: "this-week-in-argentina", title: "This week in Argentina", category: "current_events", icon: "newspaper", isCurrentEvent: true },
];
