// components/common/modals/GlobalModals.tsx
import TopicModal from "./components/common/modals/TopicModal";
import AlertModal from "./components/common/modals/AlertModal";
import RoomModal from "./components/common/modals/room/RoomModal";
import LoginModal from "./components/common/modals/LoginModal";
import SelectModal from "./components/common/modals/SelectModal";

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
