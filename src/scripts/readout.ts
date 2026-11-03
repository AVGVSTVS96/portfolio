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

  display.addEventListener("pointerover", (event) => {
    show(tipAt(event.target));
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
