import { useState, useRef } from "react";
import { ArrowLeft, Plus, X, Clock, ChevronRight, Pencil, Trash2, Camera, Check } from "lucide-react";
import {
  useSourdoughData,
  computeRatio,
  type FeedingEntry,
  type FeedingImage,
  type FlourType,
} from "../../hooks/useSourdoughData";
import { BreadShell } from "./BreadShell";

// ─── helpers ─────────────────────────────────────────────────────────────────

function today() {
  return new Date().toISOString().slice(0, 10);
}

function nowTime() {
  return new Date().toTimeString().slice(0, 5);
}

function formatDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function blankEntry(): FeedingEntry {
  return {
    id: crypto.randomUUID(),
    date: today(),
    time: nowTime(),
    starterMass: 0,
    waterMass: 0,
    flourMass: 0,
    flourType: "Plain",
    peakTime: null,
    images: [],
    notes: "",
    createdAt: new Date().toISOString(),
  };
}

// ─── sub-components ───────────────────────────────────────────────────────────

const FLOUR_TYPES: FlourType[] = ["Plain", "Wholemeal", "Combo"];

function FlourBadge({ type }: { type: FlourType }) {
  const colours: Record<FlourType, string> = {
    Plain: "bg-amber-100 text-amber-800",
    Wholemeal: "bg-stone-200 text-stone-700",
    Combo: "bg-yellow-100 text-yellow-800",
  };
  return (
    <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-medium ${colours[type]}`}>
      {type}
    </span>
  );
}

// collapsed entry row — date · time · ratio only
function FeedingRow({
  entry,
  onClick,
}: {
  entry: FeedingEntry;
  onClick: () => void;
}) {
  const ratio = computeRatio(entry.starterMass, entry.flourMass, entry.waterMass);
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-2.5 border-b border-amber-200/40 hover:bg-amber-50/40 transition-colors text-left text-xs text-neutral-700"
    >
      <span className="font-medium text-neutral-800 shrink-0 w-28">
        {formatDate(entry.date)}
      </span>
      <span className="text-neutral-500 shrink-0 w-12">{entry.time}</span>
      <span className="flex-1 font-mono text-neutral-500">{ratio}</span>
      {entry.peakTime && (
        <span className="flex items-center gap-0.5 text-amber-700 shrink-0">
          <Clock size={10} />
          {entry.peakTime}
        </span>
      )}
      <ChevronRight size={12} className="text-neutral-400 shrink-0" />
    </button>
  );
}

// ─── form ─────────────────────────────────────────────────────────────────────

function FeedingForm({
  initial,
  onSave,
  onCancel,
}: {
  initial: FeedingEntry;
  onSave: (e: FeedingEntry) => void;
  onCancel: () => void;
}) {
  const [draft, setDraft] = useState<FeedingEntry>(initial);

  const set = <K extends keyof FeedingEntry>(k: K, v: FeedingEntry[K]) =>
    setDraft((prev) => ({ ...prev, [k]: v }));

  const numField = (
    label: string,
    key: "starterMass" | "waterMass" | "flourMass",
    unit = "g"
  ) => (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] font-semibold uppercase tracking-wider text-amber-800/70">
        {label}
      </label>
      <div className="flex items-center gap-1">
        <input
          type="number"
          min={0}
          value={draft[key] || ""}
          onChange={(e) => set(key, Number(e.target.value))}
          className="bread-input w-full"
          placeholder="0"
        />
        <span className="text-xs text-amber-700">{unit}</span>
      </div>
    </div>
  );

  return (
    <div className="px-5 py-4 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-semibold uppercase tracking-wider text-amber-800/70">
            Date
          </label>
          <input
            type="date"
            value={draft.date}
            onChange={(e) => set("date", e.target.value)}
            className="bread-input w-full"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-semibold uppercase tracking-wider text-amber-800/70">
            Time
          </label>
          <input
            type="time"
            value={draft.time}
            onChange={(e) => set("time", e.target.value)}
            className="bread-input w-full"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {numField("Starter", "starterMass")}
        {numField("Flour", "flourMass")}
        {numField("Water", "waterMass")}
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-[10px] font-semibold uppercase tracking-wider text-amber-800/70">
          Flour type
        </label>
        <select
          value={draft.flourType}
          onChange={(e) => set("flourType", e.target.value as FlourType)}
          className="bread-input w-full"
        >
          {FLOUR_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-[10px] font-semibold uppercase tracking-wider text-amber-800/70">
          Notes
        </label>
        <textarea
          value={draft.notes}
          onChange={(e) => set("notes", e.target.value)}
          rows={2}
          className="bread-input w-full resize-none"
          placeholder="Any observations…"
        />
      </div>

      <div className="flex gap-2 pt-1">
        <button
          onClick={() => onSave(draft)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md bg-amber-700 hover:bg-amber-800 text-white text-xs font-semibold transition-colors"
        >
          <Check size={13} /> Save
        </button>
        <button
          onClick={onCancel}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md border border-amber-300 text-amber-800 hover:bg-amber-50 text-xs font-semibold transition-colors"
        >
          <X size={13} /> Cancel
        </button>
      </div>
    </div>
  );
}

// ─── detail view ──────────────────────────────────────────────────────────────

function ImageCard({
  image,
  onCommentChange,
  onDelete,
}: {
  image: FeedingImage;
  onCommentChange: (id: string, comment: string) => void;
  onDelete: (id: string) => void;
}) {
  const [localComment, setLocalComment] = useState(image.comment);
  return (
    <div className="flex flex-col gap-1.5 bg-amber-50/60 rounded-lg p-2 border border-amber-200/50">
      <div className="relative">
        <img
          src={image.dataUrl}
          alt="starter photo"
          className="w-full h-28 object-cover rounded-md"
        />
        <button
          onClick={() => onDelete(image.id)}
          className="absolute top-1 right-1 bg-black/40 hover:bg-black/60 text-white rounded-full p-0.5 transition-colors"
        >
          <X size={10} />
        </button>
      </div>
      <p className="font-mono text-[9px] text-amber-700">
        {new Date(image.timestamp).toLocaleString("en-GB")}
      </p>
      <input
        type="text"
        value={localComment}
        onChange={(e) => setLocalComment(e.target.value)}
        onBlur={() => onCommentChange(image.id, localComment)}
        placeholder="Add a comment…"
        className="bread-input text-[11px] py-1"
      />
    </div>
  );
}

function FeedingDetail({
  entry,
  onUpdate,
  onDelete,
  onEdit,
}: {
  entry: FeedingEntry;
  onUpdate: (e: FeedingEntry) => void;
  onDelete: () => void;
  onEdit: () => void;
}) {
  const [localPeak, setLocalPeak] = useState(entry.peakTime ?? "");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [imageError, setImageError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const ratio = computeRatio(entry.starterMass, entry.flourMass, entry.waterMass);

  const handlePeakBlur = () => {
    onUpdate({ ...entry, peakTime: localPeak || null });
  };

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageError("");
    const files = Array.from(e.target.files ?? []);
    files.forEach((file) => {
      if (file.size > 8 * 1024 * 1024) {
        setImageError("Image too large (max 8 MB)");
        return;
      }
      const reader = new FileReader();
      reader.onload = (ev) => {
        const img: FeedingImage = {
          id: crypto.randomUUID(),
          dataUrl: ev.target!.result as string,
          timestamp: new Date().toISOString(),
          comment: "",
        };
        onUpdate({ ...entry, images: [...entry.images, img] });
      };
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };

  const handleCommentChange = (id: string, comment: string) => {
    onUpdate({
      ...entry,
      images: entry.images.map((img) =>
        img.id === id ? { ...img, comment } : img
      ),
    });
  };

  const handleDeleteImage = (id: string) => {
    onUpdate({ ...entry, images: entry.images.filter((img) => img.id !== id) });
  };

  return (
    <div className="px-5 py-4 space-y-4">
      {/* scalar fields */}
      <div className="grid grid-cols-3 gap-3 text-center">
        {[
          { label: "Starter", value: entry.starterMass },
          { label: "Flour", value: entry.flourMass },
          { label: "Water", value: entry.waterMass },
        ].map(({ label, value }) => (
          <div key={label} className="bg-amber-50/70 rounded-lg py-2 border border-amber-200/40">
            <p className="text-[9px] font-semibold uppercase tracking-widest text-amber-700/70">
              {label}
            </p>
            <p className="text-lg font-bold text-neutral-800">{value}g</p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-amber-700/70 font-medium">Flour:</span>
          <FlourBadge type={entry.flourType} />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-amber-700/70 font-medium">Ratio:</span>
          <span className="font-mono text-neutral-700">{ratio}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-amber-700/70 font-medium">Fed:</span>
          <span className="text-neutral-700">{entry.time}</span>
        </div>
      </div>

      {/* peak time inline editor */}
      <div className="flex items-center gap-2 bg-amber-100/70 border border-amber-300/50 rounded-lg px-3 py-2">
        <Clock size={13} className="text-amber-700 shrink-0" />
        <span className="text-xs font-medium text-amber-800">Peak time:</span>
        <input
          type="time"
          value={localPeak}
          onChange={(e) => setLocalPeak(e.target.value)}
          onBlur={handlePeakBlur}
          className="flex-1 bg-transparent text-xs text-neutral-800 focus:outline-none"
          placeholder="—"
        />
        {localPeak && (
          <button
            onClick={() => { setLocalPeak(""); onUpdate({ ...entry, peakTime: null }); }}
            className="text-amber-600 hover:text-amber-800"
          >
            <X size={10} />
          </button>
        )}
      </div>

      {/* notes */}
      {entry.notes && (
        <p className="text-xs text-neutral-600 bg-amber-50/40 rounded-md px-3 py-2 border border-amber-200/30 italic">
          {entry.notes}
        </p>
      )}

      {/* images */}
      {entry.images.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {entry.images.map((img) => (
            <ImageCard
              key={img.id}
              image={img}
              onCommentChange={handleCommentChange}
              onDelete={handleDeleteImage}
            />
          ))}
        </div>
      )}

      {imageError && (
        <p className="text-xs text-red-600">{imageError}</p>
      )}

      {/* add photo */}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFiles}
      />
      <button
        onClick={() => fileRef.current?.click()}
        className="w-full flex items-center justify-center gap-2 py-2 rounded-md border border-dashed border-amber-400/60 text-amber-700 hover:bg-amber-50/60 text-xs font-medium transition-colors"
      >
        <Camera size={13} /> Add photo
      </button>

      {/* edit / delete */}
      <div className="flex gap-2 pt-1">
        <button
          onClick={onEdit}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md border border-amber-300 text-amber-800 hover:bg-amber-50 text-xs font-semibold transition-colors"
        >
          <Pencil size={12} /> Edit
        </button>
        {!confirmDelete ? (
          <button
            onClick={() => setConfirmDelete(true)}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-md border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold transition-colors"
          >
            <Trash2 size={12} />
          </button>
        ) : (
          <div className="flex flex-col items-end gap-1 flex-1">
            <p className="text-xs font-semibold text-red-700">Are you sure?</p>
            <div className="flex gap-1">
              <button
                onClick={onDelete}
                className="px-3 py-1.5 rounded-md bg-red-500 hover:bg-red-600 text-white text-xs font-semibold transition-colors"
              >
                Delete
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="px-3 py-1.5 rounded-md border border-neutral-300 text-neutral-600 hover:bg-neutral-50 text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── main tracker ─────────────────────────────────────────────────────────────

type ViewMode =
  | { kind: "list" }
  | { kind: "detail"; entryId: string }
  | { kind: "new" }
  | { kind: "edit"; entryId: string };

export function FeedingTracker({ onBack }: { onBack?: () => void }) {
  const { entries, isLoading, addEntry, updateEntry, deleteEntry } =
    useSourdoughData();
  const [mode, setMode] = useState<ViewMode>({ kind: "list" });

  const activeEntry =
    mode.kind === "detail" || mode.kind === "edit"
      ? entries.find((e) => e.id === mode.entryId) ?? null
      : null;

  // ── dome: centred title ───────────────────────────────────────────────────
  let domeContent: React.ReactNode;
  let actionStrip: React.ReactNode = null;

  if (mode.kind === "list") {
    domeContent = (
      <span className="font-display text-lg text-amber-900">Sourdough Tracker</span>
    );
    actionStrip = (
      <div className="flex items-center justify-between px-4 py-2 border-b border-amber-200/50">
        {onBack ? (
          <button
            onClick={onBack}
            className="flex items-center gap-1 text-xs font-semibold text-amber-700 hover:text-amber-500 transition-colors"
          >
            <ArrowLeft size={13} /> Back
          </button>
        ) : (
          <div />
        )}
        <button
          onClick={() => setMode({ kind: "new" })}
          className="flex items-center gap-1 text-xs font-semibold text-amber-800 hover:text-amber-600 transition-colors"
        >
          <Plus size={13} /> Add Feed
        </button>
      </div>
    );
  } else if (mode.kind === "new") {
    domeContent = (
      <span className="font-display text-lg text-amber-900">New Feed</span>
    );
  } else if (mode.kind === "detail" && activeEntry) {
    domeContent = (
      <span className="font-display text-lg text-amber-900">
        {formatDate(activeEntry.date)}
      </span>
    );
    actionStrip = (
      <div className="flex px-4 py-2 border-b border-amber-200/50">
        <button
          onClick={() => setMode({ kind: "list" })}
          className="flex items-center gap-1 text-xs font-semibold text-amber-700 hover:text-amber-500 transition-colors"
        >
          <ArrowLeft size={13} /> Back
        </button>
      </div>
    );
  } else if (mode.kind === "edit" && activeEntry) {
    domeContent = (
      <span className="font-display text-lg text-amber-900">Edit Feed</span>
    );
    actionStrip = (
      <div className="flex px-4 py-2 border-b border-amber-200/50">
        <button
          onClick={() => setMode({ kind: "detail", entryId: activeEntry.id })}
          className="flex items-center gap-1 text-xs font-semibold text-amber-700 hover:text-amber-500 transition-colors"
        >
          <ArrowLeft size={13} /> Back
        </button>
      </div>
    );
  }

  return (
    <BreadShell dome={domeContent}>
      {actionStrip}

      {isLoading ? (
        <div className="flex flex-col gap-2 px-5 py-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-9 rounded-md bg-amber-100/60 animate-pulse" />
          ))}
        </div>
      ) : mode.kind === "list" ? (
        <>
          {entries.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-amber-700/60 italic">
              No feedings yet — add your first one!
            </p>
          ) : (
            entries.map((entry) => (
              <FeedingRow
                key={entry.id}
                entry={entry}
                onClick={() => setMode({ kind: "detail", entryId: entry.id })}
              />
            ))
          )}
        </>
      ) : mode.kind === "new" ? (
        <FeedingForm
          initial={blankEntry()}
          onSave={async (e) => {
            await addEntry(e);
            setMode({ kind: "list" });
          }}
          onCancel={() => setMode({ kind: "list" })}
        />
      ) : mode.kind === "detail" && activeEntry ? (
        <FeedingDetail
          entry={activeEntry}
          onUpdate={updateEntry}
          onDelete={async () => {
            await deleteEntry(activeEntry.id);
            setMode({ kind: "list" });
          }}
          onEdit={() => setMode({ kind: "edit", entryId: activeEntry.id })}
        />
      ) : mode.kind === "edit" && activeEntry ? (
        <FeedingForm
          initial={{ ...activeEntry }}
          onSave={async (e) => {
            await updateEntry(e);
            setMode({ kind: "detail", entryId: e.id });
          }}
          onCancel={() =>
            setMode({ kind: "detail", entryId: activeEntry.id })
          }
        />
      ) : null}
    </BreadShell>
  );
}
