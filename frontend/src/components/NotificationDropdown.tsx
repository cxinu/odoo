import { useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { useData } from "../contexts/DataContext"

interface NotificationDropdownProps {
  onClose: () => void
}

export default function NotificationDropdown({ onClose }: NotificationDropdownProps) {
  const { user } = useAuth()
  const { notifications, markNotificationRead } = useData()
  const navigate = useNavigate()
  const dropdownRef = useRef<HTMLDivElement>(null)

  const userNotifications = user ? notifications.filter((n) => n.userId === user.id).slice(0, 10) : []

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [onClose])

  const handleNotificationClick = (notification: any) => {
    markNotificationRead(notification.id)
    if (notification.questionId) {
      navigate(`/question/${notification.questionId}`)
    }
    onClose()
  }

  return (
    <div ref={dropdownRef} className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border z-50">
      <div className="p-4 border-b">
        <h3 className="font-semibold text-gray-900">Notifications</h3>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {userNotifications.length === 0 ? (
          <div className="p-4 text-center text-gray-500">No notifications yet</div>
        ) : (
          userNotifications.map((notification) => (
            <div
              key={notification.id}
              onClick={() => handleNotificationClick(notification)}
              className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                !notification.read ? "bg-blue-50" : ""
              }`}
            >
              <p className="text-sm text-gray-900">{notification.message}</p>
              <p className="text-xs text-gray-500 mt-1">{new Date(notification.createdAt).toLocaleDateString()}</p>
              {!notification.read && <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
