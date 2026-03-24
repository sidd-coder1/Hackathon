import { db } from "../firebase";
import { collection, addDoc, getDocs } from "firebase/firestore";

// ✅ Add User
export const addUser = async (data) => {
    return await addDoc(collection(db, "users"), data);
};

// ✅ Add Attendance
export const addAttendance = async (data) => {
    return await addDoc(collection(db, "attendance"), data);
};

// ✅ Get Users
export const getUsers = async () => {
    const snapshot = await getDocs(collection(db, "users"));
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));
};

// ✅ Get Attendance
export const getAttendance = async () => {
    const snapshot = await getDocs(collection(db, "attendance"));
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));
};