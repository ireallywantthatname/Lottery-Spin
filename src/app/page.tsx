import SpinWheel from "@/components/SpinWheel";

export default function Home() {
  return (
    <main className="min-h-dvh grid place-items-center p-8">
      <div className="flex flex-col items-center gap-8">
        <h1 className="text-4xl md:text-5xl font-bold">Spin & Win</h1>
        <p className="text-lg text-gray-600">Try your luck for a discount!</p>
        <SpinWheel />
      </div>
    </main>
  );
}
