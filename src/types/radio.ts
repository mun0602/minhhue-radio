export interface Track {
  title: string;
  url: string;
  category: string;
  originalIndex?: number;
}

export interface Category {
  id: string;
  name: string;
  path: string;
  group: "minh-hue" | "tu-kiem";
}
