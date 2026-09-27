// Guidance for each step: a short line in your own words that's always
// shown, and a "More" for going deeper: one short, credited quote from Tara
// Brach, linking to her full description.

export type StepId = 'recognize' | 'allow' | 'investigate' | 'nurture'

export interface StepContent {
  id: StepId
  name: string
  guidance: string
  /** How hard it's raining on this step, 0–1: the storm passes as you go. */
  rain: number
  /** One sentence quoted exactly from Tara Brach's description of RAIN. */
  quote: string
}

/**
 * Tara Brach's full description of RAIN ("RAIN: A Practice of Radical
 * Compassion"), the source of each step's quote; linked from each quote.
 */
export const RAIN_SOURCE_URL = 'https://www.tarabrach.com/rain-practice-radical-compassion/'

export const STEPS: StepContent[] = [
  {
    id: 'recognize',
    name: 'Recognize',
    rain: 1,
    guidance: 'Recognize what’s arising in you.',
    quote:
      'Recognizing means consciously acknowledging, in any given moment, the thoughts, feelings, and behaviors that are affecting you.',
  },
  {
    id: 'allow',
    name: 'Allow',
    rain: 0.75,
    guidance: 'Allow it to be here, without needing it gone.',
    quote: 'Allowing creates a pause that makes it possible to deepen attention.',
  },
  {
    id: 'investigate',
    name: 'Investigate',
    rain: 0.5,
    guidance: 'Investigate with gentleness and wonder.',
    quote:
      'To investigate, call on your natural curiosity—the desire to know truth—and direct a more focused attention to your present experience.',
  },
  {
    id: 'nurture',
    name: 'Nurture',
    rain: 0.25,
    guidance: 'Nurture with a kind heart.',
    quote: 'Self-compassion begins to naturally arise in the moments that you recognize you are suffering.',
  },
]
