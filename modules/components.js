import { APP_SIZE_STATE, COMPONENT_FOCUS, TEXT_COMPONENT, WRAPPER_SIZE_STATE } from "./enums.js";

class Wrapper extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            position: { top: 0, left: 0 },
        };
        this.trackedData = {
            mouseOrigin: { top: 0, left: 0 },
            elementOrigin: { top: 0, left: 0 },
            windowOrigin: { top: 0, left: 0 }
        };
        this.sizeStyles = {
            minimized: { minHeight: "48vh", display: "block" },
            maximized: { minHeight: "98vh", display: "block", top: 0, left: 0 },
            closed: { display: "none" }
        }
    }
    static defaultProps = { label: "Component", sizeState: WRAPPER_SIZE_STATE.MINIMIZED }

    getAbsoluteXY = () => {
        const { top, left, width, height } = this.refs.wrapper.getBoundingClientRect();
        const absoluteTop = window.scrollY + top - this.state.position.top;
        const absoluteLeft = window.scrollX + left - this.state.position.left;
        return { top: absoluteTop, left: absoluteLeft, width, height }
    }
    toggleSize = () => {
        switch (this.props.sizeState) {
            case WRAPPER_SIZE_STATE.MINIMIZED:
                this.props.onSizeChange(WRAPPER_SIZE_STATE.MAXIMIZED);
                break;
            case WRAPPER_SIZE_STATE.MAXIMIZED:
                this.props.onSizeChange(WRAPPER_SIZE_STATE.MINIMIZED);
                break;
            default:
                this.props.onSizeChange(WRAPPER_SIZE_STATE.CLOSED);
                break;
        }
    }
    getStyle = (sizeState) => {
        switch (sizeState) {
            case WRAPPER_SIZE_STATE.MINIMIZED:
                return { ...this.sizeStyles.minimized, ...this.state.position };
            case WRAPPER_SIZE_STATE.MAXIMIZED:
                return this.sizeStyles.maximized;
            case WRAPPER_SIZE_STATE.CLOSED:
                return this.sizeStyles.closed;
            default:
                return this.sizeStyles.closed;
        }
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
            () => { window.removeEventListener("mousemove", this.handleDrag) },
            { once: true })
        this.trackedData.mouseOrigin = { top: e.clientY, left: e.clientX }
        this.trackedData.elementOrigin = { top: this.state.position.top, left: this.state.position.left }
        this.trackedData.windowOrigin = this.getAbsoluteXY();
    }

    render() {
        console.log(this);
        const label = this.props.label[0].toUpperCase() + this.props.label.slice(1);
        const style = { ...this.getStyle(this.props.sizeState), zIndex: this.props.zIndex };
        return (
            <div ref="wrapper" style={style} class="wrapper" onMouseDown={this.props.onFocus}>
                <div class="elementHeader unselectable" onMouseDown={this.handleDragStart}>
                    <span class="elementLabel">{label}</span>
                    <button onClick={this.toggleSize} class="fa-solid fa-maximize" />
                </div>
                {this.props.children}
            </div >)
    }
}

class TextComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
        };
        this.styles = {
            minimized: {
                display: "block",
                minHeight: "calc(48vh - 2.5rem)",
            },
            maximized: { resize: "horizontal", height: "calc(98vh - 2.5rem)", display: "block" },
            closed: { display: "none" }
        }
        this.trackedData = {
            height: "calc(48vh - 2.5rem)",
        }
    };
    static defaultProps = { type: TEXT_COMPONENT.EDITOR, sizeState: WRAPPER_SIZE_STATE.MINIMIZED };

    handleSizeChange = (size) => {
        this.props.onSizeChange(this.props.type, size)
    }
    handleFocus = () => { this.props.onFocus(this.props.type) }
    getStyle = (state) => {
        switch (state) {
            case WRAPPER_SIZE_STATE.MINIMIZED:
                return { ...this.styles.minimized, height: this.trackedData.height };
            case WRAPPER_SIZE_STATE.MAXIMIZED:
                this.trackedData.height = this.refs.textElement.getBoundingClientRect().height;
                return this.styles.maximized;
            case WRAPPER_SIZE_STATE.CLOSED:
                this.trackedData.height = this.refs.textElement.getBoundingClientRect().height;
                return this.styles.closed;
            default:
                return this.styles.closed;
        }
    }

    render() {
        console.log(this);
        let componentBody;
        switch (this.props.type) {
            case TEXT_COMPONENT.EDITOR:
                componentBody = <textarea id={TEXT_COMPONENT.EDITOR} ref="textElement"></textarea>;
                break;
            case TEXT_COMPONENT.PREVIEWER:
                componentBody = <div id={TEXT_COMPONENT.PREVIEWER} ref="textElement"></div>;
                break;
            default:
                componentBody = <textarea id={TEXT_COMPONENT.EDITOR} ref="textElement"></textarea>;
                break;
        }
        Object.assign(componentBody.props, { style: this.getStyle(this.props.sizeState) });
        return (<Wrapper
            label={this.props.type}
            sizeState={this.props.sizeState}
            onSizeChange={this.handleSizeChange}
            zIndex={this.props.zIndex}
            onFocus={this.handleFocus}>
            {componentBody}
        </Wrapper >)
    }
}

class Background extends React.Component {
    constructor(props) {
        super(props)
        const { width, height } = document.body.getBoundingClientRect();
        this.state = { size: { width, height } };
        this.rowSize = 100;
        this.colCount = 4;
        this.style = {
            position: "absolute",
            background: "#600060",
            fontFamily: "Impact",
            fontSize: `${this.rowSize / 1.2}px`,
            color: "white",
            WebkitTextStroke: "2px black",
            display: "flex",
            flexFlow: "column",
            justifyContent: "space-evenly"
        }
        this.colStyle = {
            overflow: "hidden",
            whiteSpace: "nowrap",
            margin: "0 10px",
            transition: "color 0.4s linear"
        }
        this.rowStyle = {
            overflow: "hidden",
            display: "flex",
            flexFlow: "row",
        }
        this.rowHalfStyle = {
            position: "relative",
            display: "flex",
            flexFlow: "row",
            left: -width,
            animation: "backgroundScroll 10s linear 0s infinite"
        }
        new ResizeObserver(
            (entries) => {
                const { width, height } = entries[0].target.getBoundingClientRect();
                this.setState(() => ({ size: { width, height } }))
            })
            .observe(document.body);
    }
    themeBoth = (focus) => {
        const words = [TEXT_COMPONENT.EDITOR, TEXT_COMPONENT.PREVIEWER];
        const focusIndex = focus === COMPONENT_FOCUS.EDITOR ? 0 : 1;
        return (new Array(this.colCount)).fill(1).map((_, i) => {
            const word = words[i % 2].toUpperCase();
            const focusStyle = i % 2 == focusIndex ? { color: "black", WebkitTextStroke: "2px white" } : {};
            return <span style={{ ...this.colStyle, ...focusStyle }}>{word}</span>
        })
    }
    themeEditor = () => {
        return (new Array(this.colCount)).fill(1).map((_, i) => {
            const focusStyle = i % 2 ? { color: "black", WebkitTextStroke: "2px white" } : {};
            return <span style={{ ...this.colStyle, ...focusStyle }}>{TEXT_COMPONENT.EDITOR.toUpperCase()}</span>
        })
    }
    themePreviewer = () => {
        return (new Array(this.colCount)).fill(1).map((_, i) => {
            const focusStyle = i % 2 ? { color: "black", WebkitTextStroke: "2px white" } : {};
            return <span style={{ ...this.colStyle, ...focusStyle }}>{TEXT_COMPONENT.PREVIEWER.toUpperCase()}</span>
        })
    }

    render() {
        console.log(this);
        const rowCount = Math.floor(this.state.size.height / this.rowSize);

        let backgroundRowHalf;
        switch (this.props.theme.size) {
            case APP_SIZE_STATE.BOTH:
                backgroundRowHalf = this.themeBoth(this.props.theme.focus);
                break;
            case APP_SIZE_STATE.EDITOR:
                backgroundRowHalf = this.themeEditor();
                break;
            case APP_SIZE_STATE.PREVIEWER:
                backgroundRowHalf = this.themePreviewer();
                break;
            default:
                backgroundRowHalf = this.themeBoth(this.props.theme.focus);
                break;
        }
        const backgroundArray = (new Array(rowCount)).fill(1).map((_, i) => {
            const direction = i % 2 ? "normal" : "reverse";
            return <div style={this.rowStyle}>
                <div style={{ ...this.rowHalfStyle, animationDirection: direction }}>{backgroundRowHalf}</div>
                <div style={{ ...this.rowHalfStyle, animationDirection: direction }}>{backgroundRowHalf}</div>
                <div style={{ ...this.rowHalfStyle, animationDirection: direction }}>{backgroundRowHalf}</div>
            </div >
        });
        return <div id="background" style={{ ...this.style, ...this.state.size }}>{backgroundArray}</div >
    }
}

export class App extends React.PureComponent {
    constructor(props) {
        super(props)
        this.state = {
            size: APP_SIZE_STATE.BOTH,
            focus: COMPONENT_FOCUS.EDITOR
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
    handleFocus = (type) => {
        this.setState(() => ({ focus: COMPONENT_FOCUS[type.toUpperCase()] }));
    }

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
                zIndex={1 * (this.state.focus === COMPONENT_FOCUS.EDITOR)}
            />
            <TextComponent
                type={TEXT_COMPONENT.PREVIEWER}
                sizeState={previewerSize}
                onSizeChange={this.handleSizeChange}
                onFocus={this.handleFocus}
                zIndex={1 * (this.state.focus === COMPONENT_FOCUS.PREVIEWER)}
            />
        </React.Fragment>)
    }
}