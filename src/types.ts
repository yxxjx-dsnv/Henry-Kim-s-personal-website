export type LinkedLine = {
  prefix: string;
  link?: { label: string; url?: string };
  suffix?: string;
};

export type ResumeLine = LinkedLine & {
  date: string;
  detail?: string[];
};

export type Activity = ResumeLine;
export type Education = ResumeLine;
