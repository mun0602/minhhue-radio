import RadioPlayer from "@/components/RadioPlayer";

export default function Home() {
  return (
    <main style={{ padding: "0 0 24px 0", minHeight: "100vh" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 16px" }}>
        <RadioPlayer />
      </div>
    </main>
  );
}
