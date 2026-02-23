# StackDraw TODO

## New StackDraw Tasks

### Code Quality (High Priority)
- [ ] Split App.tsx into smaller components
- [ ] Replace `any` types with proper TypeScript interfaces
- [ ] Add API response validation
- [ ] Fix silent failures with proper error handling
- [ ] Fix race conditions in save operations

### Animations
- [ ] Improve UI animations
- [ ] State transition animations
- [ ] Smooth animations for element interactions

### Icons
- [ ] Create custom StackDraw icon pack
- [ ] Integrate icon pack into application
- [ ] Icon usage documentation
- [ ] Icon centering in nodes

### Export
- [ ] GIF export format
- [ ] WebM export format
- [ ] UI for animated export settings

---

## Legacy Tasks (FossFlow)

> These tasks were found in the original FossFlow codebase

### High Priority

#### Fix X coordinate calculation in connectors
**File:** `packages/fossflow-lib/src/components/SceneLayers/Connectors/Connector.tsx:401-402`
```
TODO: The original x coordinates of each tile seems to be calculated wrongly.
They are mirrored along the x-axis. The hack below fixes this, but we should find the root cause.
```

### Medium Priority

#### Improve error message reporting to users
**File:** `packages/fossflow-lib/src/hooks/useInitialDataManager.ts:80`
```
TODO: let's get better at reporting error messages here (starting with how we present them to users)
```

### Low Priority

#### Reorganize config file
**File:** `packages/fossflow-lib/src/config.ts:16`
```
TODO: This file could do with better organisation and convention for easier reading.
```

#### Improve Zustand typings
**File:** `packages/fossflow-lib/src/stores/uiStateStore.tsx:239`
```
TODO: Typings below are pretty gnarly due to the way Zustand works.
```

---

## Legend

- High Priority - affects functionality
- Medium Priority - UX improvement
- Low Priority - refactoring/code quality
