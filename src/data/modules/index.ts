import type { LearningModule } from '../../types/modules';

/**
 * Module 1: Greetings & Introductions
 * Foundation module teaching basic greetings, introductions, and simple present tense
 */
const module1: LearningModule = {
  id: 'module-1',
  title: 'Greetings & Introductions',
  description: 'Learn basic greetings, how to introduce yourself, and simple present tense',
  order: 1,
  vocabTextIds: ['module-1-vocab-1', 'module-1-vocab-2', 'module-1-vocab-3'],
  grammarTextId: 'module-1-grammar-1',
  grammarTextIds: ['module-1-grammar-1', 'module-1-grammar-2', 'module-1-grammar-3'],
  sentenceIds: [
    'greetings-1',
    'greetings-2',
    'greetings-3',
    'greetings-4',
    'greetings-5',
    'greetings-6',
    'greetings-7',
    'greetings-8',
    'greetings-9',
    'greetings-10',
  ],
};

/**
 * Module 2: At Home
 * Building on Module 1, teaches home-related vocabulary and location phrases
 */
const module2: LearningModule = {
  id: 'module-2',
  title: 'At Home',
  description: 'Learn vocabulary about home, family, and daily life at home',
  order: 2,
  vocabTextIds: ['module-2-vocab'],
  grammarTextId: 'module-2-grammar',
  sentenceIds: [
    'home-1',
    'home-2',
    'home-3',
    'home-4',
    'home-5',
    'home-6',
    'home-7',
    'home-8',
    'home-9',
    'home-10',
  ],
  prerequisiteModuleId: 'module-1',
};

/**
 * Module 3: Food & Eating
 * Teaches food vocabulary and dining-related verbs
 */
const module3: LearningModule = {
  id: 'module-3',
  title: 'Food & Eating',
  description: 'Learn vocabulary for food, dining, and expressing preferences',
  order: 3,
  vocabTextIds: ['module-3-vocab'],
  grammarTextId: 'module-3-grammar',
  sentenceIds: [
    'food-1',
    'food-2',
    'food-3',
    'food-4',
    'food-5',
    'food-6',
    'food-7',
    'food-8',
    'food-9',
    'food-10',
  ],
  prerequisiteModuleId: 'module-2',
};

/**
 * Module 4: Numbers & Time
 * Teaches time expressions and basic numbers
 */
const module4: LearningModule = {
  id: 'module-4',
  title: 'Numbers & Time',
  description: 'Learn to talk about time, schedules, and when things happen',
  order: 4,
  vocabTextIds: ['module-4-vocab'],
  grammarTextId: 'module-4-grammar',
  sentenceIds: [
    'time-1',
    'time-2',
    'time-3',
    'time-4',
    'time-5',
    'time-6',
    'time-7',
    'time-8',
    'time-9',
    'time-10',
  ],
  prerequisiteModuleId: 'module-3',
};

/**
 * All learning modules in order
 */
export const learningModules: LearningModule[] = [
  module1,
  module2,
  module3,
  module4,
];

/**
 * Get a module by ID
 */
export function getModuleById(id: string): LearningModule | undefined {
  return learningModules.find(m => m.id === id);
}

/**
 * Get modules in learning path order
 */
export function getModulesInOrder(): LearningModule[] {
  return [...learningModules].sort((a, b) => a.order - b.order);
}
