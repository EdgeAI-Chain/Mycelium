
# ⚠️ Onboarding Feature Paused

**Status**: implementation_plan
**Last Updated**: 2026-01-04
**Change ID**: 002-onboarding

## Summary
Work on the Onboarding Wizard (Phase 1 & 2 of ONBOARDING.md) was started but encountered a blocking issue where the Dashboad would render as a blank page when wrapped in the `OnboardingProvider`.

The changes have been **reverted** in `App.tsx` to restore the working Dashboard. The Onboarding components and Context files remain in the codebase but are currently unused.

## Progress
- [x] **Architecture Plan**: Created `002-onboarding` proposal.
- [x] **Context**: Created `src/context/OnboardingContext.tsx` (React Context + useReducer).
- [x] **Components**: 
    - Created `OnboardingLayout.tsx` (UI shell with stepper).
    - Created `HardwareSetup.tsx` (Phase 1 step with mock mDNS scan).
- [x] **Integration (Failed)**: Attempted to wrap `App` with `OnboardingProvider` and add `MainRouter`.
    - Result: Blank page, no console errors.
    - Action: Reverted `App.tsx` to original state.

## Current Blockers
- **Blank Page**: wrapping the app in the provider causes a silent render failure.
- **Port Check**: Confirmed port 8082 is NOT used by us (used by MS Teams), so that is not the cause.

## Next Steps to Resume
1.  **Debug Context**: creating a minimal reproduction of the provider to isolate the failure.
2.  **Verify Exports**: Check `dashboard/src/components/onboarding/index.ts` (if exists) or direct imports.
3.  **Refactor Router**: Consider using `react-router-dom` instead of a custom `MainRouter` component for better stability.
4.  **Hardware Hook**: Ensure `useMQTT` is robust against connection failures during onboarding.

## Files Created (Preserved)
- `dashboard/src/context/OnboardingContext.tsx`
- `dashboard/src/components/onboarding/OnboardingLayout.tsx`
- `dashboard/src/components/onboarding/HardwareSetup.tsx`
