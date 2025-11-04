"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Highlight from "@tiptap/extension-highlight";
import Typography from "@tiptap/extension-typography";
import {
	Bold,
	Italic,
	List,
	ListOrdered,
	Quote,
	Redo,
	Strikethrough,
	Undo,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface RichTextEditorProps {
	content: any;
	onChange: (content: any) => void;
	placeholder?: string;
	editable?: boolean;
	className?: string;
}

export function RichTextEditor({
	content,
	onChange,
	placeholder = "Write something...",
	editable = true,
	className,
}: RichTextEditorProps) {
	const editor = useEditor({
		extensions: [
			StarterKit.configure({
				heading: {
					levels: [1, 2, 3],
				},
			}),
			Highlight,
			Typography,
		],
		content,
		editable,
		immediatelyRender: false,
		onUpdate: ({ editor }) => {
			onChange(editor.getJSON());
		},
		editorProps: {
			attributes: {
				class:
					"prose prose-sm max-w-none focus:outline-none min-h-[150px] px-4 py-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_blockquote]:border-l-4 [&_blockquote]:border-muted [&_blockquote]:pl-4 [&_blockquote]:italic",
			},
		},
	});

	if (!editor) {
		return null;
	}

	return (
		<div
			className={cn(
				"overflow-hidden rounded-lg border bg-background",
				className,
			)}
		>
			{editable && (
				<div className="flex flex-wrap items-center gap-1 border-b bg-muted/30 p-2">
					<Button
						type="button"
						variant="ghost"
						size="sm"
						onClick={() => editor.chain().focus().toggleBold().run()}
						disabled={!editor.can().chain().focus().toggleBold().run()}
						className={cn(
							"h-8 w-8 p-0",
							editor.isActive("bold") && "bg-muted",
						)}
					>
						<Bold className="h-4 w-4" />
					</Button>
					<Button
						type="button"
						variant="ghost"
						size="sm"
						onClick={() => editor.chain().focus().toggleItalic().run()}
						disabled={!editor.can().chain().focus().toggleItalic().run()}
						className={cn(
							"h-8 w-8 p-0",
							editor.isActive("italic") && "bg-muted",
						)}
					>
						<Italic className="h-4 w-4" />
					</Button>
					<Button
						type="button"
						variant="ghost"
						size="sm"
						onClick={() => editor.chain().focus().toggleStrike().run()}
						disabled={!editor.can().chain().focus().toggleStrike().run()}
						className={cn(
							"h-8 w-8 p-0",
							editor.isActive("strike") && "bg-muted",
						)}
					>
						<Strikethrough className="h-4 w-4" />
					</Button>

					<div className="mx-1 h-6 w-px bg-border" />

					<Button
						type="button"
						variant="ghost"
						size="sm"
						onClick={() => editor.chain().focus().toggleBulletList().run()}
						className={cn(
							"h-8 w-8 p-0",
							editor.isActive("bulletList") && "bg-muted",
						)}
					>
						<List className="h-4 w-4" />
					</Button>
					<Button
						type="button"
						variant="ghost"
						size="sm"
						onClick={() => editor.chain().focus().toggleOrderedList().run()}
						className={cn(
							"h-8 w-8 p-0",
							editor.isActive("orderedList") && "bg-muted",
						)}
					>
						<ListOrdered className="h-4 w-4" />
					</Button>
					<Button
						type="button"
						variant="ghost"
						size="sm"
						onClick={() => editor.chain().focus().toggleBlockquote().run()}
						className={cn(
							"h-8 w-8 p-0",
							editor.isActive("blockquote") && "bg-muted",
						)}
					>
						<Quote className="h-4 w-4" />
					</Button>

					<div className="mx-1 h-6 w-px bg-border" />

					<Button
						type="button"
						variant="ghost"
						size="sm"
						onClick={() => editor.chain().focus().undo().run()}
						disabled={!editor.can().chain().focus().undo().run()}
						className="h-8 w-8 p-0"
					>
						<Undo className="h-4 w-4" />
					</Button>
					<Button
						type="button"
						variant="ghost"
						size="sm"
						onClick={() => editor.chain().focus().redo().run()}
						disabled={!editor.can().chain().focus().redo().run()}
						className="h-8 w-8 p-0"
					>
						<Redo className="h-4 w-4" />
					</Button>
				</div>
			)}
			<EditorContent editor={editor} />
		</div>
	);
}