import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { z } from "zod";

import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

const f = createUploadthing();

const allowedDocumentTypes = [
  "AADHAAR_FRONT",
  "AADHAAR_BACK",
  "PAN_CARD",
  "PROFILE_IMAGE",
] as const;

export const ourFileRouter = {
  kycDocument: f({
    image: {
      maxFileSize: "256KB",
      maxFileCount: 1,
    },
    pdf: {
      maxFileSize: "256KB",
      maxFileCount: 1,
    },
  })
    .input(
      z.object({
        documentType: z.enum(allowedDocumentTypes),
      }),
    )
    .middleware(async ({ input }) => {
      const session = await getSession();

      if (!session?.userId) {
        throw new UploadThingError("Please login to upload documents.");
      }

      const kyc = await prisma.kyc.findUnique({
        where: { userId: session.userId },
        select: { id: true },
      });

      if (!kyc) {
        throw new UploadThingError(
          "Please save your KYC personal details before uploading documents.",
        );
      }

      return {
        userId: session.userId,
        kycId: kyc.id,
        documentType: input.documentType,
      };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // Persist the private object key, never a public URL.
      await prisma.kycDocument.create({
        data: {
          kycId: metadata.kycId,
          documentType: metadata.documentType,
          storagePath: file.key,
          fileSize: file.size,
          mimeType: file.type,
        },
      });

      return {
        documentType: metadata.documentType,
        uploaded: true,
      };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
