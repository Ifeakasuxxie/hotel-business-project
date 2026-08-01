export interface RecreationOption {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export const recreationOptions: RecreationOption[] = [
  {
    id: "snooker",
    title: "Snooker & Billiards",
    description: "Tournament-grade snooker tables in an air-conditioned lounge with professional-grade equipment.",
    icon: "Dices",
  },
  {
    id: "table-tennis",
    title: "Table Tennis",
    description: "Indoor table tennis facilities available for casual matches and friendly competitions.",
    icon: "CircleDot",
  },
  {
    id: "board-games",
    title: "Board Games Lounge",
    description: "A curated selection of classic and modern board games in a comfortable lounge setting.",
    icon: "Gamepad2",
  },
  {
    id: "outdoor",
    title: "Outdoor Activities",
    description: "Organized outdoor activities including guided walks, cycling tours, and garden exploration.",
    icon: "Trees",
  },
];
