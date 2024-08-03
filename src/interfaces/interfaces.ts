export interface Theme {
  id: string;
  name: string;
}

export interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface Option {
  id: string;
  text: string;
}

export interface History {
  history: string[];
  options: Option[];
}
