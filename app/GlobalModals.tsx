// components/common/modals/GlobalModals.tsx
import TopicModal from "./components/modals/TopicModal";
import AlertModal from "./components/modals/notification/AlertModal";
import RoomModal from "./components/modals/room/RoomModal";
import LoginModal from "./components/modals/notification/LoginModal";
import SelectModal from "./components/modals/SelectModal";

export default function GlobalModals() {
  return (
    <>
      <TopicModal />
      <AlertModal />
      <SelectModal />
      <RoomModal />
      <LoginModal />
    </>
  );
}
