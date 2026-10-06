export default function ClientLayout({
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
