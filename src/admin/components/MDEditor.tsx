import MDEditor, { commands, MDEditorProps } from '@uiw/react-md-editor';
import { FC } from 'react';

const commandsBar = [
    ...[commands.bold, commands.italic, commands.strikethrough],
    commands.divider,
    ...[commands.link, commands.quote],
    commands.divider,
    ...[commands.unorderedListCommand, commands.orderedListCommand],
    commands.divider
];

const MarkdownEditor: FC<MDEditorProps> = props => <MDEditor commands={commandsBar} height={300} {...props} />;
MarkdownEditor.displayName = 'MDEditorWrapper';

export default MarkdownEditor;
