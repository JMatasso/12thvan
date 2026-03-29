"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Megaphone, Send, MessageSquare, Clock } from "lucide-react";
import { useAnnouncement, useCommsLog } from "@/lib/data-store";
import { useAuth } from "@/lib/auth-store";
import { formatDate, formatTime } from "@/lib/utils";

export default function CommsPage() {
  const { user } = useAuth();
  const { announcement, setAnnouncement } = useAnnouncement();
  const { log, addEntry } = useCommsLog();
  const [bannerText, setBannerText] = useState(announcement);
  const [smsMessage, setSmsMessage] = useState("");
  const [smsRecipient, setSmsRecipient] = useState("all_riders");

  function handleSetBanner() {
    setAnnouncement(bannerText);
    addEntry({
      id: `comm-${Date.now()}`,
      type: "announcement",
      recipients: "public",
      message: bannerText || "(cleared)",
      sent_at: new Date().toISOString(),
      sent_by: user?.name || "Admin",
    });
  }

  function handleClearBanner() {
    setBannerText("");
    setAnnouncement("");
    addEntry({
      id: `comm-${Date.now()}`,
      type: "announcement",
      recipients: "public",
      message: "(banner cleared)",
      sent_at: new Date().toISOString(),
      sent_by: user?.name || "Admin",
    });
  }

  async function handleSendSMS() {
    if (!smsMessage.trim()) return;

    addEntry({
      id: `comm-${Date.now()}`,
      type: "sms",
      recipients: smsRecipient,
      message: smsMessage,
      sent_at: new Date().toISOString(),
      sent_by: user?.name || "Admin",
    });

    // In production: call /api/notifications for each recipient
    try {
      await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: "broadcast", message: smsMessage }),
      });
    } catch {}

    setSmsMessage("");
    alert(`Message sent to ${smsRecipient === "all_riders" ? "all riders" : smsRecipient === "all_drivers" ? "all drivers" : smsRecipient}`);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Communications</h1>
      <p className="mt-1 text-sm text-muted-foreground">Announcements, bulk SMS, and notification history</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Announcement banner control */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Megaphone className="h-5 w-5 text-warning" />
              Public Announcement Banner
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              This banner appears on the booking page for all users.
            </p>
            <div className="flex flex-col gap-3">
              <textarea
                className="w-full rounded-xl border border-border bg-white p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-maroon/30"
                rows={3}
                placeholder="e.g., Rides running 20 min late due to traffic..."
                value={bannerText}
                onChange={(e) => setBannerText(e.target.value)}
              />
              <div className="flex gap-2">
                <Button onClick={handleSetBanner} className="flex-1">
                  <Megaphone className="h-4 w-4 mr-1" />
                  {announcement ? "Update Banner" : "Set Banner"}
                </Button>
                {announcement && (
                  <Button variant="secondary" onClick={handleClearBanner}>
                    Clear
                  </Button>
                )}
              </div>
              {announcement && (
                <div className="rounded-xl bg-warning/10 border border-warning/30 p-3 text-sm">
                  <p className="font-semibold text-warning">Currently Live:</p>
                  <p className="text-muted-foreground">{announcement}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Bulk SMS */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-maroon" />
              Send SMS Blast
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Send a text message to riders or drivers.
            </p>
            <div className="flex flex-col gap-3">
              <select
                className="h-11 w-full rounded-xl border border-border bg-white px-4 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-maroon/30"
                value={smsRecipient}
                onChange={(e) => setSmsRecipient(e.target.value)}
              >
                <option value="all_riders">All Riders (with bookings)</option>
                <option value="all_drivers">All Drivers</option>
                <option value="all">Everyone</option>
              </select>
              <textarea
                className="w-full rounded-xl border border-border bg-white p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-maroon/30"
                rows={3}
                placeholder="Your message..."
                value={smsMessage}
                onChange={(e) => setSmsMessage(e.target.value)}
              />
              <Button onClick={handleSendSMS} disabled={!smsMessage.trim()}>
                <Send className="h-4 w-4 mr-1" />
                Send SMS
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Communication log */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">Communication Log</CardTitle>
        </CardHeader>
        <CardContent>
          {log.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No messages sent yet</p>
          ) : (
            <div className="flex flex-col gap-2">
              {[...log].reverse().map((entry) => (
                <div key={entry.id} className="flex items-start gap-3 rounded-xl bg-muted/50 p-3">
                  <div className="mt-0.5">
                    {entry.type === "sms" ? (
                      <MessageSquare className="h-4 w-4 text-maroon" />
                    ) : (
                      <Megaphone className="h-4 w-4 text-warning" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant={entry.type === "sms" ? "default" : "warning"}>
                        {entry.type === "sms" ? "SMS" : "Banner"}
                      </Badge>
                      <span className="text-xs text-muted-foreground">→ {entry.recipients}</span>
                    </div>
                    <p className="mt-1 text-sm">{entry.message}</p>
                    <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {formatDate(entry.sent_at)} at {formatTime(entry.sent_at)} by {entry.sent_by}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
