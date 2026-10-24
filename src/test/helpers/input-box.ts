import {EventEmitter} from 'events';
import {InputBox} from 'vscode';
import {mockType} from './mock';

export function fakeInputBox(onShow: (input: InputBox) => void = () => {}) {
    const events = new EventEmitter();
    const subscribe = (name: string) => (listener: (...args: any[]) => void) => {
        events.on(name, listener);
        return {dispose: () => {events.removeListener(name, listener);}};
    };
    let disposed = false;
    const input = mockType<InputBox>({
        value: '', buttons: [],
        onDidChangeValue: subscribe('change'),
        onDidTriggerButton: subscribe('button'),
        onDidAccept: subscribe('accept'),
        onDidHide: subscribe('hide'),
        show: () => onShow(input),
        dispose: () => {disposed = true;events.emit('hide');}
    });
    return {input, events, get disposed() {return disposed;}};
}
