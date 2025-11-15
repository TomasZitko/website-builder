import { Monitor, Tablet, Smartphone, LucideIcon } from 'lucide-react';
import { useWebsiteStore, DeviceType } from '@/store/websiteStore';
import { cn } from '@/utils/cn';

const devices: { type: DeviceType; icon: LucideIcon; label: string }[] = [
  { type: 'desktop', icon: Monitor, label: 'Desktop' },
  { type: 'tablet', icon: Tablet, label: 'Tablet' },
  { type: 'mobile', icon: Smartphone, label: 'Mobile' }
];

export function DeviceToggle() {
  const { deviceType, setDeviceType } = useWebsiteStore();

  return (
    <div className="flex gap-2">
      {devices.map(({ type, icon: Icon, label }) => (
        <button
          key={type}
          onClick={() => setDeviceType(type)}
          className={cn(
            'flex items-center gap-2 px-3 py-2 rounded-md transition-all',
            deviceType === type
              ? 'bg-accent text-white'
              : 'text-text-muted hover:text-text hover:bg-border'
          )}
          title={label}
        >
          <Icon className="w-4 h-4" />
          {label}
        </button>
      ))}
    </div>
  );
}
