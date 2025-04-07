"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  Select,
  Button,
  Spin,
  Empty,
  Row,
  Col,
  Statistic,
  Alert,
  Tabs,
  List,
  Typography,
  Tag,
  DatePicker,
  message,
} from "antd";
import {
  LineChartOutlined,
  AreaChartOutlined,
  BarChartOutlined,
  PieChartOutlined,
  DownloadOutlined,
  FileExcelOutlined,
} from "@ant-design/icons";
import { Line, ResponsiveLine } from "@nivo/line";
import { Bar, ResponsiveBar } from "@nivo/bar";
import { Pie, ResponsivePie } from "@nivo/pie";
import { HeatMap, ResponsiveHeatMap } from "@nivo/heatmap";
import { usePredictionStore } from "@/src/lib/store/usePredictionStore";
import {
  getPrediction,
  getPredictionStats,
  getPredictionRecommendations,
} from "@/src/lib/api/prediction";
import PageHeader from "@/src/components/ui/PageHeader";
import MainLayout from "@/src/components/layout/MainLayout";
import dayjs from "dayjs";
import { saveAs } from "file-saver";
import styles from "./prediction.module.scss";

const { Option } = Select;
const { TabPane } = Tabs;
const { Title, Text, Paragraph } = Typography;
const { RangePicker } = DatePicker;

export default function PredictionPage() {
  const {
    predictions,
    selectedItemId,
    loading,
    error,
    setPredictions,
    setSelectedItemId,
    setLoading,
    setError,
  } = usePredictionStore();

  const [stats, setStats] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().subtract(30, "day"),
    dayjs(),
  ]);
  const [chartType, setChartType] = useState<string>("line");

  useEffect(() => {
    fetchPredictionData();
  }, []);

  const fetchPredictionData = async () => {
    setLoading(true);
    try {
      // Fetch all prediction data
      const statsResponse = await getPredictionStats();
      setStats(statsResponse.data);

      // Extract unique categories
      const uniqueCategories = Array.from(
        new Set(statsResponse.data.items.map((item: any) => item.category))
      );
      setCategories(uniqueCategories as string[]);

      // If categories exist, select the first one
      if (uniqueCategories.length > 0) {
        setSelectedCategory(uniqueCategories[0] as string);
      }

      // Fetch recommendations
      const recommendationsResponse = await getPredictionRecommendations();
      setRecommendations(recommendationsResponse.data);
    } catch (error) {
      console.error("Error fetching prediction data:", error);
      setError("Failed to fetch prediction data");
    } finally {
      setLoading(false);
    }
  };

  const fetchItemPrediction = async (itemId: number) => {
    setLoading(true);
    try {
      const response = await getPrediction(itemId);

      // Find and update the prediction in the store
      const currentPredictions = [...predictions];
      const index = currentPredictions.findIndex((p) => p.itemId === itemId);

      if (index !== -1) {
        currentPredictions[index] = response.data;
      } else {
        currentPredictions.push(response.data);
      }

      setPredictions(currentPredictions);
      setSelectedItemId(itemId);
    } catch (error) {
      console.error(`Error fetching prediction for item ${itemId}:`, error);
      setError(`Failed to fetch prediction for item ${itemId}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
  };

  const handleItemSelect = (itemId: number) => {
    fetchItemPrediction(itemId);
  };

  const handleDateRangeChange = (dates: any) => {
    if (dates && dates.length === 2) {
      setDateRange([dates[0], dates[1]]);
    }
  };

  const handleChartTypeChange = (type: string) => {
    setChartType(type);
  };

  const handleExportData = () => {
    // This would normally generate a CSV or Excel file with the prediction data
    // For this example, let's create a simple JSON blob
    if (selectedItemId) {
      const prediction = predictions.find((p) => p.itemId === selectedItemId);
      if (prediction) {
        const blob = new Blob([JSON.stringify(prediction, null, 2)], {
          type: "application/json",
        });
        saveAs(
          blob,
          `prediction-${prediction.name}-${dayjs().format("YYYY-MM-DD")}.json`
        );
      }
    }
  };

  // Get the selected prediction
  const selectedPrediction = predictions.find(
    (p) => p.itemId === selectedItemId
  );

  // Filter items by selected category
  const categoryItems = stats
    ? stats.items.filter((item: any) => item.category === selectedCategory)
    : [];

  // Generate chart data for the selected item
  const generateChartData = () => {
    if (!selectedPrediction) return [];

    // Line/Area chart data
    if (chartType === "line" || chartType === "area") {
      return [
        {
          id: "actual",
          color: "#000",
          data: selectedPrediction.forecast
            .filter((point: any) => dayjs(point.date).isBefore(dayjs()))
            .map((point: any) => ({
              x: dayjs(point.date).format("YYYY-MM-DD"),
              y: point.value,
            })),
        },
        {
          id: "forecast",
          color: "#FFCC00",
          data: selectedPrediction.forecast
            .filter((point: any) =>
              dayjs(point.date).isAfter(dayjs().subtract(1, "day"))
            )
            .map((point: any) => ({
              x: dayjs(point.date).format("YYYY-MM-DD"),
              y: point.value,
            })),
        },
      ];
    }

    // Bar chart data
    if (chartType === "bar") {
      return selectedPrediction.forecast.map((point: any) => ({
        date: dayjs(point.date).format("YYYY-MM-DD"),
        value: point.value,
        color: dayjs(point.date).isAfter(dayjs()) ? "#FFCC00" : "#000",
      }));
    }

    // Pie chart data
    if (chartType === "pie") {
      // Group by month
      const monthlyData = selectedPrediction.forecast.reduce(
        (acc: any, point: any) => {
          const month = dayjs(point.date).format("MMM YYYY");
          if (!acc[month]) {
            acc[month] = 0;
          }
          acc[month] += point.value;
          return acc;
        },
        {}
      );

      return Object.entries(monthlyData).map(([month, value]) => ({
        id: month,
        label: month,
        value,
      }));
    }

    return [];
  };

  // Format the chart based on the selected type
  const renderChart = () => {
    if (!selectedPrediction) {
      return (
        <Empty
          description="Select an item to view prediction"
          className={styles.emptyChart}
        />
      );
    }

    const chartData = selectedPrediction.forecast.map((point: any) => ({
      date: dayjs(point.date).format("YYYY-MM-DD"),
      value: point.value,
      color: dayjs(point.date).isAfter(dayjs()) ? "#FFCC00" : "#000",
    }));
    const barChartData = selectedPrediction.forecast.map((point: any) => ({
      date: dayjs(point.date).format("YYYY-MM-DD"),
      value: point.value,
    }));
    switch (chartType) {
      case "line":
        return (
          <div className={styles.chartContainer}>
            <Line
              data={chartData}
              width={800} // Добавлено явное указание ширины
              height={400} // Добавлено явное указание высоты
              margin={{ top: 50, right: 50, bottom: 70, left: 60 }}
              xScale={{ type: "point" }}
              yScale={{
                type: "linear",
                min: "auto",
                max: "auto",
              }}
              axisBottom={{
                tickRotation: -45,
                legend: "Date",
                legendOffset: 50,
                legendPosition: "middle",
              }}
              axisLeft={{
                legend: "Quantity",
                legendOffset: -40,
                legendPosition: "middle",
              }}
              pointSize={10}
              pointColor={{ theme: "background" }}
              pointBorderWidth={2}
              pointBorderColor={{ from: "serieColor" }}
              pointLabelYOffset={-12}
              enableArea={false}
              useMesh={true}
              legends={[
                {
                  anchor: "bottom-right",
                  direction: "column",
                  justify: false,
                  translateX: 0,
                  translateY: 0,
                  itemsSpacing: 0,
                  itemDirection: "left-to-right",
                  itemWidth: 80,
                  itemHeight: 20,
                  itemOpacity: 0.75,
                  symbolSize: 12,
                  symbolShape: "circle",
                  symbolBorderColor: "rgba(0, 0, 0, .5)",
                  effects: [
                    {
                      on: "hover",
                      style: {
                        itemBackground: "rgba(0, 0, 0, .03)",
                        itemOpacity: 1,
                      },
                    },
                  ],
                },
              ]}
            />
          </div>
        );

      case "area":
        return (
          <div className={styles.chartContainer}>
            <Line
              data={barChartData}
              margin={{ top: 50, right: 50, bottom: 70, left: 60 }}
              xScale={{ type: "point" }}
              yScale={{
                type: "linear",
                min: "auto",
                max: "auto",
              }}
              axisBottom={{
                tickRotation: -45,
                legend: "Date",
                legendOffset: 50,
                legendPosition: "middle",
              }}
              axisLeft={{
                legend: "Quantity",
                legendOffset: -40,
                legendPosition: "middle",
              }}
              pointSize={8}
              pointColor={{ theme: "background" }}
              pointBorderWidth={2}
              pointBorderColor={{ from: "serieColor" }}
              pointLabelYOffset={-12}
              enableArea={true}
              areaOpacity={0.15}
              useMesh={true}
              legends={[
                {
                  anchor: "bottom-right",
                  direction: "column",
                  justify: false,
                  translateX: 0,
                  translateY: 0,
                  itemsSpacing: 0,
                  itemDirection: "left-to-right",
                  itemWidth: 80,
                  itemHeight: 20,
                  itemOpacity: 0.75,
                  symbolSize: 12,
                  symbolShape: "circle",
                  symbolBorderColor: "rgba(0, 0, 0, .5)",
                  effects: [
                    {
                      on: "hover",
                      style: {
                        itemBackground: "rgba(0, 0, 0, .03)",
                        itemOpacity: 1,
                      },
                    },
                  ],
                },
              ]}
            />
          </div>
        );

      case "bar":
        return (
          <div className={styles.chartContainer}>
            <Bar
              data={chartData}
              keys={["value"]}
              indexBy="date"
              margin={{ top: 50, right: 50, bottom: 70, left: 60 }}
              padding={0.3}
              colors={({ data }) => data.color}
              axisBottom={{
                tickRotation: -45,
                legend: "Date",
                legendOffset: 50,
                legendPosition: "middle",
              }}
              axisLeft={{
                legend: "Quantity",
                legendOffset: -40,
                legendPosition: "middle",
              }}
              labelSkipWidth={12}
              labelSkipHeight={12}
              labelTextColor={{ from: "color", modifiers: [["darker", 1.6]] }}
            />
          </div>
        );

      case "pie":
        return (
          <div className={styles.chartContainer}>
            <Pie
              data={chartData}
              margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
              innerRadius={0.5}
              padAngle={0.7}
              cornerRadius={3}
              activeOuterRadiusOffset={8}
              borderWidth={1}
              borderColor={{ from: "color", modifiers: [["darker", 0.2]] }}
              arcLinkLabelsSkipAngle={10}
              arcLinkLabelsTextColor="#333333"
              arcLinkLabelsThickness={2}
              arcLinkLabelsColor={{ from: "color" }}
              arcLabelsSkipAngle={10}
              arcLabelsTextColor={{ from: "color", modifiers: [["darker", 2]] }}
              legends={[
                {
                  anchor: "bottom",
                  direction: "row",
                  justify: false,
                  translateX: 0,
                  translateY: 56,
                  itemsSpacing: 0,
                  itemWidth: 100,
                  itemHeight: 18,
                  itemTextColor: "#999",
                  itemDirection: "left-to-right",
                  itemOpacity: 1,
                  symbolSize: 18,
                  symbolShape: "circle",
                  effects: [
                    {
                      on: "hover",
                      style: {
                        itemTextColor: "#000",
                      },
                    },
                  ],
                },
              ]}
            />
          </div>
        );

      default:
        return (
          <Empty
            description="Select a chart type"
            className={styles.emptyChart}
          />
        );
    }
  };

  return (
    <MainLayout>
      <div className={styles.predictionPage}>
        <PageHeader
          title="Prediction Analytics"
          subtitle="Analyze historical data and predict future demand"
          action={
            selectedItemId
              ? {
                  text: "Export Data",
                  onClick: handleExportData,
                  type: "default",
                }
              : undefined
          }
        />

        <Row gutter={[24, 24]}>
          {/* Left Column: Filters and Item Selection */}
          <Col xs={24} md={8} lg={6}>
            <Card title="Filters" className={styles.filterCard}>
              <div className={styles.filter}>
                <label>Date Range</label>
                <RangePicker
                  value={[dateRange[0], dateRange[1]]}
                  onChange={handleDateRangeChange}
                  className={styles.datePicker}
                />
              </div>

              <div className={styles.filter}>
                <label>Category</label>
                <Select
                  placeholder="Select a category"
                  onChange={handleCategoryChange}
                  value={selectedCategory}
                  className={styles.select}
                >
                  {categories.map((category) => (
                    <Option key={category} value={category}>
                      {category}
                    </Option>
                  ))}
                </Select>
              </div>

              <div className={styles.filter}>
                <label>Chart Type</label>
                <div className={styles.chartButtons}>
                  <Button
                    type={chartType === "line" ? "primary" : "default"}
                    icon={<LineChartOutlined />}
                    onClick={() => handleChartTypeChange("line")}
                  >
                    Line
                  </Button>
                  <Button
                    type={chartType === "area" ? "primary" : "default"}
                    icon={<AreaChartOutlined />}
                    onClick={() => handleChartTypeChange("area")}
                  >
                    Area
                  </Button>
                  <Button
                    type={chartType === "bar" ? "primary" : "default"}
                    icon={<BarChartOutlined />}
                    onClick={() => handleChartTypeChange("bar")}
                  >
                    Bar
                  </Button>
                  <Button
                    type={chartType === "pie" ? "primary" : "default"}
                    icon={<PieChartOutlined />}
                    onClick={() => handleChartTypeChange("pie")}
                  >
                    Pie
                  </Button>
                </div>
              </div>
            </Card>

            <Card title="Items" className={styles.itemsCard}>
              {loading && !categoryItems.length ? (
                <div className={styles.spinContainer}>
                  <Spin />
                </div>
              ) : (
                <List
                  size="small"
                  dataSource={categoryItems}
                  renderItem={(item: any) => (
                    <List.Item
                      className={`${styles.itemListItem} ${
                        selectedItemId === item.itemId
                          ? styles.selectedItem
                          : ""
                      }`}
                      onClick={() => handleItemSelect(item.itemId)}
                    >
                      <div className={styles.itemInfo}>
                        <div className={styles.itemName}>{item.name}</div>
                        <div className={styles.itemMeta}>
                          <Tag color="blue">{item.category}</Tag>
                          <span>Stock: {item.quantity}</span>
                        </div>
                      </div>
                    </List.Item>
                  )}
                />
              )}
            </Card>
          </Col>

          {/* Right Column: Chart and Analysis */}
          <Col xs={24} md={16} lg={18}>
            <Tabs defaultActiveKey="prediction" className={styles.tabs}>
              <TabPane
                tab={
                  <span>
                    <LineChartOutlined /> Prediction
                  </span>
                }
                key="prediction"
              >
                <Card className={styles.chartCard}>
                  {loading && selectedItemId ? (
                    <div className={styles.spinContainer}>
                      <Spin size="large" />
                    </div>
                  ) : (
                    <>
                      <div className={styles.chartHeader}>
                        {selectedPrediction && (
                          <Title level={4}>
                            {selectedPrediction.name} - Demand Forecast
                          </Title>
                        )}
                      </div>

                      {renderChart()}
                    </>
                  )}
                </Card>

                {selectedPrediction && (
                  <Card
                    title="Forecast Analysis"
                    className={styles.analysisCard}
                  >
                    <Row gutter={16}>
                      <Col span={8}>
                        <Statistic
                          title="Average Demand"
                          value={
                            selectedPrediction.forecast.reduce(
                              (a: number, b: any) => a + b.value,
                              0
                            ) / selectedPrediction.forecast.length
                          }
                          precision={2}
                          suffix="units/day"
                        />
                      </Col>
                      <Col span={8}>
                        <Statistic
                          title="Forecasted Peak"
                          value={Math.max(
                            ...selectedPrediction.forecast.map(
                              (p: any) => p.value
                            )
                          )}
                          suffix="units"
                        />
                      </Col>
                      <Col span={8}>
                        <Statistic
                          title="Trend"
                          value={
                            selectedPrediction.forecast[
                              selectedPrediction.forecast.length - 1
                            ].value > selectedPrediction.forecast[0].value
                              ? "↑"
                              : "↓"
                          }
                          valueStyle={{
                            color:
                              selectedPrediction.forecast[
                                selectedPrediction.forecast.length - 1
                              ].value > selectedPrediction.forecast[0].value
                                ? "#3f8600"
                                : "#cf1322",
                          }}
                        />
                      </Col>
                    </Row>

                    <Alert
                      message="Recommendation"
                      description={selectedPrediction.recommendation}
                      type="info"
                      showIcon
                      className={styles.recommendation}
                    />
                  </Card>
                )}
              </TabPane>

              <TabPane
                tab={
                  <span>
                    <BarChartOutlined /> Overall Analysis
                  </span>
                }
                key="analysis"
              >
                <Card className={styles.overallCard}>
                  <Title level={4}>Overall Inventory Health</Title>

                  {stats && (
                    <>
                      <Row gutter={16} className={styles.statsRow}>
                        <Col span={6}>
                          <Statistic
                            title="Total Items"
                            value={stats.totalItems}
                          />
                        </Col>
                        <Col span={6}>
                          <Statistic
                            title="Categories"
                            value={stats.categoriesCount}
                          />
                        </Col>
                        <Col span={6}>
                          <Statistic
                            title="Avg Turnover Rate"
                            value={stats.avgTurnoverRate}
                            precision={2}
                            suffix="%"
                          />
                        </Col>
                        <Col span={6}>
                          <Statistic
                            title="Waste Rate"
                            value={stats.wasteRate}
                            precision={2}
                            suffix="%"
                            valueStyle={{
                              color:
                                stats.wasteRate > 5 ? "#cf1322" : "#3f8600",
                            }}
                          />
                        </Col>
                      </Row>

                      <Title level={5} className={styles.recommendationsTitle}>
                        Top Recommendations
                      </Title>
                      <List
                        itemLayout="horizontal"
                        dataSource={recommendations.slice(0, 5)} // Show top 5 recommendations
                        renderItem={(item) => (
                          <List.Item>
                            <List.Item.Meta
                              title={item.title}
                              description={item.description}
                            />
                            <div className={styles.recommendationPriority}>
                              <Tag
                                color={
                                  item.priority === "high"
                                    ? "red"
                                    : item.priority === "medium"
                                    ? "orange"
                                    : "green"
                                }
                              >
                                {item.priority.toUpperCase()}
                              </Tag>
                            </div>
                          </List.Item>
                        )}
                      />

                      <div className={styles.exportSection}>
                        <Button
                          type="default"
                          icon={<FileExcelOutlined />}
                          onClick={() => {
                            // Mock export functionality
                            message.success("Analysis report exported");
                          }}
                        >
                          Export Analysis Report
                        </Button>
                      </div>
                    </>
                  )}
                </Card>
              </TabPane>
            </Tabs>
          </Col>
        </Row>
      </div>
    </MainLayout>
  );
}
