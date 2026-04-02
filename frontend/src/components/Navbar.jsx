import React, { useEffect } from 'react'
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import { DoorOpenIcon, HomeIcon, Loader, SettingsIcon, UserIcon, BellIcon, UserCheck, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useChatStore } from '../store/useChatStore';

const Navbar = () => {
    const navigate = useNavigate();
    const { selectedUser, setSelectedUser, typingUsers } = useChatStore();
    const { isLoading, logout, isAuthenticated } = useAuthStore();
    const {
        requestsInbox,
        requestsIgnored,
        getRequestsInbox,
        getRequestsIgnored,
        acceptFriendRequest,
        ignoreFriendRequest,
    } = useChatStore();

    useEffect(() => {
        if (isAuthenticated) {
            getRequestsInbox();
            getRequestsIgnored();
        }
    }, [isAuthenticated]);

    const handleLogout = async () => {
        try {
            await logout();
            toast.success("Logged out successfully!");
            setTimeout(() => {
                window.location.replace('/');
            }, 1500);
        } catch (error) {
            console.log(error.response.data);
            toast.error("Unable to log out");
        }
    }

    const handleNavigate = (path) => {
        setSelectedUser(null);
        navigate(path);
    };

    return (
        <div className='flex justify-between items-center p-3 bg-base-300'>
            <Link to={'/'} className='flex gap-1' onClick={() => setSelectedUser(null)}>
                <HomeIcon className='size-8' />
                <h1 className='text-2xl font-bold'>Chatrooms</h1>
            </Link>
            <div className='flex items-center gap-2'>

                <button className='btn btn-ghost' onClick={() => {
                    handleNavigate('/settings')

                }}>
                    <SettingsIcon />Settings
                </button>

                {isAuthenticated && <button className='btn btn-ghost' onClick={() => {
                    handleNavigate('/profile');
                }}>
                    <UserIcon />Profile
                </button>}

                {/* Requests Dropdown */}
                {isAuthenticated && (
                    <div className="dropdown dropdown-end">
                        <div tabIndex={0} role="button" className="btn btn-ghost">
                            <div className="indicator">
                                <BellIcon className="size-5" />
                                {requestsInbox.length > 0 && (
                                    <span className="badge badge-sm badge-primary indicator-item">
                                        {requestsInbox.length}
                                    </span>
                                )}
                            </div>
                            Requests
                        </div>

                        <ul tabIndex={0} className="dropdown-content z-50 menu shadow-lg bg-base-200 rounded-box w-80 p-2 mt-1">

                            <li className="menu-title">
                                <span>Friend Requests</span>
                            </li>

                            {requestsInbox.length === 0 && (
                                <li>
                                    <span className="text-base-content/50 text-sm py-2">
                                        No pending requests
                                    </span>
                                </li>
                            )}

                            {requestsInbox.map((reqUser) => (
                                <li key={reqUser._id}>
                                    <div className="flex items-center gap-2 py-2 hover:bg-base-300 rounded-lg">
                                        <img
                                            src={reqUser.profilePic ? `http://localhost:5000${reqUser.profilePic}` : "/avatar.png"}
                                            alt={reqUser.name}
                                            className="size-9 rounded-full object-cover"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-sm truncate">{reqUser.name}</p>
                                            <p className="text-xs text-base-content/50 truncate">@{reqUser.username}</p>
                                        </div>
                                        <div className="flex gap-1">
                                            <button
                                                className="btn btn-success btn-xs"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    acceptFriendRequest(reqUser._id);
                                                }}
                                            >
                                                <UserCheck className="size-3" />
                                            </button>
                                            <button
                                                className="btn btn-error btn-xs"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    ignoreFriendRequest(reqUser._id);
                                                }}
                                            >
                                                <X className="size-3" />
                                            </button>
                                        </div>
                                    </div>
                                </li>
                            ))}

                            <div className="divider my-1" />

                            {/* Nested ignored requests */}
                            <div className="collapse collapse-arrow bg-base-300 rounded-lg">
                                <input type="checkbox" />
                                <div className="collapse-title text-sm font-medium py-2 min-h-0">
                                    Ignored Requests ({requestsIgnored.length})
                                </div>
                                <div className="collapse-content px-1">
                                    {requestsIgnored.length === 0 && (
                                        <p className="text-base-content/50 text-xs py-1">
                                            No ignored requests
                                        </p>
                                    )}
                                    {requestsIgnored.map((reqUser) => (
                                        <div key={reqUser._id} className="flex items-center gap-2 py-2 hover:bg-base-200 rounded-lg px-1">
                                            <img
                                                src={reqUser.profilePic ? `http://localhost:5000${reqUser.profilePic}` : "/avatar.png"}
                                                alt={reqUser.name}
                                                className="size-8 rounded-full object-cover"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-sm truncate">{reqUser.name}</p>
                                                <p className="text-xs text-base-content/50 truncate">@{reqUser.username}</p>
                                            </div>
                                            <button
                                                className="btn btn-success btn-xs"
                                                onClick={() => acceptFriendRequest(reqUser._id)}
                                            >
                                                <UserCheck className="size-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                        </ul>
                    </div>
                )}

                {isLoading ? (
                    <button disabled className='btn btn-primary'>
                        <Loader className='animate-spin' />
                    </button>
                ) : (
                    <button onClick={handleLogout} className='btn btn-primary'>
                        <DoorOpenIcon />
                        Logout
                    </button>
                )}
            </div>
        </div>
    )
}

export default Navbar