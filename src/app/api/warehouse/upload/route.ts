import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";

export async function POST() {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      {
        fileId: 1,
        itemsImported: 50,
        fileName: "sample.csv",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("File upload error:", error);
    return NextResponse.json(
      { message: "File upload failed" },
      { status: 500 }
    );
  }
}
