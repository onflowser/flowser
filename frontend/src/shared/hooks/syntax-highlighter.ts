import Prism from "prismjs";

export interface UseSyntaxHighlighterHook {
  highlightCadenceSyntax: (source: string) => string;
  highlightLogKeywords: (logLine: string) => string;
  highlightJsonSyntax: (json: string | any) => string;
}

export type FlowserSupportedLanguages = "flow" | "logs";

export const useSyntaxHighlighter = (): UseSyntaxHighlighterHook => {
  const highlightJsonSyntax = (source: any) => {
    source = JSON.stringify(source, null, 2);
    source = Prism.highlight(source, Prism.languages.javascript, "json");
    source = source.replace(
      /(<span class="token string">"([^"]+)"<\/span>)<span class="token operator">:<\/span>/g,
      '<span class="token property">$2</span>:'
    );

    return source;
  };

  const highlightCadenceSyntax = (source: string) => {
    source = Prism.highlight(source, Prism.languages.javascript, "javascript");

    const cadenceKeywords = [
      "pub",
      "fun",
      "self",
      "emit",
      "execute",
      "prepare",
      "destroy",
      "priv",
    ];

    const importantCadenceKeywords = [
      "transaction",
      "resource",
      "event",
      "contract",
    ];

    cadenceKeywords.forEach((keyword: string) => {
      // TODO: Improve, skip keywords in comments
      const regStr = `\\b(${keyword})\\b`;
      const regex = new RegExp(regStr, "g");
      source = source.replace(regex, '<span class="token inserted">$1</span>');
    });

    importantCadenceKeywords.forEach((keyword: string) => {
      // TODO: Improve, skip keywords in comments
      const regStr = `\\b(${keyword})\\b`;
      const regex = new RegExp(regStr, "g");
      source = source.replace(regex, '<span class="token cadence">$1</span>');
    });

    return source;
  };

  const highlightLogKeywords = (logLine: string) => {
    const syntax = {
      blue: ["INFO", "txID", "blockID", "blockHeight", "address"],
      red: ["ERR"],
      yellow: ["WARN", "DEBU"],
      green: ["EVT"],
      lightGrey: [],
      darkGrey: [],
    };

    Object.keys(syntax).forEach((color: string) => {
      (syntax as any)[color].forEach((keyword: string) => {
        if (logLine && logLine.replace) {
          const regStr = `\\b(${keyword})\\b`;
          const regex = new RegExp(regStr, "g");
          logLine = logLine.replace(
            regex,
            '<span class="' + color + '">$1</span>'
          );
        }
      });
    });
    return logLine;
  };

  return {
    highlightJsonSyntax,
    highlightCadenceSyntax,
    highlightLogKeywords,
  };
};
