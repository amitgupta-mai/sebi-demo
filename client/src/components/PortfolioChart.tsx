import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEffect, useRef } from "react";

export default function PortfolioChart() {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    // Dynamically import Chart.js to avoid SSR issues
    import('chart.js/auto').then((Chart) => {
      const ctx = chartRef.current;
      if (!ctx) return;

      // Destroy existing chart if it exists
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }

      chartInstanceRef.current = new Chart.default(ctx, {
        type: 'line',
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          datasets: [{
            label: 'Portfolio Value',
            data: [1100000, 1150000, 1080000, 1200000, 1180000, 1245680],
            borderColor: 'hsl(207, 90%, 54%)',
            backgroundColor: 'hsla(207, 90%, 54%, 0.1)',
            tension: 0.4,
            fill: true,
            pointBackgroundColor: 'hsl(207, 90%, 54%)',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 4,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              titleColor: '#fff',
              bodyColor: '#fff',
              borderColor: 'hsl(207, 90%, 54%)',
              borderWidth: 1,
              callbacks: {
                label: function(context) {
                  const value = context.parsed.y;
                  return `Portfolio Value: ₹${(value / 100000).toFixed(1)}L`;
                }
              }
            }
          },
          scales: {
            x: {
              grid: {
                display: false
              },
              border: {
                display: false
              }
            },
            y: {
              beginAtZero: false,
              grid: {
                color: 'rgba(0, 0, 0, 0.05)'
              },
              border: {
                display: false
              },
              ticks: {
                callback: function(value) {
                  return '₹' + (Number(value) / 100000).toFixed(1) + 'L';
                }
              }
            }
          },
          interaction: {
            intersect: false,
            mode: 'index'
          }
        }
      });
    });

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, []);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900">Portfolio Performance</CardTitle>
          <div className="flex space-x-2">
            <Button variant="secondary" size="sm" className="px-3 py-1 text-sm bg-blue-50 text-primary hover:bg-blue-100">
              1M
            </Button>
            <Button variant="ghost" size="sm" className="px-3 py-1 text-sm text-gray-600 hover:text-primary hover:bg-gray-50">
              3M
            </Button>
            <Button variant="ghost" size="sm" className="px-3 py-1 text-sm text-gray-600 hover:text-primary hover:bg-gray-50">
              1Y
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64 relative">
          <canvas ref={chartRef} className="absolute inset-0 w-full h-full"></canvas>
        </div>
      </CardContent>
    </Card>
  );
}
