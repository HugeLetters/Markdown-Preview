const createEnum = (object) => {
    Object.keys(object).forEach((x) => {
        object[object[x]] = x;
    })
    return Object.freeze(object)
}

export const TEXT_COMPONENT = createEnum({
    EDITOR: "editor",
    PREVIEWER: "previewer"
});

export const APP_SIZE_STATE = createEnum({
    EDITOR: 1,
    PREVIEWER: 2,
    BOTH: 3
})

export const WRAPPER_SIZE_STATE = createEnum({
    CLOSED: 0,
    MINIMIZED: 1,
    MAXIMIZED: -1
})

export const COMPONENT_FOCUS = createEnum({
    EDITOR: 1,
    PREVIEWER: 2
})