export default function Loader() {
    return (
        <div className="grid grid-cols-1 gap-4">
            {[1, 2, 3, 4].map(i => (
                <div
                    key={i}
                    className="border rounded-lg p-4 animate-pulse bg-slate-50"
                    style={{ minHeight: 96 }}
                />
            ))}
        </div>
    );
}
