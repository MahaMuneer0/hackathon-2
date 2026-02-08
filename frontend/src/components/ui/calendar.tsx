import React from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addDays } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import clsx from 'clsx';

interface CalendarProps {
  mode?: 'single' | 'multiple' | 'range';
  selected?: Date | Date[];
  onSelect?: (date: Date) => void;
  initialFocus?: boolean;
  className?: string;
}

const Calendar: React.FC<CalendarProps> = ({
  mode = 'single',
  selected,
  onSelect,
  initialFocus,
  className
}) => {
  const [currentMonth, setCurrentMonth] = React.useState<Date>(() => {
    if (Array.isArray(selected) && selected.length > 0) {
      return selected[0];
    }
    return selected instanceof Date ? selected : new Date();
  });

  const daysInMonth = eachDayOfInterval({
    start: startOfWeek(startOfMonth(currentMonth)),
    end: endOfWeek(endOfMonth(currentMonth))
  });

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  // const handleDayClick = (day: Date) => {
  //   if (onSelect) {
  //     onSelect(day);
  //   }
  // };
  const handleDayClick = (day: Date) => {
  if (!isSameMonth(day, currentMonth)) return;
  onSelect?.(day);
};


  const isSelected = (day: Date) => {
    if (!selected) return false;

    if (Array.isArray(selected)) {
      return selected.some(d => isSameDay(d, day));
    }

    return isSameDay(selected, day);
  };

  return (
    <div className={clsx("p-3 rounded-md border bg-white", className)}>
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          className="p-1 rounded-full hover:bg-gray-100"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <h3 className="text-sm font-medium">
          {format(currentMonth, 'MMMM yyyy')}
        </h3>

        <button
          onClick={nextMonth}
          className="p-1 rounded-full hover:bg-gray-100"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
          <div
            key={day}
            className="text-center text-xs font-medium text-gray-500 py-1"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {daysInMonth.map(day => (
          <button
            key={format(day, "yyyy-MM-dd")}
            onClick={() => handleDayClick(day)}
            disabled={!isSameMonth(day, currentMonth)}
            className={clsx(
              "h-8 w-8 rounded-full text-sm flex items-center justify-center",
              {
                "bg-blue-500 text-white": isSelected(day),
                "text-gray-900": isSameMonth(day, currentMonth) && !isSelected(day),
                "text-gray-400": !isSameMonth(day, currentMonth),
                "hover:bg-gray-100": isSameMonth(day, currentMonth) && !isSelected(day),
                "opacity-50 cursor-not-allowed": !isSameMonth(day, currentMonth)
              }
            )}
          >
            {format(day, 'd')}
          </button>
        ))}
      </div>
    </div>
  );
};

export { Calendar };