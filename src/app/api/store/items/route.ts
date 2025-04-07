import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // In a real app, you would call your backend API to get store items
    // For now, we simulate a successful response

    // Sample data
    const items = [
      {
        storeItemId: 1,
        name: "Milk",
        category: "Dairy",
        quantity: 20,
        price: 3.49,
        originalPrice: 3.99,
        discount: 12.5,
        expireDate: "2025-04-15",
        isExpired: false,
      },
      {
        storeItemId: 2,
        name: "Bread",
        category: "Bakery",
        quantity: 15,
        price: 2.99,
        originalPrice: 2.99,
        discount: 0,
        expireDate: "2025-04-10",
        isExpired: false,
      },
      {
        storeItemId: 3,
        name: "Yogurt",
        category: "Dairy",
        quantity: 5,
        price: 0.99,
        originalPrice: 1.99,
        discount: 50,
        expireDate: "2025-04-08",
        isExpired: false,
      },
      {
        storeItemId: 4,
        name: "Expired Cheese",
        category: "Dairy",
        quantity: 2,
        price: 4.99,
        originalPrice: 7.99,
        discount: 40,
        expireDate: "2025-04-01",
        isExpired: true,
      },
      // Add more sample items as needed
    ];

    return NextResponse.json(items, { status: 200 });
  } catch (error) {
    console.error("Error fetching store items:", error);
    return NextResponse.json(
      { message: "Failed to fetch store items" },
      { status: 500 }
    );
  }
}
