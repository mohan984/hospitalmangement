import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeLabel?: string;
  icon: LucideIcon;
  iconColor: string;
  changeColor?: string;
}

export default function StatsCard({
  title,
  value,
  change,
  changeLabel,
  icon: Icon,
  iconColor,
  changeColor = "text-green-600",
}: StatsCardProps) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <Icon className={`h-6 w-6 ${iconColor}`} />
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">
                {title}
              </dt>
              <dd className="text-lg font-medium text-gray-900">
                {value}
              </dd>
            </dl>
          </div>
        </div>
      </CardContent>
      {(change || changeLabel) && (
        <div className="bg-gray-50 px-5 py-3">
          <div className="text-sm">
            {change && (
              <span className={`font-medium ${changeColor}`}>
                {change}
              </span>
            )}
            {changeLabel && (
              <span className="text-gray-500 ml-1">
                {changeLabel}
              </span>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}
