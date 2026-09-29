// "Learn more about RAIN": the teachers and books behind the practice.
// Descriptions are placeholder wording, meant to be rewritten in your own
// voice. Mark your own picks with `pick: true` (shown with a 🪷).

import { PERSONAL_NOTE } from './about.ts'

export interface Resource {
  title: string
  author?: string
  note: string
  url: string
  pick?: boolean
}

export interface ResourceSection {
  heading: string
  items: Resource[]
}

export const RESOURCES_INTRO = `RAIN was created by Michele McDonald and deepened into a self-compassion practice by Tara Brach. ${PERSONAL_NOTE} These are the teachers and books behind it.`

// A short history of the practice, in your own words.
export const ORIGINAL_RAIN = {
  heading: 'The original RAIN',
  intro: 'Michele McDonald, a Vipassana meditation teacher, first taught RAIN as four qualities of mindfulness:',
  steps: [
    { name: 'Recognition', line: 'noticing what’s here.' },
    { name: 'Acceptance', line: 'letting it be, without resisting.' },
    { name: 'Interest', line: 'looking closely, with curiosity.' },
    { name: 'Non-identification', line: 'seeing that what’s happening isn’t all of who you are.' },
  ],
  outro: 'Tara Brach later made the last step Nurture, bringing in self-compassion. This app follows her version.',
  links: [
    {
      title: 'RAIN & DROP at Vipassana Hawai‘i',
      author: 'Vipassana Hawai‘i',
      note: 'Her practice explained by the meditation center she co-founded.',
      url: 'https://vipassanahawaii.org/resources/raindrop/',
    },
    {
      title: 'RAIN: The Nourishing Art of Mindful Inquiry',
      author: 'Michele McDonald',
      note: 'Her online course on Tricycle (paid, with a free preview).',
      url: 'https://learn.tricycle.org/p/rain',
    },
  ],
}

// Books by other authors link to an Open Library search: free, and no store.
const openLibrary = (title: string, author: string) =>
  `https://openlibrary.org/search?q=${encodeURIComponent(`${title} ${author}`)}`

export const RESOURCE_SECTIONS: ResourceSection[] = [
  {
    heading: 'Start here',
    items: [
      {
        title: 'Radical Compassion',
        author: 'Tara Brach',
        note: 'The book built around RAIN, step by step, with stories and practices.',
        url: 'https://www.tarabrach.com/books/radical-compassion/',
        pick: true,
      },
      {
        title: 'Free RAIN meditations and talks',
        author: 'Tara Brach',
        note: 'Guided RAIN meditations you can listen to, free on her website.',
        url: 'https://www.tarabrach.com/rain/',
      },
      {
        title: 'Radical Compassion study guide',
        author: 'Tara Brach',
        note: 'A free guide for going through the book alone or with a group (sent by email).',
        url: 'https://tarabrach.ac-page.com/rcstudyguide',
      },
    ],
  },
  {
    heading: 'More from Tara',
    items: [
      {
        title: 'Radical Acceptance',
        author: 'Tara Brach',
        note: 'Meeting your life, and yourself, with an accepting heart.',
        url: 'https://www.tarabrach.com/books/radical-acceptance/',
      },
      {
        title: 'True Refuge',
        author: 'Tara Brach',
        note: 'Finding a sense of home and peace inside, even in hard times.',
        url: 'https://www.tarabrach.com/books/true-refuge/',
      },
      {
        title: 'Trusting the Gold',
        author: 'Tara Brach',
        note: 'A small illustrated book about the goodness at the heart of each of us.',
        url: 'https://www.tarabrach.com/books/trusting-the-gold/',
      },
    ],
  },
  {
    heading: 'Books Tara recommends',
    items: [
      {
        title: 'The Miracle of Mindfulness',
        author: 'Thich Nhat Hanh',
        note: 'Gentle, practical mindfulness for ordinary moments like washing dishes.',
        url: openLibrary('The Miracle of Mindfulness', 'Thich Nhat Hanh'),
      },
      {
        title: 'Being Peace',
        author: 'Thich Nhat Hanh',
        note: 'How peace in the world begins with how we are, moment to moment.',
        url: openLibrary('Being Peace', 'Thich Nhat Hanh'),
      },
      {
        title: 'Self-Compassion',
        author: 'Kristin Neff',
        note: 'What self-compassion is, why it helps, and how to practice it.',
        url: openLibrary('Self-Compassion', 'Kristin Neff'),
      },
      {
        title: 'The Mindful Path to Self-Compassion',
        author: 'Chris Germer',
        note: 'Loosening the grip of harsh thoughts and difficult emotions.',
        url: openLibrary('The Mindful Path to Self-Compassion', 'Christopher Germer'),
      },
      {
        title: 'The Places That Scare You',
        author: 'Pema Chödrön',
        note: 'Turning toward fear and difficulty with gentleness instead of running.',
        url: openLibrary('The Places That Scare You', 'Pema Chodron'),
      },
      {
        title: 'Mindfulness in Plain English',
        author: 'Henepola Gunaratana',
        note: 'Clear, down-to-earth instruction in how to meditate.',
        url: openLibrary('Mindfulness in Plain English', 'Gunaratana'),
      },
      {
        title: 'A Plea for the Animals',
        author: 'Matthieu Ricard',
        note: 'The moral, philosophical, and evolutionary imperative to treat all beings with compassion.',
        url: openLibrary('A Plea for the Animals', 'Matthieu Ricard'),
      },
      {
        title: 'Tara’s full reading list',
        note: 'Every book she recommends, grouped by tradition and theme.',
        url: 'https://www.tarabrach.com/reading/',
      },
    ],
  },
]
