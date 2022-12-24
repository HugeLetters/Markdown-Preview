$(() => {

    marked.setOptions({
        highlight:
            (code) =>
            (Prism.highlight(
                code,
                Prism.languages.javascript,
                "javascript")),
        breaks: true,
    })

    const markdown = "1"
    $("#testinput").val(markdown);

    $("#testinput").on("input", function () {

        const test = marked.parse($(this).val());
        $("#test").html(test);

    }
    )

}
)