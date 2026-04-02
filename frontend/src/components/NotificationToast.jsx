// components/NotificationToast.jsx
import { useNotificationStore } from "../store/useNotificationStore";
import { X, MessageSquare, UserPlus } from "lucide-react";

const NotificationToast = () => {
  const { notifications, removeNotification } = useNotificationStore();

  return (
    <div className="fixed top-4 right-4 z-9999 flex flex-col gap-2 pointer-events-none">
  {notifications.map((n) => (
    <div
      key={n.id}
      className="pointer-events-auto flex items-center gap-3 w-80 px-4 py-3 rounded-2xl
        bg-white/10 dark:bg-white/5
        backdrop-blur-md
        border border-white/20 dark:border-white/10
        shadow-[0_8px_32px_rgba(0,0,0,0.12)]
        transition-all duration-300"
    >
      {/* Avatar or Icon */}
      {n.avatar ? (
        <img
          src={n.avatar}
          alt=""
          className="size-10 rounded-full object-cover shrink-0 ring-1 ring-white/30"
        />
      ) : (
        <div className="shrink-0 size-10 rounded-full flex items-center justify-center
          bg-white/20 dark:bg-white/10
          border border-white/30 dark:border-white/20
          text-white backdrop-blur-sm">
          {n.type === "message" ? (
            <MessageSquare className="size-5" />
          ) : (
            <UserPlus className="size-5" />
          )}
        </div>
      )}

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate text-white drop-shadow-sm">{n.title}</p>
        <p className="text-xs truncate text-white/60">{n.message}</p>
      </div>

      {/* Close button */}
      <button
        onClick={() => removeNotification(n.id)}
        className="shrink-0 size-6 rounded-full flex items-center justify-center
          bg-white/10 hover:bg-white/25
          border border-white/20
          text-white/70 hover:text-white
          transition-colors duration-150"
      >
        <X className="size-3" />
      </button>
    </div>
  ))}
</div>
  );
};

export default NotificationToast;