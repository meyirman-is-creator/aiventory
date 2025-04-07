import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";

export async function GET(
  request: NextRequest,
  { params }: { params: { fileId: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const fileId = parseInt(params.fileId);

    // In a real app, you would call your backend API to get the items for the specific file
    // For now, we simulate a successful response

    // Sample data
    const items = [
      {
        itemId: 1,
        name: "Milk",
        category: "Dairy",
        quantity: 50,
        expireDate: "2025-04-15",
        fileId,
      },
      {
        itemId: 2,
        name: "Bread",
        category: "Bakery",
        quantity: 30,
        expireDate: "2025-04-10",
        fileId,
      },
      // Add more sample items as needed
    ];

    return NextResponse.json(items, { status: 200 });
  } catch (error) {
    console.error(`Error fetching items for file ${params.fileId}:`, error);
    return NextResponse.json(
      { message: `Failed to fetch items for file ${params.fileId}` },
      { status: 500 }
    );
  }
}
