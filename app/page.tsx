"use client";
import { PlusCircle, User, Moon, Droplet, Monitor, CircleHelp,Calendar, Clock, Bell, Menu } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// interfaces
interface FormInputProps  {
  label: string;
  name: string;
  placeholder?: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  required?: boolean;
  className?: string;
  textarea?: boolean;
  disabled?: boolean;
};
interface StatProps {
  type: string;
  value: number | string;
  unit?: string;
};
const iconMap: Record<string, React.ReactNode> = {
  Sleep: <Moon className="w-10 h-10 fill-current text-white" />,
  Water: <Droplet className="w-10 h-10 fill-current text-white" />,
  'Screen Time': <Monitor className="w-10 h-10 fill-current text-white" />,
};
interface DateTimeSelectorProps  {
  value: string; // format: "YYYY-MM-DD HH:mm"
  onChange: (value: string) => void;
};
interface StreakBubbleProps {
  value: number;
  label: string;
  bgColor: string;
};
interface DayBoxProps  {
  day: number;
  completed: boolean;
  highlighted?: boolean;
};
interface Goal {
  id: string;
  title: string;
  description: string;
  deadline: string;
  completed: boolean;
}
interface GoalItemProps {
  goal: Goal;
  onComplete: (id: string) => void;
  onEdit: (goal: Goal) => void;
  onDelete: (id: string) => void;
}
interface GoalListProps {
  goals: Goal[];
  onComplete: (id: string) => void;
  onEdit: (goal: Goal) => void;
  onDelete: (id: string) => void;
}
type Weekday = "Mon" | "Tues" | "Wed" | "Thurs" | "Fri" | "Sat" | "Sun";
type AvailableDay = 'Mon' | 'Tues' | 'Wed';
const selectableDays: AvailableDay[] = ["Mon", "Tues", "Wed"];
type CheckInEntry = {
  date: string; // e.g. "2025-05-06"
  water: number;
  sleep: number;
  screenTime: number;
};

const dummyDataByDay: Record<AvailableDay, {
  stats: {
    sleep: number,
    water: number,
    screenTime: number
  },
  checkInHistory: CheckInEntry[],
  goals: Goal[]
}> = {
  'Mon': {
    stats: {
      sleep: 6,
      water: 7,
      screenTime: 6
    },
    checkInHistory: [
      { date: '2025-04-28', sleep: 5, water: 6, screenTime: 5 },
      { date: '2025-04-29', sleep: 6, water: 5, screenTime: 4 },
      { date: '2025-04-30', sleep: 7, water: 8, screenTime: 3 },
      { date: '2025-05-01', sleep: 6, water: 7, screenTime: 2 },
      { date: '2025-05-02', sleep: 5, water: 6, screenTime: 5 },
      { date: '2025-05-03', sleep: 4, water: 5, screenTime: 7 },
      { date: '2025-05-04', sleep: 2, water: 3, screenTime: 8 },
    ],
    goals: [
      { id: '1', title: 'Drink 2L Water', description: 'Stay hydrated', deadline: '2025-05-30', completed: false },
      { id: '2', title: 'Sleep 8 Hours', description: 'Improve sleep quality', deadline: '2025-05-20', completed: true },
    ]
  },
  'Tues': {
    stats: {
      sleep: 7,
      water: 8,
      screenTime: 5
    },
    checkInHistory: [
      { date: '2025-04-29', sleep: 6, water: 7, screenTime: 3 },
      { date: '2025-04-30', sleep: 7, water: 6, screenTime: 2 },
      { date: '2025-05-01', sleep: 8, water: 7, screenTime: 4 },
      { date: '2025-05-02', sleep: 7, water: 8, screenTime: 3 },
      { date: '2025-05-03', sleep: 6, water: 7, screenTime: 2 },
      { date: '2025-05-04', sleep: 5, water: 6, screenTime: 1 },
      { date: '2025-05-05', sleep: 6, water: 8, screenTime: 6 },
    ],
    goals: [
      { id: '1', title: 'Drink 2.5L Water', description: 'Increase hydration', deadline: '2025-05-25', completed: true },
      { id: '2', title: 'Learn React', description: 'Complete online course', deadline: '2025-06-01', completed: false }
    ]
  },
  'Wed': {
    stats: {
      sleep: 8,
      water: 6,
      screenTime: 4
    },
    checkInHistory: [
      { date: '2025-04-30', sleep: 7, water: 5, screenTime: 3 },
      { date: '2025-05-01', sleep: 8, water: 6, screenTime: 4 },
      { date: '2025-05-02', sleep: 7, water: 7, screenTime: 3 },
      { date: '2025-05-03', sleep: 8, water: 6, screenTime: 2 },
      { date: '2025-05-04', sleep: 7, water: 5, screenTime: 3 },
      { date: '2025-05-05', sleep: 8, water: 6, screenTime: 4 },
      { date: '2025-05-06', sleep: 7, water: 6, screenTime: 5 },
    ],
    goals: [
      { id: '1', title: 'Meditate Daily', description: '15 minutes each morning', deadline: '2025-05-20', completed: false },
      { id: '2', title: 'Complete Project', description: 'Finish React dashboard', deadline: '2025-05-10', completed: false }
    ]
  }
};


function HabitTrackerNavbar() {
  const [isOpen, setIsOpen] = useState(false);

  const NavItem = ({
    icon,
    label,
    active = false,
    onClick,
  }: {
    icon: React.ReactNode;
    label: string;
    active?: boolean;
    onClick?: () => void;
  }) => (
    <div
      onClick={onClick}
      className={`flex items-center space-x-1 cursor-pointer ${
        active ? "text-[#83A2DB]" : "text-gray-300 hover:text-white"
      }`}
    >
      {icon}
      <span className="font-medium">{label}</span>
    </div>
  );

  return (
    <nav className="w-full bg-gray-900 text-white sticky top-0 z-50 shadow-md">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-2">
          <span className="text-xl font-bold text-[#83A2DB]">HabitSync</span>
        </div>

        <div className="hidden md:flex items-center space-x-6">
          <NavItem icon={<Bell size={18} />} label="Notifications" active />
          <NavItem icon={<PlusCircle size={18} />} label="Set Goal" />
          <NavItem icon={<User size={18} />} label="Profile" />
        </div>

        <div className="md:hidden">
          <button onClick={() => setIsOpen(!isOpen)}>
            <Menu size={24} />
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="flex flex-col space-y-4 px-6 pb-4 md:hidden">
          <NavItem icon={<Bell size={18} />} label="Notifications" active />
          <NavItem icon={<PlusCircle size={18} />} label="Set Goal" />
          <NavItem icon={<User size={18} />} label="Profile" />
        </div>
      )}
    </nav>
  );
}

function HabitTrackerFooter() {
  return (
    <footer className="w-full bg-gray-900 text-white py-4 px-6 mt-8">
      <div className="flex flex-col md:flex-row items-center justify-between text-sm text-gray-400">
        <span>&copy; {new Date().getFullYear()} HabitSync. All rights reserved.</span>
        <div className="flex space-x-4 mt-2 md:mt-0">
          <a href="#" className="hover:text-white transition">Privacy Policy</a>
          <a href="#" className="hover:text-white transition">Terms of Service</a>
          <a href="#" className="hover:text-white transition">Contact</a>
        </div>
      </div>
    </footer>
  );
}

const DaySelector = ({
  selectedDay,
  onSelect,
}: {
  selectedDay: Weekday;
  onSelect: (day: Weekday) => void;
}) => {
  const days: Weekday[] = ["Mon", "Tues", "Wed", "Thurs", "Fri", "Sat", "Sun"];

  // Helper to check if a day is selectable
  const isSelectable = (day: Weekday): boolean =>
    (selectableDays as string[]).includes(day);

  return (
    <div className="flex justify-center p-4">
      <div className="flex rounded-full bg-[#F2F2F2] p-1">
        {days.map((day) => (
          <FormButton
            key={day}
            label={day}
            onClick={() => {
              if (isSelectable(day)) onSelect(day);
            }}
            className={`px-6 py-2 text-sm font-medium transition-all duration-200 ${
              selectedDay === day
                ? "bg-black text-white rounded-l-4xl rounded-r-4xl"
                : "bg-transparent text-gray-600 hover:bg-gray-200 rounded-l-3xl rounded-r-3xl"
            } ${!isSelectable(day) ? "opacity-50 cursor-not-allowed" : ""}`}
          />
        ))}
      </div>
    </div>
  );
};

const StatCard = ({stat}:{stat:StatProps}) => {
  const icon = iconMap[stat.type] ?? <CircleHelp className="text-gray-400" />;
  return (
    <div className="flex items-center py-2 px-3 bg-transparent rounded-xl border-2 border-[#c3c2c2] w-full md:w-1/3 lg:w-1/3 ">
      <div className=" bg-[#6193ED] p-2 rounded-sm ">{icon}</div>
      <div className="ml-4">
        <h3 className="text-lg font-semibold text-[#7D7D7D] whitespace-nowrap">{stat.type}</h3>
        <p className="text-sm text-black">
          {stat.value} {stat.unit}
        </p>
      </div>
    </div>
  )
}

const SliderComponent = ({
    onSleepChange,
    onWaterChange,
    onScreenTimeChange,
  }: {
    onSleepChange: (value: number) => void;
    onWaterChange: (value: number) => void;
    onScreenTimeChange: (value: number) => void;
  }) => {
    const [sleepHours, setSleepHours] = useState(7);
    const [waterIntake, setWaterIntake] = useState(2);
    const [screenTime, setScreenTime] = useState(4);

    const handleSleepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = parseFloat(e.target.value);
      setSleepHours(value);
      onSleepChange(value);
    };

    const handleWaterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = parseFloat(e.target.value);
      setWaterIntake(value);
      onWaterChange(value);
    };

    const handleScreenTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = parseFloat(e.target.value);
      setScreenTime(value);
      onScreenTimeChange(value);
    };

    return (
      <div className="flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Sleep Hours: {sleepHours} hours
          </label>
          <input
            type="range"
            min="0"
            max="24"
            step="0.5"
            value={sleepHours}
            onChange={handleSleepChange}
            className="w-full mt-2 accent-[#465775]"
          />
        </div>

        {/* Water Intake Slider */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Water Intake: {waterIntake} glasses
          </label>
          <input
            type="range"
            min="0"
            max="10"
            step="1"
            value={waterIntake}
            onChange={handleWaterChange}
            className="w-full mt-2 accent-[#465775]"
          />
        </div>

        {/* Screen Time Slider */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Screen Time: {screenTime} hours
          </label>
          <input
            type="range"
            min="0"
            max="12"
            step="0.5"
            value={screenTime}
            onChange={handleScreenTimeChange}
            className="w-full mt-2 accent-[#465775] "
          />
        </div>
      </div>
    );
};

const GoalItem = ({ goal, onComplete, onEdit, onDelete }: GoalItemProps) => {
  return (
    <div className="bg-[#83A2DB] text-white px-4 py-3 rounded-lg flex justify-between items-center shadow-sm">
      <div className="flex flex-col">
        <h3
          className={`text-md font-medium ${
            goal.completed ? "line-through opacity-60" : ""
          }`}
        >
          {goal.title} 
        </h3>
        <p className="text-xs opacity-80">
          Deadline: {goal.deadline}
        </p>
      </div>
      <div className="flex gap-3">
        {!goal.completed ? (
            <>
              <FormButton
                label="Mark as completed ✓"
                onClick={() => onComplete(goal.id)}
                className="bg-[#71E871] text-white shadow-md "
              />
              <FormButton
                label="Edit ✎"
                onClick={() => onEdit(goal)}
                className="bg-[#465775]/80 text-white shadow-md "
              />
            </>
          ) : (
            <FormButton
              label="Delete 🗑 "
              onClick={() => onDelete(goal.id)}
              className="bg-[#FF0000]/60 text-white shadow-md"
            />
          )}
      </div>
    </div>
  );
};

const GoalList = ({ goals, onComplete, onEdit,onDelete }: GoalListProps) => {
 
  return (
    <div className="flex flex-col gap-4">
      {goals.length === 0 ? (
        <p className="text-gray-500 py-11">Manage your day efficiently by setting your goals.</p>
      ) : (
        goals.map((goal) => (
          <GoalItem
            key={goal.id}
            goal={goal}
            onComplete={onComplete}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))
      )}
    </div>
  );
};

const StreakBubble = ({ value, label, bgColor }: StreakBubbleProps) => (
  <div className="flex flex-col items-center gap-1">
    <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white text-3xl font-semibold ${bgColor}`}>
      {value}
    </div>
    <span className="text-sm text-black font-medium">{label}</span>
  </div>
);

const DayBox = ({ day, completed, highlighted }: DayBoxProps) => (
  <div
    className={`w-12 h-10 flex flex-col items-center justify-center rounded-md text-sm font-medium text-black ${
      highlighted ? "bg-[#465775] text-white" : "bg-[#83A2DB]/50"
    }`}
  >
    <span>{day}</span>
    {completed && (
      <span className=" w-2 h-2 rounded-full bg-[#00ff00] " />
    )}
  </div>
);

const StreakTracker = () => {
  const currentStreak = 14;
  const bestStreak = 21;

  const recentDays = [
    { day: 1, completed: true },
    { day: 2, completed: true },
    { day: 3, completed: true },
    { day: 4, completed: true },
    { day: 5, completed: true },
    { day: 6, completed: true },
    { day: 7, completed: false, highlighted: true },
  ];

  return (
    <div className="w-full">
      <div className="flex justify-center gap-12 mb-3">
        <StreakBubble value={currentStreak} label="Current Streak" bgColor="bg-black" />
        <StreakBubble value={bestStreak} label="Best Streak" bgColor="bg-[#83A2DB]" />
      </div>
      <div className="flex justify-between mb-3 px-2">
        {recentDays.map((d, idx) => (
          <div key={idx} className="relative">
            <DayBox day={d.day} completed={d.completed} highlighted={d.highlighted} />
          </div>
        ))}
      </div>
      <p className="text-center text-sm text-gray-700 font-medium">
        Amazing commitment! You have built a life-changing habit.
      </p>
    </div>
  );
};

const FormInput = ({
  label,
  name,
  placeholder = "",
  type = "text",
  value,
  onChange,
  required = false,
  className = "",
  textarea = false, // ✅ NEW PROP
  disabled = false, 
}: FormInputProps) => {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <label htmlFor={name} className="text-sm font-medium text-black">
        {label}
      </label>

      {textarea ? (
        <textarea
          id={name}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
          className="w-auto px-4 py-2 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 mb-4 h-20 resize-none"
        />
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
          className="w-auto px-4 py-2 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 mb-4"
        />
      )}
    </div>
  );
};

const DateTimeSelector = ({ value, onChange }: DateTimeSelectorProps) => {
  const [date, time] = value.split(" ");
  const dateInputRef = useRef<HTMLInputElement>(null);
  const timeInputRef = useRef<HTMLInputElement>(null);

  const handleDateChange = (newDate: string) => {
    onChange(`${newDate} ${time || "00:00"}`);
  };

  const handleTimeChange = (newTime: string) => {
    onChange(`${date || ""} ${newTime}`);
  };

  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-black">Deadline</label>
      <div className="flex gap-4">
        {/* Date Picker */}
        <div className="relative w-full">
          <span
            className="absolute left-3 top-1/2 -translate-y-1/2 text-black cursor-pointer"
            onClick={() => dateInputRef.current?.showPicker?.()}
          >
            <Calendar size={18} />
          </span>
          <input
            ref={dateInputRef}
            type="date"
            value={date || ""}
            onChange={(e) => handleDateChange(e.target.value)}
            className="w-full pl-10 pr-2 py-2 rounded-md border border-gray-300 bg-gray-100 text-sm text-[#a6a5a5] [&::-webkit-calendar-picker-indicator]:appearance-none [&::-webkit-calendar-picker-indicator]:hidden"
          />
        </div>

        {/* Time Picker */}
        <div className="relative w-full">
          <span
            className="absolute left-3 top-1/2 -translate-y-1/2 text-black cursor-pointer"
            onClick={() => timeInputRef.current?.showPicker?.()}
          >
            <Clock size={18} />
          </span>
          <input
            ref={timeInputRef}
            type="time"
            value={time || "00:00"}
            onChange={(e) => handleTimeChange(e.target.value)}
            className="w-full pl-10 pr-3 py-2 rounded-md border border-gray-300 bg-gray-100 text-sm text-[#a6a5a5] [&::-webkit-calendar-picker-indicator]:appearance-none [&::-webkit-calendar-picker-indicator]:hidden"
          />
        </div>
      </div>
    </div>
  );
}

const FormButton = ({label,onClick,className,disabled}: {label: string; onClick: () => void; className?: string; disabled?: boolean}) => {
  return (
    <button
			onClick={onClick}
			className={` rounded-md text-xs  p-2  ${className}`} disabled={disabled} >
			{label}
		</button>
  )
}

const MetricChart = ({
  metricKey,
  label,
  unit,
  gradientId,
  startColor,
  endColor,
  selectedDay
}: {
  metricKey: 'sleep' | 'water' | 'screenTime';
  label: string;
  unit: string;
  gradientId: string;
  startColor: string;
  endColor: string;
   selectedDay: AvailableDay; 
}) => {
  const getDayOfWeek = (date: string) => {
    const day = new Date(date);
    const options: Intl.DateTimeFormatOptions = { weekday: 'short' }; // Explicitly typed options
    return day.toLocaleDateString('en-US', options); // "Mon", "Tues", etc.
  };
  const filteredData = dummyDataByDay[selectedDay].checkInHistory.map((entry) => ({
    date: getDayOfWeek(entry.date), // Format the date as a day of the week
    value: entry[metricKey], // Value based on the selected metric (sleep, water, screenTime)
  }));

  // const history = dummyDataByDay[selectedDay].checkInHistory;
  // const selectedDate = new Date(); // We can use current date since we're using dummy data
  
  return (
    <div className="w-full h-full ">
      <ResponsiveContainer width="100%" height='100%'>
  
          <BarChart data={filteredData} margin={{ top: 10, right: 10, left: 30, bottom: 5 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={startColor} stopOpacity={1} />
                <stop offset="100%" stopColor={endColor} stopOpacity={1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis label={{ value: unit, angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Bar dataKey="value" fill={`url(#${gradientId})`} radius={[5, 5, 0, 0]} />
          </BarChart>
          {/* {data.every(d => d.value === 0) && (
            <div className="text-sm text-center text-gray-500 mt-2">
              No data yet. Complete a check-in to see your progress!
            </div>
          )} */}
        
      </ResponsiveContainer>
      
    </div>
  ); 
};




export default function Home() {
  //States
  const [formData, setFormData] = useState({
    goalTitle: '',
    goalDescription: '',
    deadline: '',
  });
  const [goals, setGoals] = useState<Goal[]>(dummyDataByDay['Wed'].goals);
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sleepHours, setSleepHours] = useState(dummyDataByDay['Wed'].stats.sleep);
  const [waterIntake, setWaterIntake] = useState(dummyDataByDay['Wed'].stats.water);
  const [screenTime, setScreenTime] = useState(dummyDataByDay['Wed'].stats.screenTime);
  const [checkInHistory, setCheckInHistory] = useState<CheckInEntry[]>(dummyDataByDay['Wed'].checkInHistory);
  const [selectedDay, setSelectedDay] = useState<AvailableDay>('Wed');
  const [selectedMetric, setSelectedMetric] = useState<'sleep' | 'water' | 'screenTime'>('sleep');

 
  const latestSleep = dummyDataByDay[selectedDay]?.stats.sleep ?? 0;
  const latestWater = dummyDataByDay[selectedDay]?.stats.water ?? 0;
  const latestScreenTime = dummyDataByDay[selectedDay]?.stats.screenTime ?? 0;
  const currentDay = 'Wed';
  const isGoalFormDisabled = selectedDay !== currentDay;

  useEffect(() => {
    console.log("Updated checkIns", checkInHistory);
  }, [checkInHistory]);

  //handler functions
  const handleCreateOrUpdateGoal = () => {
    if (!formData.goalTitle || !formData.deadline) return;

    if (editingGoalId) {
      // Update the existing goal
      setGoals(prevGoals =>
        prevGoals
          .map(goal =>
            goal.id === editingGoalId
              ? {
                  ...goal,
                  title: formData.goalTitle,
                  description: formData.goalDescription,
                  deadline: formData.deadline,
                }
              : goal
          )
          .sort(
            (a, b) =>
              new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
          )
      );
      setEditingGoalId(null);
    } else {
      // Create a new goal
      const newGoal: Goal = {
        id: Date.now().toString(),
        title: formData.goalTitle,
        description: formData.goalDescription,
        deadline: formData.deadline,
        completed: false,
      };

      setGoals(prevGoals =>
        [...prevGoals, newGoal].sort(
          (a, b) =>
            new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
        )
      );
    }

    // Reset the form
    setFormData({ goalTitle: "", goalDescription: "", deadline: "" });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleDeadlineChange = (value: string) => {
    setFormData({
      ...formData,
     deadline: value,
    });
  };
  
  const handleDaySelect = (day: Weekday) => {
    if (day === 'Mon' || day === 'Tues' || day === 'Wed') {
        setSelectedDay(day);
        setGoals(dummyDataByDay[day].goals);
        setCheckInHistory(dummyDataByDay[day].checkInHistory);
        setSleepHours(dummyDataByDay[day].stats.sleep);
        setWaterIntake(dummyDataByDay[day].stats.water);
        setScreenTime(dummyDataByDay[day].stats.screenTime);
    }
  };
  
  const handleCompleteGoal = (goalId: string) => {
    setGoals(prevGoals =>
      prevGoals.map(goal =>
        goal.id === goalId ? { ...goal, completed: true } : goal
      )
    );
  };

  const handleEditGoal = (goal: Goal) => {
    setFormData({
      goalTitle: goal.title,
      goalDescription: goal.description, 
      deadline: goal.deadline,
    });
    setEditingGoalId(goal.id); 
  };

  const handleDeleteGoal = (goalId: string) => {
    setGoals(prevGoals => prevGoals.filter(goal => goal.id !== goalId));
  };
  
  const handleCheckInClick = () => {
    setIsModalOpen(true);
  };

  const handleCheckInSubmit = () => {
    const todayDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    const newEntry: CheckInEntry = {
      date: todayDate,
      sleep: sleepHours,
      water: waterIntake,
      screenTime: screenTime,
    };
    // Replace existing entry for today or append
    setCheckInHistory(prev => {
      const filtered = prev.filter(e => e.date !== todayDate);
      return [...filtered, newEntry];
    });

    setIsModalOpen(false);
  };
  

  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden bg-gradient-to-b from-[#D9DCDB] to-[#83A2DB] ">
      <HabitTrackerNavbar />
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-5 py-3 text-lg gap-2">
        <div>
          <p className='text-black'>Hi Aishwarya,</p>
          <p className="text-base text-gray-600">Keep track of your daily goals!</p>
        </div>
        <div className="w-full sm:w-auto mt-2 sm:mt-0">
          <DaySelector selectedDay={selectedDay} onSelect={handleDaySelect} />
        </div>
      </div>
      <div className="px-3 md:px-6 lg:px-5">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-2">
          <div className="col-span-3 flex flex-col gap-2">
            {/* Personal Stats */}
            <div className="bg-[#FDF5FF]/50 backdrop-blur-lg rounded-xl px-5 py-4">
              <div className='flex items-center justify-between mb-2'>
                <h3 className="font-semibold text-lg text-black">Personal Stats</h3>
                <FormButton label="Daily Check-In" onClick={handleCheckInClick} className=" border-2 border-[#83A2DB] shadow-sm p-2 cursor-pointer text-black" />
                
              </div>

              <div className='flex items-center  gap-4 mb-2'>
                <StatCard stat={{type: "Sleep", value: latestSleep, unit: "hours"}} />
                <StatCard stat={{type: "Water", value: latestWater, unit: "glasses"}} />
                <StatCard stat={{type: "Screen Time", value: latestScreenTime, unit: "hours"}} />
              </div>
              {/* Weekly Report */}
              <div>
                <div className='flex items-center justify-between mb-2'>
                  <h3 className="font-semibold text-lg mb-2 text-black">Weekly Report</h3>
                  <div className="mb-4">
                    <select
                      value={selectedMetric}
                      onChange={(e) => setSelectedMetric(e.target.value as 'sleep' | 'water' | 'screenTime')}
                      className="bg-[#F2F2F2] rounded-lg p-2  w-full text-black"
                    >
                      <option value="sleep">Sleep</option>
                      <option value="water">Water Intake</option>
                      <option value="screenTime">Screen Time</option>
                    </select>
                  </div>
                </div>
                <div className='h-40 w-full'>
                  <MetricChart
                    metricKey={selectedMetric}
                    label={`${selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1)} Intake`}
                    unit={selectedMetric === 'sleep' ? 'hours' : selectedMetric === 'water' ? 'glasses' : 'hours'}
                    gradientId={`${selectedMetric}Gradient`}
                    startColor={selectedMetric === 'sleep'? '#B4CFFF': selectedMetric === 'water'? '#A8E6CF': '#FFBF69'}
                    endColor={selectedMetric === 'sleep'? '#83A2DB': selectedMetric === 'water'? '#56C596': '#FF6F61' }
                    
                    selectedDay={selectedDay}
                  />
                </div>
              </div>
            </div>
            

            {/* Your Goals */}
            <div className="bg-[#FDF5FF]/50 backdrop-blur-lg rounded-xl p-4  flex flex-col ">
              <h3 className="font-semibold text-lg mb-2 text-black">Your Goals</h3>
              <div className='flex-1 overflow-y-auto min-h-[16vh] max-h-[16vh] flex flex-col gap-3 custom-scrollbar pr-2'>
                <GoalList goals={goals} onComplete={handleCompleteGoal}  onEdit={handleEditGoal} onDelete={handleDeleteGoal} />
              </div>
            </div>
          </div>

          <div className=" col-span-2 flex flex-col gap-2">
            {/* Set Goals Form */}
            <div className="bg-[#FDF5FF]/40 backdrop-blur-lg rounded-xl p-4">
              <h3 className="font-semibold text-lg mb-2 text-black">Set Your Goals</h3>
              <FormInput  label="Title" name="goalTitle" placeholder="Enter your goal title" value={formData.goalTitle} onChange={handleInputChange} disabled={isGoalFormDisabled}/>
              <FormInput  label="Description" name="goalDescription" placeholder="Enter your goal description" value={formData.goalDescription} onChange={handleInputChange} textarea={true} disabled={isGoalFormDisabled} />
              <div className='flex items-center justify-between'>
                <DateTimeSelector value={formData.deadline} onChange={handleDeadlineChange} />
                <FormButton  label={editingGoalId ? "Update Goal" : "Create Goal"} onClick={handleCreateOrUpdateGoal} className={`bg-[#83A2DB] mt-6 cursor-pointer text-black ${isGoalFormDisabled ? 'opacity-50 cursor-not-allowed' : ''}`} disabled={isGoalFormDisabled} />
              </div>
            </div>
            
            {/* Streak Tracker */}
            <div className="bg-[#FDF5FF]/40 backdrop-blur-lg rounded-xl p-4">
              <h3 className="font-semibold text-lg mb-2 text-black">Streak Tracker</h3>
              <StreakTracker />
            </div>
          </div>
        </div>
      </div>
      <HabitTrackerFooter/>
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-gradient-to-b from-[#D9DCDB] to-[#83A2DB] p-6 rounded-lg w-full max-w-md shadow-lg relative">
            <h2 className="text-xl font-semibold mb-4 text-black">Daily Check-In</h2>
            <SliderComponent
              onSleepChange={setSleepHours}
              onWaterChange={setWaterIntake}
              onScreenTimeChange={setScreenTime}
            />
            <div className="flex justify-end mt-6 gap-2">
              <FormButton
                label="Cancel"
                onClick={() => setIsModalOpen(false)}
                className="bg-gray-200 hover:bg-gray-300 text-black"
              />
              <FormButton
                label="Save Progress"
                onClick={handleCheckInSubmit}
                className="bg-[#465775]  hover:bg-[#6f91c8] text-black"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
