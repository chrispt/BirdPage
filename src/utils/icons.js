import { createIcons, Bird, Binoculars, Bell, ChevronDown, Map as MapIcon, Moon, Settings, Smartphone, Sparkles, Sun, Volume2, X } from 'lucide';

const icons = { Bird, Binoculars, Bell, ChevronDown, Map: MapIcon, Moon, Settings, Smartphone, Sparkles, Sun, Volume2, X };

export function refreshIcons() {
    createIcons({ icons });
}
