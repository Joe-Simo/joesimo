import { describe, expect, test } from "bun:test";

import {
  getProjectCaseStudy,
  standaloneLiveProducts,
} from "../../src/lib/site-data";

describe("live product links", () => {
  test("standalone products link to their live sites", () => {
    const hrefs = new Map(
      standaloneLiveProducts.map((product) => [product.slug, product.link.href]),
    );

    expect(hrefs.get("rivetport")).toBe("https://rivetport.com");
    expect(hrefs.get("flaregit")).toBe("https://flaregit.com");
    expect(hrefs.get("a0")).toBe("https://a0lang.com");
    expect(hrefs.get("goblins-os")).toBe("https://goblinsos.com");

    for (const product of standaloneLiveProducts) {
      expect(product.link.kind).toBe("primary");
      expect(product.link.external).toBe(true);
      expect(product.summary.length).toBeGreaterThan(20);
    }
  });

  test("product descriptions match the current products", () => {
    const signature0 = getProjectCaseStudy("signature-copier");
    expect(signature0?.title).toBe("Signature0");
    expect(signature0?.summary).toContain("Email design and sending for agencies");

    const chesslm = getProjectCaseStudy("chesslm");
    const chesslmCopy = JSON.stringify(chesslm);
    expect(chesslmCopy).not.toMatch(/unity/i);
  });
});
