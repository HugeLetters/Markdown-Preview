import { APP_SIZE_STATE, TEXT_COMPONENT, WRAPPER_SIZE_STATE } from "./enums.js";

class Wrapper extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            position: { top: 0, left: 0 }
        };
        this.trackedData = {
            mouseOrigin: { top: 0, left: 0 },
            elementOrigin: { top: 0, left: 0 },
            windowOrigin: { top: undefined, left: undefined }
        };
        this.sizeStyles = {
            minimized: { minHeight: "48vh", display: "block" },
            maximized: { minHeight: "98vh", display: "block", top: 0, left: 0 },
            closed: { display: "none" }
        }
    }
    static defaultProps = { label: "Component", sizeState: WRAPPER_SIZE_STATE.MINIMIZED }

    componentDidMount() {
        console.log("Mounted");
        const { top, left, width, height } = this.refs.wrapper.getBoundingClientRect();
        this.trackedData.windowOrigin = { top, left, width, height };
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
        this.setState(() => ({
            "position":
            {
                "top": Math.min(
                    window.innerHeight * 0.99 - windowOrigin.height - windowOrigin.top,
                    Math.max(-windowOrigin.top + window.innerHeight * 0.01, elementOrigin.top + e.clientY - mouseOrigin.top)),
                "left": Math.min(
                    window.innerWidth * 0.995 - windowOrigin.width - windowOrigin.left,
                    Math.max(-windowOrigin.left + window.innerWidth * 0.005, elementOrigin.left + e.clientX - mouseOrigin.left))
            }
        }));
    }

    handleStartDrag = (e) => {
        e.currentTarget.addEventListener("mousemove", this.handleDrag)
        this.trackedData.mouseOrigin = { top: e.clientY, left: e.clientX }
        this.trackedData.elementOrigin = { top: this.state.position.top, left: this.state.position.left }
    }
    handleStopDrag = (e) => {
        e.currentTarget.removeEventListener("mousemove", this.handleDrag)
    }

    render() {
        console.log(this);
        const label = this.props.label[0].toUpperCase() + this.props.label.slice(1);
        const style = { ...this.getStyle(this.props.sizeState) };
        return (
            <div ref="wrapper" style={style} class="wrapper">
                <div class="elementHeader unselectable" onMouseDown={this.handleStartDrag} onMouseUp={this.handleStopDrag} onMouseLeave={this.handleStopDrag}>
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
            minimized: { height: "calc(48vh - 2.5rem)", display: "block", },
            maximized: { height: "calc(98vh - 2.5rem)", display: "block" },
            closed: { display: "none" }
        }
    };
    static defaultProps = { type: TEXT_COMPONENT.EDITOR, sizeState: WRAPPER_SIZE_STATE.MINIMIZED };

    handleSizeChange = (size) => {
        this.props.onSizeChange(this.props.type, size)
    }
    getStyle = (state) => {
        switch (state) {
            case WRAPPER_SIZE_STATE.MINIMIZED:
                return this.styles.minimized;
            case WRAPPER_SIZE_STATE.MAXIMIZED:
                return this.styles.maximized;
            case WRAPPER_SIZE_STATE.CLOSED:
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
                componentBody = <textarea id={TEXT_COMPONENT.EDITOR}></textarea>;
                break;
            case TEXT_COMPONENT.PREVIEWER:
                componentBody = <div id={TEXT_COMPONENT.PREVIEWER}></div>;
                break;
            default:
                componentBody = <textarea id={TEXT_COMPONENT.EDITOR}></textarea>;
                break;
        }
        Object.assign(componentBody.props, { style: this.getStyle(this.props.sizeState) });
        return <Wrapper label={this.props.type} sizeState={this.props.sizeState} onSizeChange={this.handleSizeChange} > {componentBody}</Wrapper >
    }
}

export class App extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            size: APP_SIZE_STATE.BOTH_OPEN,
        }
    }

    handleSizeChange = (type, size) => {
        switch (true) {
            case type == TEXT_COMPONENT.EDITOR && size == WRAPPER_SIZE_STATE.MAXIMIZED:
                this.setState(() => ({ size: APP_SIZE_STATE.EDITOR_OPEN }))
                break;
            case type == TEXT_COMPONENT.PREVIEWER && size == WRAPPER_SIZE_STATE.MAXIMIZED:
                this.setState(() => ({ size: APP_SIZE_STATE.PREVIEWER_OPEN }))
                break;
            case size == WRAPPER_SIZE_STATE.MINIMIZED:
                this.setState(() => ({ size: APP_SIZE_STATE.BOTH_OPEN }))
                break;
            default:
                this.setState(() => ({ size: APP_SIZE_STATE.BOTH_OPEN }))
                break;
        }
    }

    render() {
        console.log(this);
        let editorSize, previewerSize;
        switch (this.state.size) {
            case APP_SIZE_STATE.BOTH_OPEN:
                [editorSize, previewerSize] = [WRAPPER_SIZE_STATE.MINIMIZED, WRAPPER_SIZE_STATE.MINIMIZED]
                break;
            case APP_SIZE_STATE.EDITOR_OPEN:
                [editorSize, previewerSize] = [WRAPPER_SIZE_STATE.MAXIMIZED, WRAPPER_SIZE_STATE.CLOSED]
                break;
            case APP_SIZE_STATE.PREVIEWER_OPEN:
                [editorSize, previewerSize] = [WRAPPER_SIZE_STATE.CLOSED, WRAPPER_SIZE_STATE.MAXIMIZED]
                break;
            default:
                [editorSize, previewerSize] = [WRAPPER_SIZE_STATE.MINIMIZED, WRAPPER_SIZE_STATE.MINIMIZED]
                break;
        }
        return (<React.Fragment>
            <TextComponent type={TEXT_COMPONENT.EDITOR} sizeState={editorSize} onSizeChange={this.handleSizeChange} />
            <TextComponent type={TEXT_COMPONENT.PREVIEWER} sizeState={previewerSize} onSizeChange={this.handleSizeChange} />
        </React.Fragment>)
    }
}