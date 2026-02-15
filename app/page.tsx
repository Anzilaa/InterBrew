import Background from "./components/Background";

export default function Home() {
  return (
    <div className="relative min-h-screen">
      <Background />
      <div className="relative z-10 flex items-center justify-center min-h-screen">
        <h1 className="text-2xl font-semibold">hello world</h1>
      </div>
    </div>
  );
}
