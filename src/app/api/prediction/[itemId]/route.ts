import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import dayjs from "dayjs";

export async function GET(
  request: NextRequest,
  { params }: { params: { itemId: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const itemId = parseInt(params.itemId);

    // Generate 30 days of forecast data (15 days past, 15 days future)
    const today = dayjs();
    const forecast = [];

    // Past data (actual)
    for (let i = 15; i > 0; i--) {
      const date = today.subtract(i, "day");
      // Generate somewhat random but trending data
      const baseValue = 50 + (15 - i) * 2; // Upward trend
      const variation = Math.random() * 10 - 5; // Random variation between -5 and 5
      forecast.push({
        date: date.format("YYYY-MM-DD"),
        value: Math.round(baseValue + variation),
      });
    }

    // Future data (predicted)
    for (let i = 0; i < 15; i++) {
      const date = today.add(i, "day");
      // Continue the trend with more variation
      const baseValue = 80 + i * 1.5; // Continuing upward trend
      const variation = Math.random() * 20 - 10; // More random variation
      forecast.push({
        date: date.format("YYYY-MM-DD"),
        value: Math.round(baseValue + variation),
      });
    }

    // Sample recommendation based on the item ID
    let name, category, recommendation;

    switch (itemId) {
      case 1:
        name = "Milk";
        category = "Dairy";
        recommendation =
          "Based on current trends, increase stock by 20% for the next week.";
        break;
      case 2:
        name = "Bread";
        category = "Bakery";
        recommendation = "Demand is steady. Maintain current ordering pattern.";
        break;
      case 3:
        name = "Apples";
        category = "Produce";
        recommendation =
          "Sales are increasing. Consider stocking 30% more for next month.";
        break;
      default:
        name = `Product ${itemId}`;
        category = "General";
        recommendation = "Monitor sales trends and adjust stock accordingly.";
    }

    const response = {
      itemId,
      name,
      category,
      forecast,
      recommendation,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error(
      `Error fetching prediction for item ${params.itemId}:`,
      error
    );
    return NextResponse.json(
      { message: `Failed to fetch prediction for item ${params.itemId}` },
      { status: 500 }
    );
  }
}
