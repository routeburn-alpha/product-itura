# Quiz content structure

Use this guide when adding published quiz packs under
`app/src/lib/data/packs`. Packs should be self-contained JSON files that the
existing pack loader can read without extra registration.

## Pack shape

Each pack represents one learner-ready quiz:

```json
{
  "id": "beginner-fundamentals",
  "title": "Beginner Fundamentals",
  "category": "Beginner / Fundamentals",
  "description": "A short learner-facing summary of the quiz outcome.",
  "questions": []
}
```

- `id` is lower-kebab-case and must match the file name.
- `title` should be clear in the pack picker and avoid internal labels.
- `category` uses `Difficulty / Theme` for idea #4 content.
- `description` names the learning outcome, not the implementation details.
- `questions` should contain 8-12 beginner questions, 10-15 intermediate
  questions, or 12-18 advanced questions.

## Difficulty tiers

| Tier | Difficulty value | Question count | Learner expectation |
| --- | --- | --- | --- |
| Beginner | `1` | 8-12 | Recall core concepts, identify simple patterns, and apply one rule at a time. |
| Intermediate | `2` | 10-15 | Work through short scenarios, compare tradeoffs, and combine two or more concepts. |
| Advanced | `3` | 12-18 | Analyze ambiguous cases, synthesize multiple concepts, and justify prioritization. |

## Themes

- **Fundamentals:** vocabulary, definitions, core concepts, and basic cause and
  effect.
- **Application:** practical scenarios, workflow choices, and real-world use.
- **Analysis:** interpretation, diagnosis, prioritization, and critical
  reasoning.

Every difficulty tier should include coverage across these themes. A pack can be
theme-specific, such as `Beginner / Fundamentals`, or mixed-theme when the task
calls for progressive coverage.

## Question formats

### Multiple choice

Use for recognition, comparison, and scenario selection.

```json
{
  "id": "bf-1",
  "type": "multiple-choice",
  "prompt": "Which option best describes a quiz learning objective?",
  "choices": [
    "A measurable outcome for the learner",
    "The total number of packs in the app",
    "The color used for the primary button",
    "A random answer order"
  ],
  "correctIndex": 0,
  "difficulty": 1,
  "points": 1,
  "explanation": "A learning objective states what the learner should be able to do after the question or quiz."
}
```

Learning objective: learners identify the best answer from plausible
alternatives and can explain why the distractors are weaker.

### True / false

Use for crisp misconceptions, rule checks, and quick confidence checks.

```json
{
  "id": "bf-2",
  "type": "true-false",
  "prompt": "A quiz explanation should teach the concept, not only repeat the answer.",
  "trueFalseAnswer": true,
  "difficulty": 1,
  "points": 1,
  "explanation": "Explanations should reinforce the concept so the learner can transfer it to a new question."
}
```

Learning objective: learners confirm or reject a statement and understand the
rule behind it.

### Short answer

The player implements short answer as `fill-blank`. Keep accepted answers short,
specific, and case-insensitive after trimming.

```json
{
  "id": "bf-3",
  "type": "fill-blank",
  "prompt": "A concise statement of what a learner should be able to do is a learning _____.",
  "blankAnswer": "objective",
  "difficulty": 1,
  "points": 1,
  "explanation": "The accepted answer is objective. Short-answer prompts should avoid synonyms unless the app later supports multiple accepted answers."
}
```

Learning objective: learners recall a term or concept without answer choices.

## Scoring

- Default to `1` point for beginner recall and true/false questions.
- Use `2` points for intermediate scenario or multi-step questions.
- Use `3` points for advanced synthesis, prioritization, or diagnosis.
- Keep total quiz points meaningful but simple; the player normalizes missing
  points to `1`.

## Content quality checklist

- Each question has an `explanation` that teaches the concept.
- Choices are parallel in length and tone where possible.
- Distractors are plausible but not trick answers.
- Advanced questions ask for the best answer, priority, or diagnosis when more
  than one detail might be partly true.
- No question depends on hidden app state, dates, or facts likely to become
  stale unless the explanation names the relevant context.
- Question IDs use a stable pack prefix, such as `bf-1` for Beginner
  Fundamentals.
