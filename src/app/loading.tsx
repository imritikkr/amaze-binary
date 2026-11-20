// src/app/loading.tsx
import { AmazeLoader } from "@/components/ui/AmazeLoader";

export default function GlobalLoading() {
  return (
    <AmazeLoader
      variant="fullscreen"
      size="lg"
      label="Amaze Ayurveda"
      sublabel="Preparing your herbal wellness & network workspace..."
    />
  );
}
