import 'package:amazon_clone/constants/global_variables.dart';
import 'package:amazon_clone/features/admin/models/sales.dart';
import 'package:amazon_clone/features/admin/widgets/bar_titles.dart';
import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';

class CategoryProductsCharts extends StatefulWidget {
  final List<Sales> sales;

  const CategoryProductsCharts({super.key, required this.sales});

  @override
  State<CategoryProductsCharts> createState() => _CategoryProductsChartsState();
}

class _CategoryProductsChartsState extends State<CategoryProductsCharts> {
  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(
        top: 40,
        right: 4,
        bottom: 4,
        left: 4,
      ),
      child: AspectRatio(
        aspectRatio: 1,
        child: BarChart(
          BarChartData(
            borderData: FlBorderData(
              border: const Border(
                top: BorderSide.none,
                right: BorderSide.none,
                left: BorderSide(width: 1),
                bottom: BorderSide(width: 1),
              ),
            ),
            groupsSpace: 10,
            barGroups: List.generate(
              GlobalVariables.carouselImages.length,
              (index) => BarChartGroupData(
                x: index,
                barRods: [
                  BarChartRodData(
                    toY: widget.sales[index].earning,
                    color: const Color.fromARGB(198, 74, 78, 74),
                    width: 10,
                    borderRadius: BorderRadius.circular(10),
                    backDrawRodData: BackgroundBarChartRodData(
                      show: true,
                      color: Colors.grey,
                    ),
                  ),
                ],
              ),
            ),
            barTouchData: BarTouchData(
              touchTooltipData: BarTouchTooltipData(
                  tooltipBgColor: Colors.grey.withOpacity(0.8),
                  getTooltipItem: (group, groupIndex, rod, rodIndex) {
                    String value = rod.toY.toString();
                    return BarTooltipItem(
                      value,
                      const TextStyle(color: Colors.red),
                    );
                  }),
            ),
            titlesData: const FlTitlesData(
              bottomTitles: AxisTitles(
                sideTitles: SideTitles(
                  getTitlesWidget: barTitles,
                  showTitles: true,
                  reservedSize: 38,
                ),
              ),
              topTitles: AxisTitles(
                sideTitles: SideTitles(showTitles: false),
              ),
            ),
            gridData: const FlGridData(
              drawHorizontalLine: true,
              drawVerticalLine: false,
            ),
          ),
        ),
      ),
    );
  }
}
