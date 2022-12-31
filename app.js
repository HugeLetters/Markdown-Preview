import App from "./source/components.js";

(async () => {

    const config = await fetch("./source/config.json").then(x => x.json())
    marked.setOptions({ breaks: true })
    const renderer = {
        codespan(code) {
            return `<code class=language-${config.codeLanguage}>${prismHighlight(code, config.codeLanguage)}</code>`
        },
        code(code, lang) {
            if (!lang) { lang = config.codeLanguage };
            return `<pre class=language-${lang}><code class=language-${lang}>${prismHighlight(code, lang)}</code></pre>`
        }
    }
    marked.use({ renderer })

    const root = ReactDOM.createRoot(document.body);
    root.render(<App config={config} />);
})()

const prismHighlight = (code, lang) => (Prism.languages[lang]
    ? (Prism.highlight(
        code,
        Prism.languages[lang],
        lang))
    : (Prism.highlight(
        code,
        Prism.languages[config.codeLanguage],
        config.codeLanguage)))