export default function GuardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="font-jakarta">
      {children}
    </div>
  );
}
