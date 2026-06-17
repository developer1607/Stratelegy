import React from "react";
import { Button } from "@/components/ui/button";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("[ErrorBoundary]", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[50vh] flex items-center justify-center p-8">
          <div className="max-w-md text-center space-y-4">
            <h1 className="text-xl font-semibold text-gray-900">Page error</h1>
            <p className="text-sm text-gray-600">
              Refresh the page or return to the dashboard.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <Button type="button" onClick={() => window.location.reload()}>
                Refresh
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  window.location.href = "/";
                }}
              >
                Dashboard
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
