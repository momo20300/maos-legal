import { Badge } from "@/components/ui/badge";

interface JurisdictionBadgeProps {
  jurisdiction: string;
  className?: string;
}

export function JurisdictionBadge({ jurisdiction, className = "" }: JurisdictionBadgeProps) {
  const getBadgeColors = () => {
    switch (jurisdiction) {
      case "EU":
        return "bg-[#033993] text-[#FFCC00] hover:bg-[#033993]/90 border-[#033993]"; // EU Flag colors
      case "US":
        return "bg-[#B31942] text-white hover:bg-[#B31942]/90 border-[#B31942]"; // US Red
      case "Arabic":
        return "bg-[#007A3D] text-white hover:bg-[#007A3D]/90 border-[#007A3D]"; // Generic Arabic Green
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <Badge 
      variant="outline" 
      className={`font-medium ${getBadgeColors()} ${className}`}
      data-testid={`badge-jurisdiction-${jurisdiction.toLowerCase()}`}
    >
      {jurisdiction}
    </Badge>
  );
}