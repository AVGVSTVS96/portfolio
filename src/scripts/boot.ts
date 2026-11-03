import { inView } from "motion";

const boot = async (display: HTMLElement) => {
  const entrance = display.closest("section")?.getAnimations() ?? [];

  await Promise.allSettled(
    entrance.map(async (animation) => await animation.finished)
  );

  inView(
    display,
    () => {
      display.dataset.on = "";
    },
    { amount: 0.25 }
  );
};

for (const display of document.querySelectorAll<HTMLElement>("[data-boot]")) {
  void boot(display);
}
