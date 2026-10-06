import { expect, type Locator, type Page, test } from '@playwright/test';

async function openSite(page: Page): Promise<void> {
  const baseURL = process.env.BASE_URL;
  expect(baseURL, 'Set BASE_URL to the live site URL before running tests').toBeTruthy();
  await page.goto(baseURL as string);
}

async function visibleLinkDestinations(section: Locator): Promise<string[]> {
  const links = section.getByRole('link');
  const destinations: string[] = [];

  for (let index = 0; index < (await links.count()); index += 1) {
    const link = links.nth(index);
    if (await link.isVisible()) {
      const href = await link.getAttribute('href');
      if (href !== null) {
        destinations.push(href);
      }
    }
  }

  return destinations;
}

function linksToHost(href: string, pageUrl: string, domain: string): boolean {
  try {
    const hostname = new URL(href, pageUrl).hostname.toLowerCase();
    return hostname === domain || hostname.endsWith(`.${domain}`);
  } catch {
    return false;
  }
}

async function clickNavigationButtonThatTogglesDark(
  page: Page,
): Promise<{ before: boolean; after: boolean }> {
  const navigationButtons = page
    .getByRole('navigation')
    .getByRole('button');
  const buttonCount = await navigationButtons.count();

  expect(
    buttonCount,
    'Expected at least one button inside a navigation landmark',
  ).toBeGreaterThan(0);

  for (let index = 0; index < buttonCount; index += 1) {
    await openSite(page);

    const button = page
      .getByRole('navigation')
      .getByRole('button')
      .nth(index);
    if (!(await button.isVisible())) {
      continue;
    }

    const body = page.locator('body');
    const before = await body.evaluate((element) =>
      element.classList.contains('dark'),
    );

    await button.click();

    const after = await body.evaluate((element) =>
      element.classList.contains('dark'),
    );
    if (after !== before) {
      return { before, after };
    }
  }

  throw new Error(
    "No visible navigation button toggled the 'dark' class on <body>",
  );
}

test('all required sections exist [SPEC.md:4]', async ({ page }) => {
  await openSite(page);

  for (const id of ['hero', 'about', 'skills', 'projects', 'repos', 'contact']) {
    await expect(page.locator(`#${id}`), `Expected #${id} to exist`).toBeAttached();
  }
});

test.describe('375px viewport [SPEC.md:5]', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('there is no horizontal scrolling', async ({ page }) => {
    await openSite(page);

    const dimensions = await page.evaluate(() => {
      const scrollingElement = document.scrollingElement ?? document.documentElement;
      return {
        clientWidth: scrollingElement.clientWidth,
        scrollWidth: scrollingElement.scrollWidth,
      };
    });

    expect(
      dimensions.scrollWidth,
      `Document width ${dimensions.scrollWidth}px exceeds its ${dimensions.clientWidth}px viewport`,
    ).toBeLessThanOrEqual(dimensions.clientWidth);
  });
});

test.fixme(
  '#repos shows repository cards or a plain fallback message [SPEC.md:6-7]',
  async () => {
    // SPEC.md does not define observable card markup, fallback-message text, or
    // a way to select the success, empty, and request-failure states. Guessing
    // any of those would add behavior that is absent from the specification.
  },
);

test('#hero and #contact contain email, GitHub, and LinkedIn links [SPEC.md:8]', async ({
  page,
}) => {
  await openSite(page);

  for (const id of ['hero', 'contact']) {
    const destinations = await visibleLinkDestinations(page.locator(`#${id}`));

    expect(
      destinations.some((href) => /^mailto:/i.test(href)),
      `Expected #${id} to contain a visible email link`,
    ).toBe(true);
    expect(
      destinations.some((href) => linksToHost(href, page.url(), 'github.com')),
      `Expected #${id} to contain a visible GitHub link`,
    ).toBe(true);
    expect(
      destinations.some((href) => linksToHost(href, page.url(), 'linkedin.com')),
      `Expected #${id} to contain a visible LinkedIn link`,
    ).toBe(true);
  }
});

test("a navigation button toggles body's 'dark' class [SPEC.md:11]", async ({
  page,
}) => {
  const { before, after } = await clickNavigationButtonThatTogglesDark(page);
  expect(after).toBe(!before);
});

test('the dark-mode choice is retained for the browser session [SPEC.md:12]', async ({
  page,
}) => {
  const { after: selectedDarkState } =
    await clickNavigationButtonThatTogglesDark(page);

  await page.reload();

  await expect
    .poll(() =>
      page
        .locator('body')
        .evaluate((element) => element.classList.contains('dark')),
    )
    .toBe(selectedDarkState);
});
