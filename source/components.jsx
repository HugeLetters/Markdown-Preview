import { APP_SIZE_STATE, COMPONENT_FOCUS, TEXT_COMPONENT, WRAPPER_SIZE_STATE } from "./enums.js";

class Wrapper extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            position: { top: 0, left: 0 },
            dragged: false,
        };
        this.trackedData = {
            mouseOrigin: { top: 0, left: 0 },
            elementOrigin: { top: 0, left: 0 },
            windowOrigin: { top: 0, left: 0 }
        };
        this.wrapperRef = React.createRef();
        this.headerRef = React.createRef();
    }
    static defaultProps = { label: "Component", sizeState: WRAPPER_SIZE_STATE.MINIMIZED }

    getAbsoluteXY = () => {
        const { top, left, width, height } = this.wrapperRef.current.getBoundingClientRect();
        const absoluteTop = window.scrollY + top - this.state.position.top;
        const absoluteLeft = window.scrollX + left - this.state.position.left;
        return { top: absoluteTop, left: absoluteLeft, width, height }
    }
    handleDrag = (e) => {
        const { mouseOrigin, elementOrigin, windowOrigin } = this.trackedData;
        const { width, height } = document.body.getBoundingClientRect();
        this.setState(() => ({
            "position":
            {
                "top": Math.min(
                    height - windowOrigin.height - windowOrigin.top - 5,
                    Math.max(-windowOrigin.top + 5, elementOrigin.top + e.clientY - mouseOrigin.top)),
                "left": Math.min(
                    width - windowOrigin.width - windowOrigin.left - 5,
                    Math.max(-windowOrigin.left + 5, elementOrigin.left + e.clientX - mouseOrigin.left))
            }
        }));
    }
    handleDragStart = (e) => {
        window.addEventListener("mousemove", this.handleDrag)
        window.addEventListener("mouseup",
            () => {
                window.removeEventListener("mousemove", this.handleDrag)
                this.setState(() => ({ dragged: false }));
            },
            { once: true })
        this.setState(() => ({ dragged: true }));
        // Mouse initial absolute position
        this.trackedData.mouseOrigin = { top: e.clientY, left: e.clientX }
        // Element initial relative position
        this.trackedData.elementOrigin = { top: this.state.position.top, left: this.state.position.left }
        // Element default absolute position accounting for scroll as well & element size as well
        this.trackedData.windowOrigin = this.getAbsoluteXY();
    }

    render() {
        console.log(this);
        const label = this.props.label[0].toUpperCase() + this.props.label.slice(1);
        const minimized = this.props.sizeState === WRAPPER_SIZE_STATE.MINIMIZED;
        return (
            <div
                ref={this.wrapperRef}
                style={minimized ? this.state.position : {}}
                className="wrapper"
                onMouseDown={this.props.onFocus}
                {...this.props.focused ? { focused: "true" } : {}}
                sizeState={WRAPPER_SIZE_STATE[this.props.sizeState]}>
                <div
                    dragged={1 * this.state.dragged}
                    className="elementHeader unselectable"
                    onMouseDown={this.handleDragStart}>
                    <span className="elementLabel">{label}</span>
                    <button
                        onClick={() => { this.props.onSizeChange(-this.props.sizeState) }}
                        className={`fa-solid ${minimized ? "fa-maximize" : "fa-minimize"}`} />
                </div>
                {this.props.children}
            </div >)
    }
}

class TextComponent extends React.Component {
    constructor(props) {
        super(props);
        this.height = "calc(48vh - 2.5rem)";
        this.textElement = React.createRef();
        this.currentSize = this.props.sizeState;
        this.componentBody = this.props.type === TEXT_COMPONENT.PREVIEWER
            ? (style) => (<div
                id={TEXT_COMPONENT.PREVIEWER}
                ref={this.textElement}
                style={style}
                sizeState={WRAPPER_SIZE_STATE[this.props.sizeState]}
                dangerouslySetInnerHTML={{ __html: this.props.content }} />)
            : (style) => (<textarea
                id={TEXT_COMPONENT.EDITOR}
                ref={this.textElement}
                style={style}
                sizeState={WRAPPER_SIZE_STATE[this.props.sizeState]}
                onInput={(e) => { this.props.onInput(DOMPurify.sanitize(marked.parse(e.target.value))) }}>
                {this.props.defaultInput}</textarea>);
    };
    static defaultProps = { type: TEXT_COMPONENT.EDITOR, sizeState: WRAPPER_SIZE_STATE.MINIMIZED };

    render() {
        if (this.currentSize === WRAPPER_SIZE_STATE.MINIMIZED && this.props.sizeState !== WRAPPER_SIZE_STATE.MINIMIZED) {
            this.height = this.textElement.current.getBoundingClientRect().height;
        }
        this.currentSize = this.props.sizeState;
        console.log(this);
        return (<Wrapper
            label={this.props.type}
            sizeState={this.props.sizeState}
            onSizeChange={(size) => { this.props.onSizeChange(this.props.type, size) }}
            focused={this.props.focused}
            onFocus={() => { this.props.onFocus(this.props.type) }}>
            {this.componentBody(this.props.sizeState === WRAPPER_SIZE_STATE.MINIMIZED ? { height: this.height } : {})}
        </Wrapper >)
    }
}

class Background extends React.Component {
    constructor(props) {
        super(props)
        const { width, height } = document.body.getBoundingClientRect();
        this.state = { size: { width, height } };
        this.rowSize = 100;
        this.BGstyle = { fontSize: `${this.rowSize / 1.2}px` }
        new ResizeObserver(
            (entries) => {
                const { width, height } = entries[0].target.getBoundingClientRect();
                this.setState(() => ({ size: { width, height } }))
            })
            .observe(document.body);
    }
    backgroundCell = (word, focused, key) =>
        (<span key={key} {...(focused ? { focused: "true" } : {})} className="backgroundCell" >{word}</span>)
    themeBoth = (colCount, focus) => {
        const words = [TEXT_COMPONENT.EDITOR.toUpperCase(), TEXT_COMPONENT.PREVIEWER.toUpperCase()];
        const focusIndex = 1 * focus === COMPONENT_FOCUS.PREVIEWER;
        return (new Array(colCount)).fill(1).map((_, i) => {
            return this.backgroundCell(words[i % 2], i % 2 == focusIndex, i)
        })
    }
    themeOne = (colCount, type) => {
        const word = (APP_SIZE_STATE[type] || "ERROR").toUpperCase();
        return (new Array(colCount)).fill(1).map((_, i) => {
            // +type+1 cause otherwise sometimes on theme switch focused items remaind focused and it doesn't look nice
            return this.backgroundCell(word, (i + type + 1) % 2, i)
        })
    }

    render() {
        console.log(this);
        const rowCount = Math.ceil(this.state.size.height / this.rowSize);
        const colCount = 2 * Math.ceil(this.state.size.width / (6 * this.rowSize));
        const backgroundRowSlice = this.props.theme.size === APP_SIZE_STATE.BOTH
            ? this.themeBoth(colCount, this.props.theme.focus)
            : this.themeOne(colCount, this.props.theme.size);
        const backgroundRow = (new Array(4)).fill(1).map((_, i) => (
            <div
                className="backgroundRowSlice"
                key={i}>
                {backgroundRowSlice}</div>
        ))
        const backgroundGrid = (new Array(rowCount)).fill(1).map((_, i) => {
            return <div
                style={{ left: -this.state.size.width }}
                className="backgroundRow"
                {...i % 2 ? {} : { "backwards": "true" }}
                key={i}>
                {backgroundRow}</div >
        });
        return <div id="background" className="unselectable" style={{ ...this.BGstyle, ...this.state.size }}> {backgroundGrid}</div >
    }
}

export default class App extends React.Component {
    constructor(props) {
        super(props)
        this.defaultInput = this.props.config.inputText;
        this.defaultLang = this.props.config.codeLanguage;
        this.state = {
            size: APP_SIZE_STATE.BOTH,
            focus: COMPONENT_FOCUS.EDITOR,
            input: DOMPurify.sanitize(marked.parse(this.defaultInput)),
        }
    }

    handleSizeChange = (type, size) => {
        switch (true) {
            case type == TEXT_COMPONENT.EDITOR && size == WRAPPER_SIZE_STATE.MAXIMIZED:
                this.setState(() => ({ size: APP_SIZE_STATE.EDITOR }))
                break;
            case type == TEXT_COMPONENT.PREVIEWER && size == WRAPPER_SIZE_STATE.MAXIMIZED:
                this.setState(() => ({ size: APP_SIZE_STATE.PREVIEWER }))
                break;
            case size == WRAPPER_SIZE_STATE.MINIMIZED:
                this.setState(() => ({ size: APP_SIZE_STATE.BOTH }))
                break;
            default:
                this.setState(() => ({ size: APP_SIZE_STATE.BOTH }))
                break;
        }
    }
    handleFocus = (type) => { this.setState(() => ({ focus: COMPONENT_FOCUS[type.toUpperCase()] })) }

    render() {
        console.log(this);
        let editorSize, previewerSize;
        switch (this.state.size) {
            case APP_SIZE_STATE.BOTH:
                [editorSize, previewerSize] = [WRAPPER_SIZE_STATE.MINIMIZED, WRAPPER_SIZE_STATE.MINIMIZED]
                break;
            case APP_SIZE_STATE.EDITOR:
                [editorSize, previewerSize] = [WRAPPER_SIZE_STATE.MAXIMIZED, WRAPPER_SIZE_STATE.CLOSED]
                break;
            case APP_SIZE_STATE.PREVIEWER:
                [editorSize, previewerSize] = [WRAPPER_SIZE_STATE.CLOSED, WRAPPER_SIZE_STATE.MAXIMIZED]
                break;
            default:
                [editorSize, previewerSize] = [WRAPPER_SIZE_STATE.MINIMIZED, WRAPPER_SIZE_STATE.MINIMIZED]
                break;
        }
        return (<React.Fragment>
            <Background theme={{ focus: this.state.focus, size: this.state.size }} />
            <TextComponent
                type={TEXT_COMPONENT.EDITOR}
                sizeState={editorSize}
                onSizeChange={this.handleSizeChange}
                onFocus={this.handleFocus}
                focused={this.state.focus === COMPONENT_FOCUS.EDITOR}
                onInput={(input) => { this.setState(() => ({ input })) }}
                defaultInput={this.defaultInput}
            />
            <TextComponent
                type={TEXT_COMPONENT.PREVIEWER}
                sizeState={previewerSize}
                onSizeChange={this.handleSizeChange}
                onFocus={this.handleFocus}
                focused={this.state.focus === COMPONENT_FOCUS.PREVIEWER}
                content={this.state.input}
                defaultLang={this.defaultLang}
            />
        </React.Fragment>)
    }
}