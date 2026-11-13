// src/app/api/admin/kyc/document/[documentId]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { Role } from "@/generated/prisma";

export async function GET(
  _req: Request,
  context: { params: Promise<{ documentId: string }> },
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const admin = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { role: true },
  });

  if (
    !admin ||
    (admin.role !== Role.ADMIN && admin.role !== Role.SUPER_ADMIN)
  ) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const { documentId } = await context.params;
  const doc = await prisma.kycDocument.findUnique({
    where: { id: documentId },
    select: { storagePath: true },
  });

  if (!doc || !doc.storagePath) {
    return NextResponse.json(
      { message: "Document not found" },
      { status: 404 },
    );
  }

  // Resolve full UploadThing URL whether storagePath holds the full ufsUrl/url or just the file key
  const targetUrl =
    doc.storagePath.startsWith("http://") ||
    doc.storagePath.startsWith("https://")
      ? doc.storagePath
      : `https://utfs.io/f/${doc.storagePath}`;

  return NextResponse.redirect(targetUrl);
}
