// frontend/src/services/firebaseService.js

const BASE_URL = 'http://localhost:5555';

// Helper for Level Calculation
export const calculateLevel = (score) => {
    if (score <= 50) return 1;
    if (score <= 150) return 2;
    return 3;
};

// 1. Add User
export const addUser = async (data) => {
    const res = await fetch(`${BASE_URL}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to create user record');
    return await res.json();
};

// 2. Remove User
export const removeFirebaseUser = async (id) => {
    const res = await fetch(`${BASE_URL}/api/users/${id}`, {
        method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to delete user');
    return await res.json();
};

// 3. Add Attendance
export const addAttendance = async (data) => {
    const res = await fetch(`${BASE_URL}/api/attendance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to mark attendance');
    return await res.json();
};

// 4. Get All Users
export const getUsers = async () => {
    const res = await fetch(`${BASE_URL}/api/users`);
    if (!res.ok) throw new Error('Failed to fetch users');
    return await res.json();
};

// 5. Get User by UID
export const getUserByUid = async (uid) => {
    const res = await fetch(`${BASE_URL}/api/users/uid/${uid}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data || null;
};

// 6. Get User by Email
export const getUserByEmail = async (email) => {
    const res = await fetch(`${BASE_URL}/api/users/email/${email}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data || null;
};

// 7. Get User by EmployeeId/ID
export const getUserByEmployeeId = async (employeeId) => {
    // Try to search by employee ID
    let res = await fetch(`${BASE_URL}/api/users/employeeId/${employeeId}`);
    if (res.ok) {
        const data = await res.json();
        if (data) return data;
    }
    
    // Fallback: search by UID
    res = await fetch(`${BASE_URL}/api/users/uid/${employeeId}`);
    if (res.ok) {
        const data = await res.json();
        if (data) return data;
    }
    
    // Fallback: search all users for a matching _id
    const users = await getUsers();
    return users.find(u => u._id === employeeId || u.id === employeeId) || null;
};

// 8. Get Users by Role
export const getUsersByRole = async (role) => {
    const res = await fetch(`${BASE_URL}/api/users?role=${role}`);
    if (!res.ok) throw new Error('Failed to fetch users by role');
    return await res.json();
};

// 9. Get All Attendance
export const getAttendance = async () => {
    const res = await fetch(`${BASE_URL}/api/attendance`);
    if (!res.ok) throw new Error('Failed to fetch attendance');
    return await res.json();
};

// 10. Get Attendance by UserID
export const getAttendanceByUserId = async (userId) => {
    const res = await fetch(`${BASE_URL}/api/attendance/user/${userId}`);
    if (!res.ok) throw new Error('Failed to fetch user attendance');
    return await res.json();
};

// 11. Check if Attendance Exists
export const checkAttendanceExists = async (userId, date) => {
    const res = await fetch(`${BASE_URL}/api/attendance/check?userId=${userId}&date=${date}`);
    if (!res.ok) return false;
    const data = await res.json();
    return data.exists;
};

// 12. Update User Stats (on Scan)
export const updateUserStats = async (userId) => {
    const user = await getUserByUid(userId) || await getUserByEmployeeId(userId);
    if (!user) return null;
    
    const currentScore = user.score || 0;
    const currentStreak = user.streak || 0;
    const totalAttendance = user.totalAttendance || 0;
    
    const newScore = currentScore + 5;
    const newStreak = currentStreak + 1;
    const newTotalAttendance = totalAttendance + 1;
    
    const res = await fetch(`${BASE_URL}/api/users/${user._id || user.id}/stats`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            score: newScore,
            streak: newStreak,
            totalAttendance: newTotalAttendance,
            level: calculateLevel(newScore)
        })
    });
    
    if (!res.ok) throw new Error('Failed to update stats');
    return { score: newScore, streak: newStreak, totalAttendance: newTotalAttendance };
};

// 13. Assign Task
export const assignTask = async (taskData) => {
    const res = await fetch(`${BASE_URL}/api/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            ...taskData,
            status: "pending"
        })
    });
    if (!res.ok) throw new Error('Failed to assign task');
    return await res.json();
};

// 14. Complete Task
export const completeTask = async (taskId) => {
    const res = await fetch(`${BASE_URL}/api/tasks/${taskId}/complete`, {
        method: 'PUT'
    });
    if (!res.ok) throw new Error('Failed to complete task');
    return await res.json();
};

// 15. Verify Task
export const verifyTask = async (taskId, watchmanId, points, workerId) => {
    // 1. Update task status
    const taskRes = await fetch(`${BASE_URL}/api/tasks/${taskId}/verify`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verifiedBy: watchmanId })
    });
    if (!taskRes.ok) throw new Error('Failed to verify task');

    // 2. Reward worker
    await rewardTaskPoints(workerId, points);
    return true;
};

// 16. Reward Task Points
export const rewardTaskPoints = async (userId, points) => {
    const user = await getUserByUid(userId) || await getUserByEmployeeId(userId);
    if (!user) return null;

    const res = await fetch(`${BASE_URL}/api/users/uid/${user.uid}/reward`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ points })
    });
    if (!res.ok) throw new Error('Failed to reward points');
    const updated = await res.json();
    return updated.score;
};

// 17. Save Issue Report
export const saveReport = async ({ userId, userName, ward, description, timestamp }) => {
    if (!userId || !description?.trim()) throw new Error("Missing required report fields");
    const res = await fetch(`${BASE_URL}/api/reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            userId,
            userName: userName || "Unknown",
            ward: ward || "Unassigned",
            description: description.trim(),
            timestamp: timestamp || new Date().toISOString(),
            status: "open"
        })
    });
    if (!res.ok) throw new Error('Failed to save report');
    return await res.json();
};

// 18. Save Worker Feedback
export const saveFeedback = async ({ fromUserId, fromUserName, workerName, rating, comment, timestamp }) => {
    const numRating = Number(rating);
    if (!fromUserId || numRating < 1 || numRating > 5) throw new Error("Invalid feedback data");
    const res = await fetch(`${BASE_URL}/api/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            fromUserId,
            fromUserName: fromUserName || "Unknown",
            workerName: workerName || "Regional Team",
            rating: numRating,
            comment: comment?.trim() || "",
            timestamp: timestamp || new Date().toISOString()
        })
    });
    if (!res.ok) throw new Error('Failed to save feedback');
    return await res.json();
};

// 19. Add Location
export const addLocation = async (locationData) => {
    const res = await fetch(`${BASE_URL}/api/locations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(locationData)
    });
    if (!res.ok) throw new Error('Failed to add location log');
    return await res.json();
};

// 20. Get Locations by User ID
export const getLocationsByUserId = async (userId) => {
    const res = await fetch(`${BASE_URL}/api/locations/user/${userId}`);
    if (!res.ok) throw new Error('Failed to fetch location logs');
    return await res.json();
};

// 21. Add Work Photo
export const addWorkPhoto = async (photoData) => {
    const res = await fetch(`${BASE_URL}/api/work-photos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(photoData)
    });
    if (!res.ok) throw new Error('Failed to add work photo record');
    return await res.json();
};

// 22. Add Rating
export const addRating = async (ratingData) => {
    const res = await fetch(`${BASE_URL}/api/ratings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ratingData)
    });
    if (!res.ok) throw new Error('Failed to save rating');
    return await res.json();
};

// 23. Add Checkpoint
export const addCheckpoint = async (checkpointData) => {
    const res = await fetch(`${BASE_URL}/api/worker-checkpoints`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(checkpointData)
    });
    if (!res.ok) throw new Error('Failed to save checkpoint log');
    return await res.json();
};

// 24. Upload Work Photo (File Multer API)
export const uploadWorkPhoto = async (file) => {
    const formData = new FormData();
    formData.append('photo', file);
    
    const res = await fetch(`${BASE_URL}/api/upload`, {
        method: 'POST',
        body: formData
    });
    if (!res.ok) throw new Error('Failed to upload photo to server');
    return await res.json();
};

// --- REAL-TIME LISTENERS VIA POLLING ---

export const subscribeToTasks = (callback, filters = []) => {
    const fetchAndCallback = async () => {
        try {
            const res = await fetch(`${BASE_URL}/api/tasks`);
            if (res.ok) {
                const tasks = await res.json();
                callback(tasks);
            }
        } catch (err) {
            console.error("subscribeToTasks error:", err);
        }
    };
    
    fetchAndCallback();
    const interval = setInterval(fetchAndCallback, 3000);
    return () => clearInterval(interval);
};

export const subscribeToAttendance = (callback) => {
    const fetchAndCallback = async () => {
        try {
            const res = await fetch(`${BASE_URL}/api/attendance`);
            if (res.ok) {
                const attendance = await res.json();
                callback(attendance);
            }
        } catch (err) {
            console.error("subscribeToAttendance error:", err);
        }
    };
    
    fetchAndCallback();
    const interval = setInterval(fetchAndCallback, 3000);
    return () => clearInterval(interval);
};

export const subscribeToUsers = (callback) => {
    const fetchAndCallback = async () => {
        try {
            const res = await fetch(`${BASE_URL}/api/users`);
            if (res.ok) {
                const users = await res.json();
                callback(users);
            }
        } catch (err) {
            console.error("subscribeToUsers error:", err);
        }
    };
    
    fetchAndCallback();
    const interval = setInterval(fetchAndCallback, 3000);
    return () => clearInterval(interval);
};

export const subscribeToLiveLocation = (workerId, callback) => {
    const fetchAndCallback = async () => {
        try {
            const res = await fetch(`${BASE_URL}/api/locations/live/${workerId}`);
            if (res.ok) {
                const data = await res.json();
                callback(data);
            }
        } catch (err) {
            console.error("subscribeToLiveLocation error:", err);
        }
    };
    
    fetchAndCallback();
    const interval = setInterval(fetchAndCallback, 3000);
    return () => clearInterval(interval);
};