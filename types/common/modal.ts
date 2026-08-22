export interface SelectModalState {
  message: string;
  onConfirm: () => void;
  onCancel?: () => void;
}
