export function StartCallButton({ onClick }: { onClick: () => void }) {
  return (
    <div className="flex justify-end">
      <button
        type="button"
        onClick={onClick}
        className="bg-indigo hover:bg-indigo-bright transition-colors duration-200 ease-cc text-white font-medium text-sm px-6 py-3 rounded-lg"
      >
        Start call →
      </button>
    </div>
  );
}
