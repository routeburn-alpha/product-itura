# Quiz content structure

Use this guide when adding published quiz packs under
`app/src/lib/data/packs`. Packs should be self-contained JSON files that the
existing pack loader can read without extra registration.

## Pack shape

Each pack represents one player-ready trivia quiz:

```json
{
  "id": "general-knowledge-grab-bag",
  "title": "General Knowledge Grab Bag",
  "category": "Mixed Trivia",
  "description": "A short player-facing summary of the quiz topic.",
  "questions": []
}
```

- `id` is lower-kebab-case and must match the file name.
- `title` should be clear in the pack picker and avoid internal labels.
- Do not include difficulty labels such as Beginner, Intermediate, or Advanced
  in `title`, `id`, or `category`.
- `category` is player-facing trivia taxonomy, such as `Science`, `Sports`,
  `History`, `Geography`, `Culture`, `Pop Culture`, or `Mixed Trivia`.
- `description` names the trivia subject matter, not the implementation details.
- `questions` should contain 8-12 beginner questions, 10-15 intermediate
  questions, or 12-18 advanced questions.

## Difficulty tiers

| Tier | Difficulty value | Question count | Trivia expectation |
| --- | --- | --- | --- |
| Beginner | `1` | 8-12 | Familiar general trivia with short prompts and direct clues. |
| Intermediate | `2` | 10-15 | Broader world knowledge, multi-topic recall, and slightly more specific facts. |
| Advanced | `3` | 12-18 | Deep cuts, firsts, records, cross-category clues, and more precise recall. |

Difficulty is stored on each question through `difficulty`. It is not part of
the visible quiz name.

## Trivia topics

Idea #4 trivia packs should cover a wide range of subjects:

- **Mixed trivia:** general knowledge and championship-style cross-category
  rounds.
- **Pop culture:** movies, music, TV, books, awards, and franchises.
- **Sports:** rules, trophies, athletes, tournaments, and records.
- **Geography:** countries, cities, rivers, landmarks, borders, and maps.
- **History:** civilizations, leaders, inventions, conflicts, and turning
  points.
- **Science:** space, biology, chemistry, weather, physics, and the human body.
- **Culture:** food, travel, languages, festivals, customs, and landmarks.

## Question formats

### Multiple choice

Use for recognition, comparison, and scenario selection.

```json
{
  "id": "bf-1",
  "type": "multiple-choice",
  "prompt": "Which planet is known as the Red Planet?",
  "choices": [
    "Venus",
    "Mars",
    "Jupiter",
    "Mercury"
  ],
  "correctIndex": 1,
  "difficulty": 1,
  "points": 1,
  "hint": "Its rusty color comes from iron oxide on the surface.",
  "explanation": "Mars is called the Red Planet because iron-rich dust gives it a reddish appearance."
}
```

Use plausible distractors from the same trivia domain.

### True / false

Use for crisp misconceptions, rule checks, and quick confidence checks.

```json
{
  "id": "bf-2",
  "type": "true-false",
  "prompt": "The Pacific Ocean is the largest ocean on Earth.",
  "trueFalseAnswer": true,
  "difficulty": 1,
  "points": 1,
  "hint": "It covers more area than all land on Earth combined.",
  "explanation": "The Pacific Ocean is Earth's largest and deepest ocean."
}
```

Use true/false for crisp trivia statements, not trick wording.

### Short answer

The player implements short answer as `fill-blank`. Keep accepted answers short,
specific, and case-insensitive after trimming.

```json
{
  "id": "bf-3",
  "type": "fill-blank",
  "prompt": "The tallest mountain above sea level is Mount _____.",
  "blankAnswer": "Everest",
  "difficulty": 1,
  "points": 1,
  "hint": "It sits in the Himalayas.",
  "explanation": "Mount Everest is the tallest mountain above sea level."
}
```

Short-answer prompts should have one obvious accepted answer because the player
does not currently support multiple accepted spellings or synonyms.

## Scoring

- Use `1` point for beginner trivia.
- Use `2` points for intermediate trivia.
- Use `3` points for advanced trivia.
- Keep total quiz points meaningful but simple; the player normalizes missing
  points to `1`.

## Content quality checklist

- Each question is trivia-style and asks for a fact, identification, record,
  first, place, person, work, rule, or cultural reference.
- Each question has a `hint` that nudges without giving away the answer.
- Each question has an `explanation` that gives the answer and a little context.
- Choices are parallel in length and tone where possible.
- Distractors are plausible but not trick answers.
- Advanced explanations include a short "For further study" pointer.
- No question depends on hidden app state, dates, or facts likely to become
  stale unless the explanation names the relevant context.
- Question IDs use a stable pack prefix, such as `gk-1` for General Knowledge
  Grab Bag.
