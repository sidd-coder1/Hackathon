import { db } from "../firebase";
import { collection, addDoc, getDocs, query, where, updateDoc, deleteDoc, doc } from "firebase/firestore";

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

// ✅ Update User Stats
export const updateUserStats = async (userId) => {
    const q = query(collection(db, "users"), where("id", "==", userId));
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
        const userDoc = snapshot.docs[0];
        const userData = userDoc.data();
        
        const currentScore = userData.score || 0;
        const currentStreak = userData.streak || 0;
        const totalAttendance = userData.totalAttendance || 0;
        const lastDate = userData.lastAttendanceDate;
        
        const today = new Date().toISOString().split('T')[0];
        
        if (lastDate === today) return null; // Already updated today
        
        let newStreak = currentStreak + 1;
        let newScore = currentScore + 10;
        
        if (newStreak % 5 === 0) {
            newScore += 20; // Bonus
        }
        
        await updateDoc(doc(db, "users", userDoc.id), {
            score: newScore,
            streak: newStreak,
            totalAttendance: totalAttendance + 1,
            lastAttendanceDate: today
        });
        
        return { score: newScore, streak: newStreak };
    }
    return null;
};