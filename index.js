import * as components from "./modules/components.js";

$(() => {

    const config = {
        defaultCodeLanguage: "js"
    };

    const App = ReactDOM.createRoot(document.getElementById("reactApp"));
    App.render(<components.App />);

    marked.setOptions({
        highlight: (code, language) => Prism.languages[language]
            ? (Prism.highlight(
                code,
                Prism.languages[language],
                language))
            : (Prism.highlight(
                code,
                Prism.languages[config.defaultCodeLanguage],
                config.defaultCodeLanguage)),
        breaks: true,
    })

    const defaultInput = "# Welcome to my React Markdown Previewer!\n\n## This is a sub-heading...\n### And here's some other cool stuff:\n\nHeres some code, `<div></div>`, between 2 backticks.\n\n```\n// this is multi-line code:\n\nfunction anotherExample(firstLine, lastLine) {\n  if (firstLine == '```' && lastLine == '```') {\n    return multiLineCode;\n  }\n}\n```\n\nYou can also make text **bold**... whoa!\nOr _italic_.\nOr... wait for it... **_both!_**\nAnd feel free to go crazy ~~crossing stuff out~~.\n\nThere's also [links](https://www.freecodecamp.org), and\n> Block Quotes!\n\nAnd if you want to get really crazy, even tables:\n\nWild Header | Crazy Header | Another Header?\n------------ | ------------- | -------------\nYour content can | be here, and it | can be here....\nAnd here. | Okay. | I think we get it.\n\n- And of course there are lists.\n  - Some are bulleted.\n     - With different indentation levels.\n        - That look like this.\n\n\n1. And there are numbered lists too.\n1. Use just 1s if you want!\n1. And last but not least, let's not forget embedded images:\n\n![freeCodeCamp Logo](https://cdn.freecodecamp.org/testable-projects-fcc/images/fcc_secondary.svg)\n"

    setTimeout(() => {
        $("#editor").on("input", function () {
            const input = marked.parse($(this).val());
            const sanitazedInput = DOMPurify.sanitize(input);
            $("#previewer").html(sanitazedInput);
            $("#previewer pre").addClass(`language-${config.defaultCodeLanguage}`);
            $("#previewer code").addClass(`language-${config.defaultCodeLanguage}`);
        })
        $("#editor").val(defaultInput);
        $("#editor").trigger("input");
    }, 0);

}
)