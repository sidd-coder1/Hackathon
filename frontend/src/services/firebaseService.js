import { db } from "../firebase";
import { 
    collection, 
    addDoc, 
    getDocs, 
    query, 
    where, 
    updateDoc, 
    deleteDoc, 
    doc, 
    serverTimestamp, 
    onSnapshot,
    orderBy,
    Timestamp
} from "firebase/firestore";

// Helper for Level Calculation
export const calculateLevel = (score) => {
    if (score <= 50) return 1;
    if (score <= 150) return 2;
    return 3;
};

// ✅ Add User
export const addUser = async (data) => {
    return await addDoc(collection(db, "users"), data);
};

// ✅ Remove User from Firestore
export const removeFirebaseUser = async (id) => {
    return await deleteDoc(doc(db, "users", id));
};

// ✅ Add Attendance
export const addAttendance = async (data) => {
    return await addDoc(collection(db, "attendance"), data);
};

// ✅ Get All Users
export const getUsers = async () => {
    const snapshot = await getDocs(collection(db, "users"));
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));
};

// ✅ Get User by UID
export const getUserByUid = async (uid) => {
    const q = query(collection(db, "users"), where("uid", "==", uid));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
        return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
    }
    return null;
};

// ✅ Get User by Email
export const getUserByEmail = async (email) => {
    const q = query(collection(db, "users"), where("email", "==", email));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
        return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
    }
    return null;
};

// ✅ Get All Attendance
export const getAttendance = async () => {
    const snapshot = await getDocs(collection(db, "attendance"));
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));
};

// ✅ Check if attendance exists
export const checkAttendanceExists = async (userId, date) => {
    const q = query(collection(db, "attendance"), where("userId", "==", userId), where("date", "==", date));
    const snapshot = await getDocs(q);
    return !snapshot.empty;
};

// ✅ Update User Stats (on Attendance Scan)
export const updateUserStats = async (userId) => {
    const q = query(collection(db, "users"), where("uid", "==", userId));
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
        const userDoc = snapshot.docs[0];
        const userData = userDoc.data();
        
        const currentScore = userData.score || 0;
        const currentStreak = userData.streak || 0;
        const totalAttendance = userData.totalAttendance || 0;
        
        const newScore = currentScore + 5;
        const newStreak = currentStreak + 1;
        const newTotalAttendance = totalAttendance + 1;
        
        await updateDoc(doc(db, "users", userDoc.id), {
            score: newScore,
            streak: newStreak,
            totalAttendance: newTotalAttendance,
            level: calculateLevel(newScore)
        });
        
        return { score: newScore, streak: newStreak, totalAttendance: newTotalAttendance };
    }
    return null;
};

// --- Task Management ---

// ✅ Assign Task
export const assignTask = async (taskData) => {
    return await addDoc(collection(db, "tasks"), {
        ...taskData,
        status: "pending",
        createdAt: serverTimestamp()
    });
};

// ✅ Complete Task (Worker)
export const completeTask = async (taskId) => {
    const taskRef = doc(db, "tasks", taskId);
    return await updateDoc(taskRef, {
        status: "completed",
        completedAt: serverTimestamp()
    });
};

// ✅ Verify Task (Area Watchman)
export const verifyTask = async (taskId, watchmanId, points, workerId) => {
    const taskRef = doc(db, "tasks", taskId);
    
    // 1. Update task status
    await updateDoc(taskRef, {
        status: "verified",
        verifiedBy: watchmanId,
        verifiedAt: serverTimestamp()
    });

    // 2. Reward worker
    const q = query(collection(db, "users"), where("uid", "==", workerId));
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
        const userDoc = snapshot.docs[0];
        const userData = userDoc.data();
        const newScore = (userData.score || 0) + parseInt(points);
        const newTotalAttendance = (userData.totalAttendance || 0) + 1;

        await updateDoc(doc(db, "users", userDoc.id), {
            score: newScore,
            totalAttendance: newTotalAttendance,
            level: calculateLevel(newScore)
        });
    }
    return true;
};

// --- Real-time Listeners ---

export const subscribeToTasks = (callback, filters = []) => {
    let q = query(collection(db, "tasks"), orderBy("createdAt", "desc"));
    if (filters.length > 0) {
        q = query(collection(db, "tasks"), ...filters, orderBy("createdAt", "desc"));
    }
    return onSnapshot(q, (snapshot) => {
        const tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        callback(tasks);
    });
};

export const subscribeToAttendance = (callback) => {
    const q = query(collection(db, "attendance"), orderBy("timestamp", "desc"));
    return onSnapshot(q, (snapshot) => {
        const attendance = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        callback(attendance);
    });
};

export const subscribeToUsers = (callback) => {
    const q = query(collection(db, "users"));
    return onSnapshot(q, (snapshot) => {
        const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        callback(users);
    });
};

// --- Reward Logic ---

// ✅ Reward Task Points
export const rewardTaskPoints = async (userId, points) => {
    const q = query(collection(db, "users"), where("uid", "==", userId));
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
        const userDoc = snapshot.docs[0];
        const userData = userDoc.data();
        
        const newScore = (userData.score || 0) + parseInt(points);
        
        await updateDoc(doc(db, "users", userDoc.id), {
            score: newScore,
            level: calculateLevel(newScore)
        });
        return newScore;
    }
    return null;
};