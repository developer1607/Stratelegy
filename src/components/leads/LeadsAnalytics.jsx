import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

function ConversionFunnel({ data }) {
  const maxValue = Math.max(...data.map((item) => item.value), 1);

  return (
    <div className="flex h-[250px] flex-col justify-center gap-2 py-2">
      {data.map((item) => {
        const widthPct =
          item.value === 0 ? 12 : Math.max(18, (item.value / maxValue) * 100);

        return (
          <div key={item.name} className="flex items-center gap-3">
            <div className="flex min-h-[44px] flex-1 items-center justify-center">
              <div
                className="flex h-10 items-center justify-center rounded-sm text-sm font-semibold text-white shadow-sm"
                style={{
                  width: `${widthPct}%`,
                  backgroundColor: item.fill,
                  minWidth: item.value > 0 ? "3rem" : "2.5rem",
                }}
                title={`${item.name}: ${item.value}`}
              >
                {item.value}
              </div>
            </div>
            <span className="w-24 shrink-0 text-sm text-gray-700">{item.name}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function LeadsAnalytics({ leads }) {
  // Pipeline value by stage
  const pipelineData = React.useMemo(() => {
    const stages = ["new", "contacted", "qualified", "won", "lost"];
    return stages.map((stage) => ({
      stage: stage.charAt(0).toUpperCase() + stage.slice(1),
      value: leads
        .filter((l) => l.status === stage)
        .reduce((sum, l) => sum + (l.value || 0), 0),
    }));
  }, [leads]);

  // Won vs Lost over time (simplified by creation date)
  const wonLostData = React.useMemo(() => {
    const grouped = {};
    leads.forEach((lead) => {
      if (lead.status === "won" || lead.status === "lost") {
        const month = new Date(lead.created_date).toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        });
        if (!grouped[month]) grouped[month] = { month, won: 0, lost: 0 };
        grouped[month][lead.status]++;
      }
    });
    return Object.values(grouped).slice(-6);
  }, [leads]);

  // Conversion funnel — cumulative counts (leads that reached each stage or beyond)
  const funnelData = React.useMemo(() => {
    const total = leads.length;
    const contactedCount = leads.filter((l) =>
      ["contacted", "qualified", "won"].includes(l.status),
    ).length;
    const qualifiedCount = leads.filter((l) =>
      ["qualified", "won"].includes(l.status),
    ).length;
    const wonCount = leads.filter((l) => l.status === "won").length;

    return [
      { name: "New Leads", value: total, fill: "#3b82f6" },
      { name: "Contacted", value: contactedCount, fill: "#8b5cf6" },
      { name: "Qualified", value: qualifiedCount, fill: "#10b981" },
      { name: "Won", value: wonCount, fill: "#22c55e" },
    ];
  }, [leads]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mt-6">
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">
            Pipeline Value by Stage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={pipelineData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="stage" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
              <Bar dataKey="value" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">
            Won vs Lost Over Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={wonLostData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="won" fill="#10b981" name="Won" />
              <Bar dataKey="lost" fill="#ef4444" name="Lost" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">
            Conversion Funnel
          </CardTitle>
        </CardHeader>
        <CardContent>
          {leads.length === 0 ? (
            <p className="flex h-[250px] items-center justify-center text-sm text-gray-500">
              No leads to display
            </p>
          ) : (
            <ConversionFunnel data={funnelData} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
