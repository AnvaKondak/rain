// Guidance for each step: a few gentle prompts in your own
// words that are always shown, and a "More" for going deeper: one short,
// credited quote from Tara Brach, linking to her full description. Keep the
// prompts original: don't paraphrase her guided scripts or question lists.

export type StepId = 'recognize' | 'allow' | 'investigate' | 'nurture'

/** A screen of the guided meditation: a heading and what to do. */
export interface GuidedContent {
  name: string
  /** Plain instructions for someone new to meditation, shown in order. */
  prompts: string[]
  /** How hard it's raining on this step, 0–1: the storm passes as you go. */
  rain: number
}

export interface StepContent extends GuidedContent {
  id: StepId
  /** One sentence quoted exactly from Tara Brach's description of RAIN. */
  quote: string
}

/**
 * Tara Brach's full description of RAIN ("RAIN: A Practice of Radical
 * Compassion"), the source of each step's quote; linked from each quote.
 */
export const RAIN_SOURCE_URL = 'https://www.tarabrach.com/rain-practice-radical-compassion/'

/** Before the four steps: settling in, and choosing something to meet. */
export const ARRIVE: GuidedContent = {
  name: 'Arrive',
  rain: 1,
  prompts: [
    'Get comfortable, sitting or lying down. Close your eyes or let them rest softly downward.',
    'Notice a few breaths as they come and go, just as they are. There’s no need to change them.',
    'Bring to mind a feeling that\'s been hanging around. A light one is fine.',
  ],
}

export const STEPS: StepContent[] = [
  {
    id: 'recognize',
    name: 'Recognize',
    rain: 1,
    prompts: [
      'Turn your attention inward and notice what’s going on right now.',
      'Maybe there’s a feeling, a thought that keeps circling back, or a tightness somewhere. See if you can give it a simple name.',
    ],
    quote:
      'Recognizing means consciously acknowledging, in any given moment, the thoughts, feelings, and behaviors that are affecting you.',
  },
  {
    id: 'allow',
    name: 'Allow',
    rain: 0.75,
    prompts: [
      'Let whatever you noticed stay just as it is. You don’t have to fix it, explain it, or like it.',
    ],
    quote: 'Allowing creates a pause that makes it possible to deepen attention.',
  },
  {
    id: 'investigate',
    name: 'Investigate',
    rain: 0.5,
    prompts: [
      'Get to know what’s here the way you’d listen to a friend: slowly, without judging.',
      'Notice where it shows up in your body, perhaps your chest, throat, stomach, or face. What’s it like there?',
      'Ask it softly what it’s worried about, and let an answer come if one wants to.',
    ],
    quote:
      'To investigate, call on your natural curiosity—the desire to know truth—and direct a more focused attention to your present experience.',
  },
  {
    id: 'nurture',
    name: 'Nurture',
    rain: 0.25,
    prompts: [
      'Offer this hurting part of you the warmth you’d give someone you love who felt this way.',
      'That could be a hand resting on your chest, a slow breath, or a few kind words, like “it makes sense that this hurts.”',
    ],
    quote: 'Self-compassion begins to naturally arise in the moments that you recognize you are suffering.',
  },
]
