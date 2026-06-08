import React from "react";

interface Block {
  id?: string;
  type: string;
  data: any;
}

interface PostRendererProps {
  content: {
    blocks: Block[];
  };
}

const renderListItems = (items: any[], parentKey: string, isOrdered: boolean): React.ReactNode[] => {
  return items.map((item: any, i: number) => {
    if (typeof item === "string") {
      return (
        <li key={`${parentKey}-li-${i}`} dangerouslySetInnerHTML={{ __html: item }} />
      );
    }
    
    if (item && typeof item === "object") {
      const content = item.content || "";
      const nestedItems = item.items || [];
      const NestedListTag = isOrdered ? "ol" : "ul";
      
      return (
        <li key={`${parentKey}-li-${i}`}>
          <span dangerouslySetInnerHTML={{ __html: content }} />
          {nestedItems.length > 0 && (
            <NestedListTag className={`${isOrdered ? "list-decimal" : "list-disc"} pl-6 mt-2 space-y-2`}>
              {renderListItems(nestedItems, `${parentKey}-nested-${i}`, isOrdered)}
            </NestedListTag>
          )}
        </li>
      );
    }
    
    return null;
  });
};

export default function PostRenderer({ content }: PostRendererProps) {
  if (!content || !content.blocks || !Array.isArray(content.blocks)) {
    return (
      <p className="text-[var(--muted-foreground)] italic font-mono text-center">
        No content available.
      </p>
    );
  }

  return (
    <div className="prose prose-invert max-w-none select-text">
      {content.blocks.map((block, index) => {
        const key = block.id || `block-${index}`;
        
        switch (block.type) {
          case "paragraph":
            return (
              <p
                key={key}
                className="text-base sm:text-lg leading-relaxed mb-6 text-[var(--foreground)] opacity-90 font-light"
                dangerouslySetInnerHTML={{ __html: block.data.text }}
              />
            );

          case "header": {
            const level = block.data.level || 2;
            const headingClasses = "font-serif-editorial text-[var(--foreground)] tracking-tight mt-10 mb-4 font-normal";
            
            if (level === 2) {
              return (
                <h2
                  key={key}
                  className={`${headingClasses} text-2xl sm:text-3xl border-b border-[var(--border)] pb-2`}
                  dangerouslySetInnerHTML={{ __html: block.data.text }}
                />
              );
            } else if (level === 3) {
              return (
                <h3
                  key={key}
                  className={`${headingClasses} text-xl sm:text-2xl`}
                  dangerouslySetInnerHTML={{ __html: block.data.text }}
                />
              );
            } else {
              return (
                <h4
                  key={key}
                  className={`${headingClasses} text-lg sm:text-xl`}
                  dangerouslySetInnerHTML={{ __html: block.data.text }}
                />
              );
            }
          }

          case "image": {
            const imgUrl = block.data.file?.url || block.data.url;
            if (!imgUrl) return null;
            return (
              <figure key={key} className="my-8 flex flex-col items-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imgUrl}
                  alt={block.data.caption || "Blog image"}
                  className="rounded-lg border border-[var(--border)] max-h-[550px] w-full object-cover transition-colors duration-300 shadow-md"
                />
                {block.data.caption && (
                  <figcaption className="mt-2.5 text-xs text-[var(--muted-foreground)] font-mono text-center max-w-xl">
                    {block.data.caption}
                  </figcaption>
                )}
              </figure>
            );
          }

          case "quote":
            return (
              <blockquote
                key={key}
                className="border-l-[3px] border-[var(--accent)] pl-6 my-8 italic text-lg text-[var(--foreground)] font-serif-editorial bg-[var(--card)]/30 py-4 pr-4 rounded-r-md transition-colors duration-300"
              >
                <p
                  className="leading-relaxed mb-2"
                  dangerouslySetInnerHTML={{ __html: block.data.text }}
                />
                {block.data.caption && (
                  <cite className="block text-xs font-mono uppercase tracking-widest text-[var(--accent)] not-italic">
                    — {block.data.caption}
                  </cite>
                )}
              </blockquote>
            );

          case "code":
            return (
              <pre
                key={key}
                className="bg-[var(--card)] border border-[var(--border)] p-4 rounded-lg overflow-x-auto my-6 text-xs font-mono text-[var(--foreground)] leading-relaxed select-text transition-colors duration-300"
              >
                <code>{block.data.code}</code>
              </pre>
            );

          case "list": {
            const isOrdered = block.data.style === "ordered";
            const ListTag = isOrdered ? "ol" : "ul";
            const items = block.data.items || [];
            return (
              <ListTag
                key={key}
                className={`${
                  isOrdered ? "list-decimal" : "list-disc"
                } pl-6 mb-6 text-base space-y-2.5 text-[var(--foreground)] font-light`}
              >
                {renderListItems(items, key, isOrdered)}
              </ListTag>
            );
          }

          case "checklist": {
            const items = block.data.items || [];
            return (
              <div key={key} className="mb-6 space-y-2.5">
                {items.map((item: any, i: number) => {
                  const isChecked = typeof item === "object" ? !!item.checked : false;
                  const textContent = typeof item === "string" ? item : (item.text || item.content || "");
                  return (
                    <div key={`${key}-check-${i}`} className="flex items-start gap-2.5">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        readOnly
                        className="rounded border-[var(--border)] bg-[var(--card)] text-[var(--accent)] focus:ring-0 focus:ring-offset-0 pointer-events-none mt-1 h-4 w-4 shrink-0"
                      />
                      <span
                        className={`text-base font-light leading-relaxed ${
                          isChecked ? "line-through text-[var(--muted-foreground)] opacity-75" : "text-[var(--foreground)]"
                        }`}
                        dangerouslySetInnerHTML={{ __html: textContent }}
                      />
                    </div>
                  );
                })}
              </div>
            );
          }

          case "delimiter":
            return (
              <hr
                key={key}
                className="my-12 border-[var(--border)] max-w-[80px] mx-auto border-t-2 opacity-60"
              />
            );

          case "embed": {
            const embedUrl = block.data.embed;
            if (!embedUrl) return null;
            
            let finalSrc = embedUrl;
            if (embedUrl.includes("youtube.com/watch")) {
              try {
                const urlObj = new URL(embedUrl);
                const v = urlObj.searchParams.get("v");
                if (v) finalSrc = `https://www.youtube.com/embed/${v}`;
              } catch (e) {}
            } else if (embedUrl.includes("youtu.be/")) {
              const v = embedUrl.split("/").pop();
              if (v) finalSrc = `https://www.youtube.com/embed/${v}`;
            }

            return (
              <div
                key={key}
                className="my-8 aspect-video w-full rounded-lg border border-[var(--border)] overflow-hidden shadow-lg transition-colors duration-300"
              >
                <iframe
                  src={finalSrc}
                  className="w-full h-full"
                  allowFullScreen
                  title={block.data.caption || "Embedded content player"}
                  loading="lazy"
                />
              </div>
            );
          }

          default:
            return null;
        }
      })}
    </div>
  );
}
