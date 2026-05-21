import RoomProvider from "./RoomProvider";

export default async function RoomLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <RoomProvider roomId={id}>{children}</RoomProvider>;
}
