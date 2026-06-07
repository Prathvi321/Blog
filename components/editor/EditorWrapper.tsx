"use client";

import React, { useEffect, useRef, useState } from "react";
import { CheckCircle, CloudLightning, Loader2 } from "lucide-react";
import anime from "animejs";

interface EditorWrapperProps {
  initialData?: any;
  onChange?: (data: any) => void;
  onAutoSave?: (data: any) => Promise<void>;
  onImageUpload?: (file: File) => Promise<string>;
}

export default function EditorWrapper({
  initialData,
  onChange,
  onAutoSave,
  onImageUpload,
}: EditorWrapperProps) {
  const editorDivId = "editorjs-container";
  const editorRef = useRef<any>(null);
  const [isReady, setIsReady] = useState(false);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const saveIndicatorRef = useRef<HTMLDivElement>(null);
  const isModifiedRef = useRef<boolean>(false);

  // Trigger anime.js animations for saving states
  useEffect(() => {
    if (!saveIndicatorRef.current) return;
    
    if (saveState === "saving") {
      anime({
        targets: saveIndicatorRef.current,
        opacity: [0.5, 1],
        scale: [0.95, 1],
        duration: 300,
        easing: "easeOutCubic",
      });
    } else if (saveState === "saved") {
      anime({
        targets: saveIndicatorRef.current,
        backgroundColor: ["#262626", "#15803d", "#262626"],
        duration: 1200,
        easing: "easeInOutQuad",
      });
    }
  }, [saveState]);

  useEffect(() => {
    let active = true;

    const initEditor = async () => {
      try {
        // Dynamically import Editor.js and plugins for SSR compatibility
        const EditorJS = (await import("@editorjs/editorjs")).default;
        const Paragraph = (await import("@editorjs/paragraph")).default;
        const Header = (await import("@editorjs/header")).default;
        const ImageTool = (await import("@editorjs/image")).default;
        const Quote = (await import("@editorjs/quote")).default;
        const Code = (await import("@editorjs/code")).default;
        const List = (await import("@editorjs/list")).default;
        const Delimiter = (await import("@editorjs/delimiter")).default;
        // @ts-ignore
        const Embed = (await import("@editorjs/embed")).default;

        if (!active) return;

        // Destroy existing editor instance if it exists
        if (editorRef.current) {
          await editorRef.current.destroy();
          editorRef.current = null;
        }

        const editor = new EditorJS({
          holder: editorDivId,
          data: initialData || {},
          placeholder: "Let your thoughts expand...",
          tools: {
            paragraph: {
              class: Paragraph as any,
              inlineToolbar: true,
            },
            header: {
              class: Header as any,
              inlineToolbar: true,
              config: {
                placeholder: "Header",
                levels: [2, 3, 4],
                defaultLevel: 2,
              },
            },
            image: {
              class: ImageTool as any,
              config: {
                uploader: {
                  async uploadByFile(file: File) {
                    if (onImageUpload) {
                      try {
                        const url = await onImageUpload(file);
                        return {
                          success: 1,
                          file: { url },
                        };
                      } catch (error) {
                        console.error("Image upload failed:", error);
                        return { success: 0, message: "Upload failed" };
                      }
                    }
                    return { success: 0, message: "Uploader not configured" };
                  },
                },
              },
            },
            quote: {
              class: Quote as any,
              inlineToolbar: true,
              config: {
                quotePlaceholder: "Enter a quote",
                captionPlaceholder: "Quote author",
              },
            },
            code: {
              class: Code as any,
              config: {
                placeholder: "Write code here...",
              },
            },
            list: {
              class: List as any,
              inlineToolbar: true,
            },
            delimiter: Delimiter as any,
            embed: {
              class: Embed as any,
              config: {
                services: {
                  youtube: true,
                  codepen: true,
                },
              },
            },
          },
          async onChange(api) {
            isModifiedRef.current = true;
            if (onChange) {
              const savedData = await api.saver.save();
              onChange(savedData);
            }
          },
        });

        await editor.isReady;
        editorRef.current = editor;
        setIsReady(true);
      } catch (err) {
        console.error("Failed to initialize Editor.js:", err);
      }
    };

    initEditor();

    // 30-Second Auto Save Draft System
    const autoSaveInterval = setInterval(async () => {
      if (editorRef.current && isModifiedRef.current && onAutoSave) {
        try {
          setSaveState("saving");
          const data = await editorRef.current.saver.save();
          await onAutoSave(data);
          isModifiedRef.current = false;
          setSaveState("saved");

          // Reset save indicator after 3 seconds
          setTimeout(() => {
            setSaveState("idle");
          }, 3000);
        } catch (err) {
          console.error("Auto save failed:", err);
          setSaveState("idle");
        }
      }
    }, 30000);

    return () => {
      active = false;
      clearInterval(autoSaveInterval);
      if (editorRef.current && typeof editorRef.current.destroy === "function") {
        try {
          editorRef.current.destroy();
        } catch (e) {
          console.error("Error destroying editor:", e);
        }
      }
    };
  }, [initialData, onAutoSave, onChange, onImageUpload]);

  return (
    <div className="relative w-full border border-[var(--border)] bg-[var(--card)] rounded-lg p-8 transition-colors duration-300">
      {/* Auto Save State Indicator Badge */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        {saveState !== "idle" && (
          <div
            ref={saveIndicatorRef}
            className="flex items-center gap-1.5 px-3 py-1 rounded bg-[var(--border)] border border-[var(--border)] text-[10px] font-mono uppercase tracking-widest text-[var(--foreground)]"
          >
            {saveState === "saving" ? (
              <>
                <Loader2 size={12} className="animate-spin text-[var(--accent)]" />
                <span>Saving draft...</span>
              </>
            ) : (
              <>
                <CheckCircle size={12} className="text-green-500" />
                <span className="text-green-400">Saved ✓</span>
              </>
            )}
          </div>
        )}
        {!isReady && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded bg-[var(--border)] border border-[var(--border)] text-[10px] font-mono uppercase tracking-widest text-[var(--muted-foreground)]">
            <Loader2 size={12} className="animate-spin" />
            <span>Loading editor...</span>
          </div>
        )}
      </div>

      {/* EditorJS rendering container */}
      <div
        id={editorDivId}
        className="min-h-[500px] prose prose-invert max-w-none select-text focus:outline-none"
      />
    </div>
  );
}
