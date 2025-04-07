import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // In a real app, you would call your backend API to get the files
    // For now, we simulate a successful response

    // Sample data
    const files = [
      {
        id: 1,
        fileName: "inventory_march.csv",
        uploadedAt: "2025-03-15T12:00:00Z",
        itemsCount: 50,
      },
      {
        id: 2,
        fileName: "new_products.xlsx",
        uploadedAt: "2025-04-01T09:30:00Z",
        itemsCount: 25,
      },
    ];

    return NextResponse.json(files, { status: 200 });
  } catch (error) {
    console.error("Error fetching files:", error);
    return NextResponse.json(
      { message: "Failed to fetch files" },
      { status: 500 }
    );
  }
}
