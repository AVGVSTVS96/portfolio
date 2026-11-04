const tipAt = (target: EventTarget | null) =>
  target instanceof Element
    ? (target.closest<HTMLElement>("[data-tip]") ?? undefined)
    : undefined;

const write = (slot: HTMLElement, text: string) => {
  if (slot.dataset.group === undefined) {
    slot.textContent = text;

    return;
  }

  slot.replaceChildren(
    ...text.split(",").flatMap((part, i) => {
      if (i === 0) {
        return [part];
      }

      const comma = document.createElement("span");
      comma.className = "comma";
      comma.textContent = ",";

      return [comma, part];
    })
  );
};

for (const display of document.querySelectorAll<HTMLElement>(
  "[data-readout]"
)) {
  const slots = display.querySelectorAll<HTMLElement>("[data-show]");
  const scroll = display.querySelector<HTMLElement>(".calendar-scroll");
  let picked: HTMLElement | undefined;
  let touch: { x: number; y: number } | undefined;

  const render = () => {
    for (const slot of slots) {
      const key = slot.dataset.show ?? "";
      write(
        slot,
        (picked ? picked.dataset[key] : undefined) ?? slot.dataset.idle ?? ""
      );
    }
  };

  display.addEventListener("refresh", render);

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
    render();
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
    if (
      (event.pointerType !== "mouse" || touch !== undefined) &&
      event.target instanceof Node &&
      scroll?.contains(event.target) === true
    ) {
      return;
    }

    const tip = tipAt(event.target);

    if (
      tip ||
      event.pointerType === "mouse" ||
      !(
        event.target instanceof Element &&
        event.target.closest("button, summary")
      )
    ) {
      show(tip);
    }
  });

  display.addEventListener("pointermove", (event) => {
    if (
      event.pointerType === "mouse" &&
      touch !== undefined &&
      (event.clientX !== touch.x || event.clientY !== touch.y)
    ) {
      touch = undefined;
      show(tipAt(event.target));
    }

    if (
      event.pointerType === "mouse" ||
      (event.target instanceof Node && scroll?.contains(event.target) === true)
    ) {
      return;
    }

    const under = tipAt(
      document.elementFromPoint(event.clientX, event.clientY)
    );

    if (under && display.contains(under)) {
      show(under);
    }
  });

  scroll?.addEventListener("pointerdown", (event) => {
    touch =
      event.pointerType === "mouse"
        ? undefined
        : { x: event.clientX, y: event.clientY };

    if (touch !== undefined) {
      show();
    }
  });
  scroll?.addEventListener("click", (event) => {
    const tip = tipAt(event.target);
    show(tip);
    tip?.scrollIntoView({ block: "nearest", inline: "nearest" });
  });

  document.addEventListener("pointerdown", (event) => {
    if (event.target instanceof Node && !display.contains(event.target)) {
      show();
    }
  });

  display.addEventListener("pointerleave", (event) => {
    if (event.pointerType === "mouse" && touch === undefined) {
      show();
    }
  });
}
