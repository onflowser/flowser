import Prism from 'prismjs';

export interface UseSyntaxHighlighterHook {
    highlightCadenceSyntax: (source: string) => string;
}

export type FlowserSupportedLanguages = 'flow' | 'logs';

export const useSyntaxHighlighter = (): UseSyntaxHighlighterHook => {
    const highlightCadenceSyntax = (source: string) => {
        source = Prism.highlight(source, Prism.languages.javascript, 'javascript');

        const cadenceKeywords = ['pub', 'fun', 'self', 'emit', 'execute', 'prepare', 'destroy', 'priv'];

        const importantCadenceKeywords = ['transaction', 'resource', 'event', 'contract'];

        cadenceKeywords.forEach((keyword: string) => {
            // TODO: Improve, skip keywords in comments
            const regStr = `\\b(${keyword})\\b`;
            const regex = new RegExp(regStr, 'g');
            source = source.replace(regex, '<span class="token inserted">$1</span>');
        });

        importantCadenceKeywords.forEach((keyword: string) => {
            // TODO: Improve, skip keywords in comments
            const regStr = `\\b(${keyword})\\b`;
            const regex = new RegExp(regStr, 'g');
            source = source.replace(regex, '<span class="token cadence">$1</span>');
        });

        return source;
    };

    return {
        highlightCadenceSyntax,
    };
};
