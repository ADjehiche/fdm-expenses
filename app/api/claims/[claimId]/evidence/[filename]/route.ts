import { NextRequest, NextResponse } from "next/server";
import { DatabaseManager } from "@/backend/db/databaseManager";
import { getCurrentUser } from "@/actions/loginauth";

/**
 * API route for retrieving evidence files for a specific claim
 * GET /api/claims/[claimId]/evidence/[filename]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { claimId: string; filename: string } }
) {
  try {
    // Authenticate the user
    const user = await getCurrentUser();
    if (!user || !user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt(user.id);
    const claimId = parseInt(params.claimId);
    const filename = decodeURIComponent(params.filename);

    if (isNaN(claimId)) {
      return NextResponse.json({ error: "Invalid claim ID" }, { status: 400 });
    }

    // Get database instance
    const db = DatabaseManager.getInstance();

    // Get the user to determine their role
    const userAccount = await db.getAccount(userId);
    if (!userAccount) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get the claim
    const claim = await db.getClaim(claimId);
    if (!claim) {
      return NextResponse.json({ error: "Claim not found" }, { status: 404 });
    }

    // Get their role for permission checking
    const employeeRole = userAccount.getEmployeeRole();
    const userRole = employeeRole ? employeeRole.getType() : null;

    // Security check - ensure the user can view this claim
    // Either they own it or they are a line manager/admin who has access
    const canView =
      claim.getEmployeeId() === userId ||
      (userRole &&
        ["Line Manager", "Administrator", "Payroll Officer"].includes(
          userRole
        ));

    if (!canView) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Get the evidence file
    const file = claim.getEvidenceFile(filename);
    if (!file) {
      return NextResponse.json(
        { error: "Evidence file not found" },
        { status: 404 }
      );
    }

    // Create response with appropriate headers
    const response = new NextResponse(file);

    // Try to determine content type from filename extension
    const fileExtension = filename.split(".").pop()?.toLowerCase();
    let contentType = "application/octet-stream"; // Default content type

    if (fileExtension) {
      const mimeTypes: Record<string, string> = {
        pdf: "application/pdf",
        jpg: "image/jpeg",
        jpeg: "image/jpeg",
        png: "image/png",
        gif: "image/gif",
        txt: "text/plain",
        doc: "application/msword",
        docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        xls: "application/vnd.ms-excel",
        xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      };

      if (fileExtension in mimeTypes) {
        contentType = mimeTypes[fileExtension];
      }
    }

    response.headers.set("Content-Type", contentType);
    response.headers.set(
      "Content-Disposition",
      `inline; filename="${filename}"`
    );

    return response;
  } catch (error) {
    console.error("Error retrieving evidence file:", error);
    return NextResponse.json(
      { error: "Failed to retrieve evidence file" },
      { status: 500 }
    );
  }
}
