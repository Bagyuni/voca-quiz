# voca-quiz

JLPT vocabulary study & quiz app — Bun + React + TypeScript.

## Documentation guidelines

- Use wikilinks with **file name only** (e.g. `[[App.tsx]]`), never relative paths. Prevents stale links when hierarchy changes.
- Document **intention**, not implementation. Source is the source of truth.

## Commands

- `bun run dev` — start dev server
- `bun run build` — bundle to `dist/`
- `bun test` — run tests
- `bun run lint` — lint with auto-fix
- `bun run format` — format with auto-fix

## Architecture

[[index.tsx]] mounts React into [[index.html]]. [[dev.ts]] serves and bundles on-the-fly.

### State

[[useStore.tsx]] — shared state via React Context: words, day/mode selection, hard-word set, sync.

### Data

[[types.ts]] — `Word` interface.
[[words.ts]] — Google Sheets JSONP fetcher, localStorage cache.

### Components

[[App.tsx]] — root layout, routes to study or quiz.
[[Header.tsx]] — navigation: sync, mode switch, day tabs.
[[StudyMode.tsx]] — card grid with hard-word filter. Uses [[StudyCard.tsx]].
[[QuizMode.tsx]] — quiz flow with keyboard shortcuts. Uses [[QuizCard.tsx]] and [[ResultScreen.tsx]].

### Utilities

[[utils.ts]] — `cn()` classNames builder, `shuffle()`.

### Tests

Test files colocate with source (`foo.test.ts` next to `foo.ts`). Add tests for pure logic and parsers, not for UI components.

### Styles

[[App.css]] — all styles. CSS custom properties for theming.

## Linting & formatting

[[biome.json]] — Biome v2. `noExplicitAny: "error"`.
[[.stylelintrc.json]] — Stylelint with `stylelint-config-standard`.
[[lefthook.yml]] — pre-commit: lint, stylelint, test (parallel).

## Key decisions

- Quiz state is local to [[QuizMode.tsx]], not shared.
- Day change remounts quiz via React `key` prop.
- Wrong answers auto-mark the word as hard.
