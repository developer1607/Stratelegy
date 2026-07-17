import React from "react";
import UserManagement from "@/pages/UserManagement";

/** Portal users & permissions — embedded in Settings (not SkySwitch/PBX API users). */
export default function PortalUsersPanel() {
  return <UserManagement embedded />;
}
