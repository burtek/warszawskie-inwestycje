import { useCallback, KeyboardEventHandler } from 'react';

export const useWrappingKeyPress = () =>
    useCallback<KeyboardEventHandler<HTMLDivElement>>(event => {
        // const textarea = event.currentTarget.querySelector('textarea');
        // if (textarea) {
        //     const isWrapKey = ['[', '(', '{', '"', "'"].includes(event.key);
        //     const { selectionStart, selectionEnd, selectionDirection } = textarea;
        //     const [start, end] = [selectionStart, selectionEnd].sort((a, b) => a - b);
        //     const selectionLength = Math.abs(selectionEnd - selectionStart);
        //     if (isWrapKey && selectionLength > 0) {
        //         event.preventDefault();
        //         const closingChar = { '[': ']', '{': '}', '(': ')' }[event.key] ?? event.key;
        //         const parts = [
        //             textarea?.value.substring(0, start),
        //             textarea?.value.substring(start, end),
        //             textarea?.value.substring(end)
        //         ];
        //         setMarkdownContent(`${parts[0]}${event.key}${parts[1]}${closingChar}${parts[2]}`);
        //         // textarea.value = `${parts[0]}${event.key}${parts[1]}${closingChar}${parts[2]}`;
        //         // textarea.setSelectionRange(
        //         //     selectionStart + (selectionStart < selectionEnd ? 1 : 2),
        //         //     selectionEnd + (selectionStart < selectionEnd ? 2 : 1),
        //         //     selectionDirection
        //         // );
        //         // const changeEvent = new Event('change', {
        //         //     bubbles: true,
        //         // });
        //         // textarea.dispatchEvent(changeEvent);
        //     }
        // }
    }, []);
