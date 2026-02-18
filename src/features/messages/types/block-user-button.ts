export interface BlockUserButtonProps {
  userId: string;
  userName: string;
  isBlocked?: boolean;
  onBlockChange?: () => void;
}
