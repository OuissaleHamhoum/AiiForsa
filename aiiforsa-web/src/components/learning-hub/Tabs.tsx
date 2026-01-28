type Props = {
    tabs: string[];
    active: string;
    onChange: (t: string) => void;
};

export default function Tabs({ tabs, active, onChange }: Props) {
    return (
        <div className="flex gap-2 overflow-x-auto pb-2">
            {tabs.map(t => (
                <button
                    key={t}
                    onClick={() => onChange(t)}
                    className={`px-4 py-2 rounded-full whitespace-nowrap ${t === active ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                >
                    {t}
                </button>
            ))}
        </div>
    );
}
