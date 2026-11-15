// A legal document as data: title, last-updated date, an intro, then numbered
// sections of paragraphs.
export interface LegalSection {
  heading: string;
  body: string[];
}

export interface LegalDoc {
  title: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
}

// The controller / service provider, shown in both documents.
export const ADMIN = { pl: 'Krystian Gaik', en: 'Krystian Gaik' };
export const EMAIL = 'lift4mee@gmail.com';
export const HOSTING = {
  pl: 'Fly.io, Inc. (serwery w Amsterdamie, Holandia)',
  en: 'Fly.io, Inc. (servers in Amsterdam, the Netherlands)',
};
export const UPDATED = '2026-11-14';
