/**
 * TipTap-powered rich text editor component.
 * Renders a toolbar + ProseMirror content area; notifies parent via onChange.
 */
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';

interface RichTextEditorProps {
  content: string; // initial HTML
  onChange: (html: string) => void;
  disabled?: boolean;
}

const RichTextEditor = ({ content, onChange, disabled = false }: RichTextEditorProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false }),
    ],
    content,
    editable: !disabled,
    onUpdate: ({ editor: e }) => {
      onChange(e.getHTML());
    },
    // TipTap v3 requires immediatelyRender on client-side usage to silence SSR warning
    immediatelyRender: true,
  });

  const setLink = () => {
    if (!editor) return;
    const prev = editor.getAttributes('link').href as string | undefined;
    const url = window.prompt('Enter URL', prev ?? 'https://');
    if (url === null) return; // cancelled
    if (url.trim() === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    } else {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }
  };

  if (!editor) return null;

  const btn = (label: string, active: boolean, onClick: () => void, title?: string) => (
    <button
      key={label}
      type="button"
      title={title ?? label}
      className={`ann-editor__toolbar-btn${active ? ' ann-editor__toolbar-btn--active' : ''}`}
      onClick={onClick}
      disabled={disabled}
    >
      {label}
    </button>
  );

  return (
    <div className="ann-editor">
      <div className="ann-editor__toolbar" aria-label="Text formatting">
        {btn('B', editor.isActive('bold'), () =>
          editor.chain().focus().toggleBold().run())}
        {btn('I', editor.isActive('italic'), () =>
          editor.chain().focus().toggleItalic().run())}
        {btn('H2', editor.isActive('heading', { level: 2 }), () =>
          editor.chain().focus().toggleHeading({ level: 2 }).run())}
        {btn('H3', editor.isActive('heading', { level: 3 }), () =>
          editor.chain().focus().toggleHeading({ level: 3 }).run())}
        {btn('• List', editor.isActive('bulletList'), () =>
          editor.chain().focus().toggleBulletList().run(), 'Bullet list')}
        {btn('1. List', editor.isActive('orderedList'), () =>
          editor.chain().focus().toggleOrderedList().run(), 'Ordered list')}
        {btn('Link', editor.isActive('link'), setLink)}
      </div>
      <div className="ann-editor__content">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

export default RichTextEditor;
