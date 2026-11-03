for (const display of document.querySelectorAll<HTMLElement>(
  "[data-readout]"
)) {
  const slots = display.querySelectorAll<HTMLElement>("[data-show]");

  display.addEventListener("pointerover", (event) => {
    const source =
      event.target instanceof HTMLElement
        ? event.target.closest<HTMLElement>("[data-tip]")
        : null;

    for (const slot of slots) {
      const key = slot.dataset.show ?? "";
      slot.textContent =
        (source ? source.dataset[key] : undefined) ?? slot.dataset.idle ?? "";
    }
  });

  display.addEventListener("pointerleave", (event) => {
    if (event.pointerType !== "mouse") {
      return;
    }

    for (const slot of slots) {
      slot.textContent = slot.dataset.idle ?? "";
    }
  });
}
