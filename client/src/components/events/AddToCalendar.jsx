import { Button } from "@/components/ui/button";
import { CalendarPlus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const AddToCalendar = ({ event }) => {
  const { title, description, venue, date, startTime, endTime } = event;

  // Helper to format dates for Google Calendar (YYYYMMDDTHHMMSSZ)
  const formatGoogleDate = (dateStr, timeStr) => {
    if (!dateStr || !timeStr) return "";
    const dt = new Date(`${dateStr}T${timeStr}`);
    return dt.toISOString().replace(/-|:|\.\d\d\d/g, "");
  };

  const googleUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&details=${encodeURIComponent(description || "")}&location=${encodeURIComponent(venue || "")}&dates=${formatGoogleDate(date, startTime)}/${formatGoogleDate(date, endTime)}`;

  const handleDownloadIcs = () => {
    // Basic iCal format structure
    const icsContent = `
BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
SUMMARY:${title}
DESCRIPTION:${description}
LOCATION:${venue}
DTSTART:${formatGoogleDate(date, startTime)}
DTEND:${formatGoogleDate(date, endTime)}
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${title}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          <CalendarPlus className="w-4 h-4" /> Add to Calendar
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => window.open(googleUrl, "_blank")}>
          Google Calendar
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleDownloadIcs}>
          Outlook / Apple (iCal)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default AddToCalendar;