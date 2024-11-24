function CapsLock({ title }) {
  const capsLockText = String(title).toUpperCase();
  return <div>{capsLockText}</div>;
}

export default function StatusPage() {
  return (
    <>
      <h1>Status Page</h1>
      <CapsLock title="text test" />
    </>
  );
}
