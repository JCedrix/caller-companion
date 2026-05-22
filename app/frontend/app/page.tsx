import { QueueStub } from "@/components/QueueStub";

export default function HomePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          API smoke test
        </h1>
        <p className="text-text-secondary text-sm mt-1">
          Phase 3.3 stub. The real queue UI lands in Phase 3.5.
        </p>
      </div>
      <QueueStub />
    </div>
  );
}
