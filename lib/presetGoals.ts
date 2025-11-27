import { PresetGoal } from '@/types'

export const presetGoals: PresetGoal[] = [
  // Fitness
  { id: 'fitness-1', text: 'Run 5 km', trackType: 'Fitness' },
  { id: 'fitness-2', text: 'Lose 10 lbs', trackType: 'Fitness' },
  { id: 'fitness-3', text: 'Complete 30-day challenge', trackType: 'Fitness' },
  { id: 'fitness-4', text: 'Bench press 100 lbs', trackType: 'Fitness' },
  
  // Academics
  { id: 'academics-1', text: 'Score above 80 on midterm', trackType: 'Academics' },
  { id: 'academics-2', text: 'Complete all assignments', trackType: 'Academics' },
  { id: 'academics-3', text: 'Maintain 3.5 GPA', trackType: 'Academics' },
  { id: 'academics-4', text: 'Finish research paper', trackType: 'Academics' },
  
  // Healthy Eating
  { id: 'eating-1', text: 'Cook 5 home meals this week', trackType: 'Healthy Eating' },
  { id: 'eating-2', text: 'Drink 8 glasses of water daily', trackType: 'Healthy Eating' },
  { id: 'eating-3', text: 'Eat 5 servings of vegetables', trackType: 'Healthy Eating' },
  
  // Makeup
  { id: 'makeup-1', text: 'Master winged eyeliner', trackType: 'Makeup' },
  { id: 'makeup-2', text: 'Try new color palette', trackType: 'Makeup' },
  
  // General
  { id: 'general-1', text: 'Save $500', trackType: 'General' },
  { id: 'general-2', text: 'Complete project', trackType: 'General' },
]

export function getPresetGoalsForTrack(trackName: string): PresetGoal[] {
  return presetGoals.filter(
    (goal) => goal.trackType === trackName || !goal.trackType
  )
}

