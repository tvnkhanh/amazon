import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';

Widget barTitles(double value, TitleMeta meta) {
  const style = TextStyle(
    color: Colors.red,
    fontWeight: FontWeight.bold,
    fontSize: 14,
  );

  Widget text;
  switch (value.toInt()) {
    case 0:
      text = const Text('Mobiles', style: style);
      break;
    case 1:
      text = const Text('Esntl', style: style);
      break;
    case 2:
      text = const Text('Appls', style: style);
      break;
    case 3:
      text = const Text('Books', style: style);
      break;
    case 4:
      text = const Text('Fashion', style: style);
      break;
    default:
      text = const Text('default', style: style);
      break;
  }

  return SideTitleWidget(
    axisSide: meta.axisSide,
    space: 10,
    child: text,
  );
}
