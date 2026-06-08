"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { updatePost, savePostRevision, uploadCoverImage, getPostRevisions } from "@/app/actions/posts";
import dynamic from "next/dynamic";
const EditorWrapper = dynamic(() => import("@/components/editor/EditorWrapper"), {
  ssr: false,
});
import PostRenderer from "@/components/blog/PostRenderer";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import { Confetti, ConfettiRef } from "@/components/animations/Confetti";
import { ArrowLeft, History, Globe, FileText, Image as ImageIcon, X, Plus, RotateCcw, AlertTriangle, CheckCircle } from "lucide-react";

interface EditorPageContentProps {
  post: any;
  initialRevisions: any[];
  profile: any;
}

export default function EditorPageContent({
  post,
  initialRevisions,
  profile,
}: EditorPageContentProps) {
  const router = useRouter();
  const confettiRef = useRef<ConfettiRef>(null);

  const [title, setTitle] = useState(post.title);
  const [excerpt, setExcerpt] = useState(post.excerpt || "");
  const [coverImageUrl, setCoverImageUrl] = useState(post.cover_image_url || "");
  const [tags, setTags] = useState<string[]>(post.tags || []);
  const [newTag, setNewTag] = useState("");
  const [status, setStatus] = useState(post.status);
  const contentRef = useRef(post.content);

  const [revisions, setRevisions] = useState<any[]>(initialRevisions);
  const [selectedRevision, setSelectedRevision] = useState<any>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const [uploadingImage, setUploadingImage] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [saving, setSaving] = useState(false);

  // File upload converting to base64
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const reader = new FileReader();

    reader.onloadend = async () => {
      try {
        const base64Data = reader.result as string;
        const publicUrl = await uploadCoverImage(base64Data, file.name);
        setCoverImageUrl(publicUrl);
        // Save to database instantly
        await updatePost(post.id, { cover_image_url: publicUrl });
      } catch (err: any) {
        alert(`Cover upload failed: ${err.message}`);
      } finally {
        setUploadingImage(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Inline images uploader for EditorJS
  const handleInlineImageUpload = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const base64Data = reader.result as string;
          const url = await uploadCoverImage(base64Data, file.name);
          resolve(url);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = () => reject(new Error("Image read error"));
      reader.readAsDataURL(file);
    });
  };

  // Save tags helper
  const addTag = () => {
    const trimmed = newTag.trim().toLowerCase();
    if (trimmed && !tags.includes(trimmed)) {
      const updated = [...tags, trimmed];
      setTags(updated);
      setNewTag("");
      updatePost(post.id, { tags: updated });
    }
  };

  const removeTag = (tag: string) => {
    const updated = tags.filter((t) => t !== tag);
    setTags(updated);
    updatePost(post.id, { tags: updated });
  };

  // Auto-Save action triggered from EditorWrapper
  const handleAutoSave = async (updatedContent: any) => {
    contentRef.current = updatedContent;
    await updatePost(post.id, {
      title,
      excerpt,
      content: updatedContent,
      tags,
    });
  };

  // Explicit Save Draft Action
  const handleSaveDraft = async () => {
    setSaving(true);
    try {
      await handleAutoSave(contentRef.current);
      // Create a recovery revision record
      const rev = await savePostRevision(post.id, contentRef.current);
      if (rev.success && rev.data) {
        // Append newly created revision details to local states
        setRevisions((prev) => [
          { ...rev.data, profiles: { display_name: profile.display_name } },
          ...prev,
        ]);
      }
      setStatus("draft");
      await updatePost(post.id, { status: "draft" });
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  // Publish Action
  const handlePublish = async () => {
    setPublishing(true);
    try {
      // 1. Auto save all current states
      await handleAutoSave(contentRef.current);

      // 2. Save revision
      const rev = await savePostRevision(post.id, contentRef.current);
      if (rev.success && rev.data) {
        setRevisions((prev) => [
          { ...rev.data, profiles: { display_name: profile.display_name } },
          ...prev,
        ]);
      }

      // 3. Update status in db
      await updatePost(post.id, {
        status: "published",
        published_at: new Date().toISOString(),
      });
      setStatus("published");

      // 4. Trigger AnimeJS Fireworks burst
      if (confettiRef.current) {
        confettiRef.current.burst();
      }

      // 5. Wait for particles before redirecting
      setTimeout(() => {
        router.push(`/blog/${post.slug}`);
      }, 1500);
    } catch (e) {
      console.error(e);
      setPublishing(false);
    }
  };

  // Auto-saves and redirects to dashboard on exit
  const handleBackToDashboard = async () => {
    try {
      await handleAutoSave(contentRef.current);
    } catch (e) {
      console.error("Auto-save on exit failed:", e);
    }
    router.push("/dashboard");
  };

  // Restore revision handler
  const handleRestoreRevision = async () => {
    if (!selectedRevision) return;
    if (!confirm("Are you sure you want to restore this revision? It will overwrite your current draft.")) return;

    try {
      const restoredContent = selectedRevision.content;
      contentRef.current = restoredContent;
      await handleAutoSave(restoredContent);
      setIsPreviewOpen(false);
      setIsHistoryOpen(false);
      
      // Reload page to re-initialize editor with the new restored contents
      window.location.reload();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-6 sm:px-8">
      {/* Confetti canvas */}
      <Confetti ref={confettiRef} />

      {/* Editor Controls Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-[var(--border)] pb-6 mb-8 transition-colors duration-300">
        <div className="flex items-center gap-4">
          <button
            onClick={handleBackToDashboard}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--card)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:border-[var(--foreground)] transition-all"
            aria-label="Back to dashboard"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="font-serif-editorial text-xl font-medium text-[var(--foreground)] truncate max-w-md">
              Editing: {title || "Untitled Draft"}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={status === "published" ? "accent" : "outline"}>
                {status === "published" ? "Live" : "Draft"}
              </Badge>
              <span className="text-[10px] font-mono text-[var(--muted-foreground)]">
                Author: {profile.display_name}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            onClick={() => setIsHistoryOpen(true)}
            className="flex items-center gap-1.5"
          >
            <History size={13} /> History
          </Button>

          <Button
            variant="secondary"
            onClick={handleSaveDraft}
            loading={saving}
            className="flex items-center gap-1.5"
          >
            <FileText size={13} /> Save Draft
          </Button>

          <Button
            variant="primary"
            onClick={handlePublish}
            loading={publishing}
            className="flex items-center gap-1.5"
          >
            <Globe size={13} /> Publish Live
          </Button>
        </div>
      </div>

      {/* Settings Grid Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
        
        {/* Left Side: Inputs and Settings */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Title and Excerpt */}
          <Card className="space-y-4 p-5">
            <h3 className="text-[10px] font-mono uppercase tracking-widest text-[var(--muted-foreground)] font-bold">
              Article Properties
            </h3>
            
            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase text-[var(--muted-foreground)]">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full h-10 px-3 bg-[var(--background)] border border-[var(--border)] text-[var(--foreground)] text-sm rounded focus:border-[var(--accent)] focus:outline-none font-serif-editorial transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase text-[var(--muted-foreground)]">Excerpt / Summary</label>
              <textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                rows={3}
                className="w-full p-3 bg-[var(--background)] border border-[var(--border)] text-[var(--foreground)] text-xs rounded focus:border-[var(--accent)] focus:outline-none leading-relaxed transition-all"
                placeholder="Write a brief article hook..."
              />
            </div>
          </Card>

          {/* Cover image uploader */}
          <Card className="space-y-4 p-5">
            <h3 className="text-[10px] font-mono uppercase tracking-widest text-[var(--muted-foreground)] font-bold">
              Cover Artwork
            </h3>

            {coverImageUrl ? (
              <div className="relative aspect-[16/9] w-full rounded border border-[var(--border)] bg-[var(--background)] overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={coverImageUrl} alt="Cover preview" className="w-full h-full object-cover" />
                <button
                  onClick={() => {
                    setCoverImageUrl("");
                    updatePost(post.id, { cover_image_url: null });
                  }}
                  className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black text-[var(--foreground)] hover:text-red-400 rounded-full transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center aspect-[16/9] w-full border border-dashed border-[var(--border)] rounded cursor-pointer hover:border-[var(--accent)]/50 transition-colors">
                <ImageIcon size={24} className="text-[var(--muted-foreground)] mb-2" />
                <span className="text-[10px] font-mono uppercase text-[var(--muted-foreground)]">
                  {uploadingImage ? "Uploading..." : "Upload Cover Image"}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCoverUpload}
                  disabled={uploadingImage}
                  className="hidden"
                />
              </label>
            )}
          </Card>

          {/* Tag Editor */}
          <Card className="space-y-4 p-5">
            <h3 className="text-[10px] font-mono uppercase tracking-widest text-[var(--muted-foreground)] font-bold">
              Subject tags
            </h3>
            
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="accent"
                  className="flex items-center gap-1 py-1 pr-1 bg-[var(--accent)]/10 text-[var(--accent)]"
                >
                  {tag}
                  <button
                    onClick={() => removeTag(tag)}
                    className="p-0.5 rounded hover:bg-[var(--accent)]/20 text-current"
                  >
                    <X size={10} />
                  </button>
                </Badge>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                placeholder="e.g. design"
                className="flex-1 h-9 px-3 bg-[var(--background)] border border-[var(--border)] text-[var(--foreground)] text-xs rounded focus:border-[var(--accent)] focus:outline-none transition-all"
              />
              <button
                type="button"
                onClick={addTag}
                className="h-9 w-9 flex items-center justify-center bg-[var(--border)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] rounded transition-colors duration-300"
              >
                <Plus size={14} />
              </button>
            </div>
          </Card>

        </div>

        {/* Right Side: The Full Rich EditorJS interface */}
        <div className="lg:col-span-8">
          <EditorWrapper
            initialData={post.content}
            onChange={(d) => { contentRef.current = d; }}
            onAutoSave={handleAutoSave}
            onImageUpload={handleInlineImageUpload}
          />
        </div>

      </div>

      {/* REVISION HISTORY PANEL - SLIDEOVER SHEET (RIGHT) */}
      <Modal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        title="Revision Log"
        position="right"
      >
        {revisions.length === 0 ? (
          <div className="py-20 text-center text-xs font-mono text-[var(--muted-foreground)] italic">
            No save points recorded yet. Revisions are created upon saving drafts.
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-[10px] font-mono text-[var(--muted-foreground)] uppercase tracking-wider mb-2 leading-relaxed">
              Historical save points are created during explicit saves. Select a version to inspect and restore.
            </p>
            {revisions.map((rev) => {
              const dateStr = new Date(rev.saved_at).toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              });
              return (
                <div
                  key={rev.id}
                  onClick={() => {
                    setSelectedRevision(rev);
                    setIsPreviewOpen(true);
                  }}
                  className="border border-[var(--border)] bg-[var(--card)] p-4 rounded hover:border-[var(--accent)] cursor-pointer transition-colors duration-300 flex items-center justify-between"
                >
                  <div>
                    <h5 className="font-mono text-xs text-[var(--foreground)] font-semibold">{dateStr}</h5>
                    <p className="text-[10px] font-mono text-[var(--muted-foreground)] mt-1">
                      Saved by: {rev.profiles?.display_name || "Unknown"}
                    </p>
                  </div>
                  <Badge variant="outline">Preview</Badge>
                </div>
              );
            })}
          </div>
        )}
      </Modal>

      {/* REVISION PREVIEW DETAILED VIEW MODAL */}
      <Modal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        title="Revision Preview"
        position="center"
      >
        {selectedRevision && (
          <div className="space-y-6">
            <div className="flex items-center justify-between bg-amber-500/10 border border-amber-500/20 p-4 rounded text-amber-500">
              <div className="flex items-center gap-2">
                <AlertTriangle size={16} />
                <span className="text-[11px] font-mono uppercase tracking-wider font-bold">Restorable Log Point</span>
              </div>
              
              <Button
                variant="primary"
                size="sm"
                onClick={handleRestoreRevision}
                className="flex items-center gap-1.5 h-8 text-[9px]"
              >
                <RotateCcw size={11} /> Restore
              </Button>
            </div>

            <div className="border border-[var(--border)] bg-[var(--background)] p-6 rounded-lg max-h-[60vh] overflow-y-auto select-none transition-colors duration-300">
              <h2 className="font-serif-editorial text-2xl font-bold mb-6 text-[var(--foreground)] opacity-70">
                {title} (Preview)
              </h2>
              <PostRenderer content={selectedRevision.content} />
            </div>
          </div>
        )}
      </Modal>

      {publishing && (
        <div className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[var(--background)]/85 backdrop-blur-md transition-all duration-500 animate-fadeIn">
          <div className="flex flex-col items-center max-w-sm text-center px-6">
            {/* Elegant luxury loading spinner */}
            <div className="relative flex items-center justify-center w-20 h-20 mb-6">
              {/* Outer pulsing ring */}
              <div className="absolute inset-0 rounded-full border-2 border-[var(--accent)]/20 animate-ping duration-1000" />
              {/* Spinning active ring */}
              <div className="absolute inset-0 rounded-full border-t-2 border-r-2 border-l-2 border-transparent border-t-[var(--accent)] border-r-[var(--accent)] animate-spin" style={{ animationDuration: '0.8s' }} />
              {/* Inner static logo detail */}
              <Globe className="text-[var(--accent)] animate-pulse" size={28} />
            </div>
            
            <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[var(--accent)] font-semibold mb-2">
              Publishing Live
            </span>
            <h3 className="font-serif-editorial text-2xl text-[var(--foreground)] font-normal mb-3">
              Deploying Article...
            </h3>
            <p className="text-xs text-[var(--muted-foreground)] leading-relaxed font-light">
              We are compiling and indexing your thoughts for the select community distribution directory.
            </p>
          </div>
        </div>
      )}

    </div>
  );
}
