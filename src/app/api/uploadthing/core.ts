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

  profileImage: f({
    image: {
      maxFileSize: "2MB",
      maxFileCount: 1,
    },
  })
    .middleware(async () => {
      const session = await getSession();

      if (!session?.userId) {
        throw new UploadThingError("Please login to upload your photo.");
      }

      return {
        userId: session.userId,
      };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      await prisma.user.update({
        where: { id: metadata.userId },
        data: {
          avatarUrl: file.ufsUrl,
        },
      });

      return {
        uploaded: true,
        avatarUrl: file.ufsUrl,
      };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
