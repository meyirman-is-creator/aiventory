import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const stats = {
      totalItems: 345,
      categoriesCount: 12,
      avgTurnoverRate: 24.8,
      wasteRate: 3.2,
      items: [
        { itemId: 1, name: "Milk", category: "Dairy", quantity: 50 },
        { itemId: 2, name: "Bread", category: "Bakery", quantity: 30 },
        { itemId: 3, name: "Apples", category: "Produce", quantity: 100 },
        { itemId: 4, name: "Chicken", category: "Meat", quantity: 20 },
        { itemId: 5, name: "Rice", category: "Grains", quantity: 40 },
        { itemId: 6, name: "Pasta", category: "Grains", quantity: 35 },
      ],
    };

    return NextResponse.json(stats, { status: 200 });
  } catch (error) {
    console.error("Error fetching prediction stats:", error);
    return NextResponse.json(
      { message: "Failed to fetch prediction stats" },
      { status: 500 }
    );
  }
}