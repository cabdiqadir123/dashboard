import { useMemo } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface AvailableTimeSelectProps {
  value: string;
  onChange: (value: string) => void;
}

const AvailableTimeSelect: React.FC<AvailableTimeSelectProps> = ({
  value,
  onChange,
}) => {
  const allTimes = [
    "6am - 7am",
    "7am - 8am",
    "8am - 9am",
    "9am - 10am",
    "10am - 11am",
    "11am - 12pm",
    "12pm - 1pm",
    "1pm - 2pm",
    "2pm - 3pm",
    "3pm - 4pm",
    "4pm - 5pm",
  ];

  const availableTimes = useMemo(() => {
    const now = new Date();

    return allTimes.filter((time) => {
      const [start] = time.split(" - ");
      let hour = parseInt(start.replace(/am|pm/, ""));
      const isPM = start.includes("pm");
      if (isPM && hour !== 12) hour += 12;
      if (!isPM && hour === 12) hour = 0;

      const slotStart = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        hour,
        0,
        0
      );

      return slotStart >= now; // only future times
    });
  }, []);

  return (
    <div className="space-y-2">
      <Label htmlFor="available-time">Available Time</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select time" />
        </SelectTrigger>
        <SelectContent>
          {availableTimes.map((time) => (
            <SelectItem key={time} value={time}>
              {time}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default AvailableTimeSelect;