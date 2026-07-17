import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Filter, Database, Mail } from "lucide-react";

const FILTER_REFERENCE = [
  {
    page: "Accounts",
    search: "Name",
    filters: [
      "Owner (from records)",
      "Industry (CRM config)",
      "Revenue range",
      "Tier (CRM config)",
    ],
  },
  {
    page: "Contacts",
    search: "Name, email, company, phone",
    filters: [
      "Role",
      "Priority",
      "Company size",
      "Source (CRM config)",
      "Engagement",
      "No activity 30+ days",
    ],
  },
  {
    page: "Leads",
    search: "Name, company, email",
    filters: [
      "Status (CRM lead stages)",
      "Source (CRM config)",
      "Min deal value",
      "Follow-up date",
    ],
  },
  {
    page: "Activities",
    search: "Description, related record, type",
    filters: [
      "Activity type (CRM config)",
      "Owner",
      "Date range (7 / 30 / 90 days)",
    ],
  },
  {
    page: "Support tickets",
    search: "Title, requester, #, assignee",
    filters: [
      "Status",
      "Priority",
      "Category",
      "Department",
      "Assignee",
      "Unassigned only",
    ],
  },
  {
    page: "CRM reports",
    search: "—",
    filters: ["Date range", "Owner", "Stage", "Status"],
  },
];

const CONFIG_LINKS = [
  {
    key: "Contact Sources",
    usedBy: "Contacts filters, Leads source filter, contact forms",
  },
  { key: "Lead Stages", usedBy: "Leads status filter and pipeline defaults" },
  { key: "Activity Types", usedBy: "Activities filter and quick-log buttons" },
  { key: "Account Tiers", usedBy: "Accounts tier filter and defaults" },
  { key: "Industries", usedBy: "Accounts industry filter and account forms" },
  {
    key: "Defaults",
    usedBy: "New record defaults, dashboard targets, calendar",
  },
];

export default function PortalReferencePanel() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            CRM configuration map
          </CardTitle>
          <CardDescription>
            Lists under <strong>CRM Configuration</strong> drive dropdowns,
            defaults, and list filters across the portal. Keep names consistent
            — filters match stored values case-insensitively.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {CONFIG_LINKS.map((row) => (
              <div
                key={row.key}
                className="flex flex-col sm:flex-row sm:items-center gap-2 border-b pb-3 last:border-0"
              >
                <Badge variant="outline" className="shrink-0">
                  {row.key}
                </Badge>
                <span className="text-sm text-gray-600">{row.usedBy}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            List filters reference
          </CardTitle>
          <CardDescription>
            Search boxes filter client-side on the current page data. Sidebar /
            toolbar filters apply immediately — no separate Apply button.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-gray-500">
                  <th className="pb-2 pr-4 font-medium">Page</th>
                  <th className="pb-2 pr-4 font-medium">Search</th>
                  <th className="pb-2 font-medium">Filters</th>
                </tr>
              </thead>
              <tbody>
                {FILTER_REFERENCE.map((row) => (
                  <tr
                    key={row.page}
                    className="border-b last:border-0 align-top"
                  >
                    <td className="py-3 pr-4 font-medium text-gray-900">
                      {row.page}
                    </td>
                    <td className="py-3 pr-4 text-gray-600">{row.search}</td>
                    <td className="py-3 text-gray-600">
                      <ul className="list-disc pl-4 space-y-0.5">
                        {row.filters.map((f) => (
                          <li key={f}>{f}</li>
                        ))}
                      </ul>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Email &amp; auth
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-gray-600 space-y-2">
          <p>
            Portal invites, welcome emails, ticket notifications, and optional
            email MFA use the templates on the <strong>Email</strong> tab. MFA
            codes go to the user&apos;s account email only.
          </p>
          <p>
            Import templates (Contacts, Accounts, Leads CSV) and export actions
            live under the
            <strong> Data</strong> tab.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
