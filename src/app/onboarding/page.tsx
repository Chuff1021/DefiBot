import { AppTopbar, BottomActionBar, StepTimeline, StatusChip } from "@/components/trade/TradeUI";
import { onboardingSteps } from "@/lib/trade-mock-data";

export default function OnboardingPage() {
  return (
    <>
      <AppTopbar
        title="Onboarding"
        subtitle="Visual flow only — no credentials are stored."
        rightLabel="step 2/4"
      />

      <section className="premium-panel mb-4 rounded-2xl p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold text-white">Setup progress</h2>
          <StatusChip label="mock" tone="warning" />
        </div>
        <StepTimeline items={onboardingSteps} />
      </section>

      <section className="premium-panel rounded-2xl p-4">
        <h3 className="text-sm font-semibold text-white">Current step details</h3>
        <p className="mt-2 text-sm text-[#b7c7ea]">
          Review ChatGPT OAuth scopes and confirm the visual permission screen. This prototype does not trigger an actual OAuth redirect.
        </p>
      </section>

      <BottomActionBar
        secondaryLabel="Back home"
        secondaryHref="/"
        primaryLabel="Continue to connect"
        primaryHref="/connect"
      />
    </>
  );
}

