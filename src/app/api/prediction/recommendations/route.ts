import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // In a real app, you would call your backend API
    // For now, we simulate a successful response

    // Sample data
    const recommendations = [
      {
        id: 1,
        title: "Increase Dairy Stock",
        description:
          "Based on sales trends, consider increasing dairy products by 15% for the next month.",
        priority: "high",
      },
      {
        id: 2,
        title: "Apply Discounts to Bread",
        description:
          "Bread products are approaching expiration. Consider applying a 20% discount to boost sales.",
        priority: "medium",
      },
      {
        id: 3,
        title: "Optimize Meat Ordering",
        description:
          "Meat products have a high wastage rate. Consider ordering smaller quantities more frequently.",
        priority: "high",
      },
      {
        id: 4,
        title: "Seasonal Produce Opportunity",
        description:
          "Seasonal produce sales have increased by 25%. Consider expanding your selection.",
        priority: "low",
      },
      {
        id: 5,
        title: "Reduce Beverage Stock",
        description:
          "Beverage sales have decreased by 10%. Consider reducing your inventory.",
        priority: "medium",
      },
    ];

    return NextResponse.json(recommendations, { status: 200 });
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    return NextResponse.json(
      { message: "Failed to fetch recommendations" },
      { status: 500 }
    );
  }
}
