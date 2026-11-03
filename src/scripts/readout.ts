const tipAt = (target: EventTarget | null) =>
  target instanceof Element
    ? (target.closest<HTMLElement>("[data-tip]") ?? undefined)
    : undefined;

for (const display of document.querySelectorAll<HTMLElement>(
  "[data-readout]"
)) {
  const slots = display.querySelectorAll<HTMLElement>("[data-show]");
  let picked: HTMLElement | undefined;

  const show = (source?: HTMLElement) => {
    if (source === picked) {
      return;
    }

    if (picked) {
      delete picked.dataset.picked;
    }

    if (source) {
      source.dataset.picked = "";
    }

    picked = source;

    for (const slot of slots) {
      const key = slot.dataset.show ?? "";
      slot.textContent =
        (source ? source.dataset[key] : undefined) ?? slot.dataset.idle ?? "";
    }
  };

  display.addEventListener("keydown", (event) => {
    const tips = [...display.querySelectorAll<HTMLElement>("[data-tip]")];
    const step = { ArrowRight: 1, ArrowLeft: -1 }[event.key];

    if (event.key === "Escape") {
      show();
    } else if (step !== undefined) {
      event.preventDefault();
      const at = picked ? tips.indexOf(picked) + step : tips.length - 1;
      show(tips[Math.min(Math.max(at, 0), tips.length - 1)]);
    }
  });

  display.addEventListener("pointerover", (event) => {
    const tip = tipAt(event.target);

    if (
      tip ||
      event.pointerType === "mouse" ||
      !(event.target instanceof Element && event.target.closest("button"))
    ) {
      show(tip);
    }
  });

  display.addEventListener("pointermove", (event) => {
    if (event.pointerType === "mouse") {
      return;
    }

    const under = tipAt(
      document.elementFromPoint(event.clientX, event.clientY)
    );

    if (under && display.contains(under)) {
      show(under);
    }
  });

  display.addEventListener("pointerleave", (event) => {
    if (event.pointerType === "mouse") {
      show();
    }
  });
}
