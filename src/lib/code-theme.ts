import type { ShikiConfig } from "astro";

const token = (name: string, scope: string[]) => ({
  scope,
  settings: { foreground: `var(--code-${name})` },
});

export const codeTheme: ShikiConfig["theme"] = {
  name: "screen",
  type: "dark",
  colors: {
    "editor.foreground": "var(--code-fg)",
    "editor.background": "var(--code-bg)",
  },
  tokenColors: [
    token("punct", [
      "punctuation",
      "keyword.operator",
      "meta.brace",
      "punctuation.definition.tag",
    ]),
    token("comment", ["comment", "punctuation.definition.comment"]),
    token("keyword", [
      "keyword",
      "storage",
      "keyword.operator.new",
      "keyword.operator.expression",
      "keyword.operator.word",
      "variable.language",
      "punctuation.definition.template-expression",
      "markup.heading",
    ]),
    token("string", [
      "string",
      "punctuation.definition.string",
      "markup.inline.raw",
      "markup.underline.link",
    ]),
    token("constant", [
      "constant",
      "support.constant",
      "constant.character.escape",
    ]),
    token("function", [
      "entity.name.function",
      "support.function",
      "meta.function-call.generic",
    ]),
    token("type", [
      "entity.name.type",
      "entity.name.class",
      "entity.other.inherited-class",
      "support.type",
      "support.class",
      "entity.name.tag",
    ]),
    token("property", [
      "entity.other.attribute-name",
      "variable.other.property",
      "variable.other.object.property",
      "meta.object-literal.key",
      "support.type.property-name",
      "support.variable.property",
      "entity.name.tag.yaml",
    ]),
  ],
};
