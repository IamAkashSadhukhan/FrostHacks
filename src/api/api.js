import axios from "axios";

// 🔥 Create axios instance
const api = axios.create({
  baseURL: "http://localhost:8080",
});

// 🔥 REQUEST INTERCEPTOR → Attach JWT automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// 🔥 RESPONSE INTERCEPTOR → Handle unauthorized (auto logout)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.log("Unauthorized! Logging out...");

      localStorage.removeItem("token");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  },
);

// ================= AUTH =================
export const register = (data) => api.post("/auth/register", data);

export const login = async (data) => {
  const res = await api.post("/auth/login", data);

  // 🔥 Save token
  localStorage.setItem("token", res.data);

  return res;
};

// ================= CLASSROOM =================
export const createClassroom = (data) => api.post("/classroom/create", data);

export const joinClassroom = (code) => api.post(`/classroom/join?code=${code}`);

export const getMyClassrooms = () => api.get(`/classroom/my-classrooms`);

export const leaveClassroom = (classroomId) =>
  api.delete(`/classroom/${classroomId}/leave`);

export const deleteClassroom = (classroomId) =>
  api.delete(`/classroom/${classroomId}`);

export const getClassroomById = (id) => api.get(`/classroom/${id}`);

export const getMembers = (classroomId) =>
  api.get(`/classroom/${classroomId}/members`);

export const removeMember = (classroomId, userId) =>
  api.delete(`/classroom/${classroomId}/member/${userId}`);

export const addTeacher = (classroomId, userId) =>
  api.post(
    `/classroom/add-teacher?classroomId=${classroomId}&userId=${userId}`,
  );

// ================= SUBJECT =================
export const createSubject = (name, classroomId) =>
  api.post(`/subjects/create?name=${name}&classroomId=${classroomId}`);

export const getSubjects = (classroomId) =>
  api.get(`/subjects/classroom/${classroomId}`);

// ================= MATERIAL =================
export const uploadMaterial = (formData) =>
  api.post("/materials/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const getMaterials = (classroomId) =>
  api.get(`/materials/classroom/${classroomId}`);

export const getMaterial = (id) => api.get(`/materials/${id}`);

export const deleteMaterial = (id) => api.delete(`/materials/${id}`);

export const viewMaterial = (id) =>
  `${api.defaults.baseURL}/materials/view/${id}`;

export const getMaterialsBySubject = (classroomId, subjectId) =>
  api.get(`/classroom/${classroomId}/subject/${subjectId}`);

// ================= FAQ =================
export const getWeeklyFAQ = (subjectId) => api.get(`/faq/weekly/${subjectId}`);

// ================= AI =================
export const askAI = (question, subjectId, classroomId) =>
  api.post(
    `/ai/ask?question=${encodeURIComponent(question)}&subjectId=${subjectId}&classroomId=${classroomId}`,
  );
export const answerAI = (studentAnswer, classroomId) =>
  api.post(
    `/ai/answer?studentAnswer=${encodeURIComponent(studentAnswer)}&classroomId=${classroomId}`,
  );
// ================= PROGRESS (FIXED) =================

// ✅ 1. Mark material completed (JWT-based)
export const markMaterialCompleted = (materialId, classroomId) =>
  api.post(
    `/api/progress/complete?materialId=${materialId}&classroomId=${classroomId}`,
  );

// ✅ 2. Get MY progress (Student Dashboard)
export const getMyProgress = (classroomId) =>
  api.get(`/api/progress/my/${classroomId}`);

// ✅ 3. Get classroom progress (Teacher Dashboard)
export const getClassroomProgress = (classroomId) =>
  api.get(`/api/progress/classroom/${classroomId}`);

// ================= USER =================
export const getUserByEmail = (email) => api.get(`/users/email?email=${email}`);

// ================= LOGOUT =================
export const logout = () => {
  localStorage.clear();
  delete api.defaults.headers.common["Authorization"];
  window.location.href = "/login";
};
// ================= DASHBOARD =================
export const getAIQueriesCount = () => api.get("/dashboard/ai-queries-count");

export const getTotalStudents = () => api.get("/dashboard/total-students");

export const getActivities = () => api.get("/dashboard/activities");

export default api;
