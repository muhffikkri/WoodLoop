import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Button } from "@/components/ui/button";

describe("Button", () => {
  it("runs its action from an accessible control", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(<Button onClick={onClick}>Add wood offcut</Button>);
    await user.click(screen.getByRole("button", { name: "Add wood offcut" }));

    expect(onClick).toHaveBeenCalledOnce();
  });

  it("locks interaction and exposes progress while loading", () => {
    render(
      <Button loading loadingLabel="Saving draft">
        Save draft
      </Button>,
    );

    const button = screen.getByRole("button", { name: "Saving draft" });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
  });
});
