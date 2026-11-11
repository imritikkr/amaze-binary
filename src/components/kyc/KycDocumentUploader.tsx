"use client";

import { useState } from "react";
import {
  UploadCloud,
  FileCheck,
  Loader2,
  Trash2,
  FileText,
} from "lucide-react";
import { toast } from "sonner";

import { useUploadThing } from "@/lib/uploadthing";

type DocumentType =
  | "AADHAAR_FRONT"
  | "AADHAAR_BACK"
  | "PAN_CARD"
  | "PROFILE_IMAGE";

interface Props {
  documentType: DocumentType;
  title: string;
  description: string;
  initialUploaded?: boolean;
  onUploaded?: () => void;
}

export function KycDocumentUploader({
  documentType,
  title,
  description,
  initialUploaded = false,
  onUploaded,
}: Props) {
  const [uploaded, setUploaded] = useState(initialUploaded);
  const [fileName, setFileName] = useState("");

  const { startUpload, isUploading } = useUploadThing("kycDocument", {
    onClientUploadComplete: () => {
      setUploaded(true);
      toast.success(`${title} uploaded successfully.`);
      onUploaded?.();
    },
    onUploadError: (error) => {
      toast.error(error.message || "Document upload failed.");
    },
  });

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];

    if (!allowedTypes.includes(file.type)) {
      toast.error("Only JPG, PNG and PDF files are allowed.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Maximum file size is 5 MB.");
      event.target.value = "";
      return;
    }

    setFileName(file.name);

    try {
      await startUpload([file], { documentType });
    } catch {
      toast.error("Unable to upload document.");
    } finally {
      event.target.value = "";
    }
  }

  return (
    <div className="rounded-2xl border border-[#e8e8df] bg-white p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#edf4e9] text-[#55784c]">
          <FileText size={21} />
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-bold text-[#1c3324]">{title}</h3>
          <p className="mt-1 text-xs text-[#858b80]">{description}</p>
        </div>

        {uploaded && (
          <FileCheck size={20} className="shrink-0 text-green-600" />
        )}
      </div>

      <label
        className={`mt-4 flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed p-4 text-xs font-semibold transition ${
          uploaded
            ? "border-green-200 bg-green-50 text-green-700"
            : "border-[#b8c9b2] bg-[#fafbf8] text-[#55784c] hover:bg-[#f0f5ed]"
        } ${isUploading ? "pointer-events-none opacity-60" : ""}`}
      >
        {isUploading ? (
          <>
            <Loader2 size={17} className="animate-spin" />
            Uploading...
          </>
        ) : uploaded ? (
          <>
            <FileCheck size={17} />
            Uploaded — Upload replacement
          </>
        ) : (
          <>
            <UploadCloud size={18} />
            Upload document
          </>
        )}

        <input
          type="file"
          accept="image/jpeg,image/png,application/pdf"
          className="hidden"
          disabled={isUploading}
          onChange={handleFileChange}
        />
      </label>

      {fileName && (
        <p className="mt-2 truncate text-[11px] text-[#858b80]">{fileName}</p>
      )}

      <p className="mt-2 text-[10px] text-[#92998e]">
        JPG, PNG or PDF · Maximum 5 MB
      </p>
    </div>
  );
}
